import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle, Loader2, Eye, Copy, Download, Zap } from 'lucide-react';
import { scanAPI } from '../services/api';
import { formatBytes, getComplianceColor, getComplianceBgColor } from '../lib/utils';

// ============================================
// TERMINAL FEED COMPONENT - Hacker Terminal
// ============================================
function ProcessingTerminal({ logs, isActive }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="family glass glass-dark rounded-xl border border-green-500/30 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-black/50 border-b border-green-500/30 px-4 py-3 flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-mono text-sm text-green-400">$ legalguard-auditlog.sh</span>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="p-4 h-48 overflow-y-auto font-mono text-xs text-green-400 space-y-1 bg-black/30"
      >
        {logs.length === 0 ? (
          <div className="text-green-500/50">
            <p> Ready. Awaiting image upload...</p>
            <p> Type 'scan' to begin neural analysis</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="text-green-400">{log.time} | </span>
              <span className={log.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                {log.message}
              </span>
            </motion.div>
          ))
        )}
        {isActive && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-green-400"
          >
            ▌
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

// ===============================================
// COMPLIANCE TILES - Visual Status Cards
// ===============================================
function ComplianceTile({ field, status, confidence, piiDetected }) {
  const isFound = status === 'FOUND';
  const isPII = piiDetected;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl p-4 border backdrop-blur-md overflow-hidden transition-all duration-300 ${
        isPII
          ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20'
          : isFound
          ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
          : 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
      }`}
    >
      {/* Animated Background Glow */}
      {isFound && !isPII && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      {!isFound && !isPII && (
        <motion.div
          animate={{ opacity: [0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border-t border-yellow-500/30"
        ></motion.div>
      )}
      {isPII && (
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(239,68,68,0.3)', '0 0 30px rgba(239,68,68,0.5)'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-xl"
        ></motion.div>
      )}

      <div className="relative z-10">
        {/* Field Name */}
        <h4 className="text-sm font-bold text-gray-100 mb-2">{field}</h4>

        {/* Status Indicator */}
        <div className="flex items-center justify-between mb-2">
          {isPII ? (
            <span className="px-2 py-1 text-xs font-semibold bg-red-500/30 text-red-300 rounded border border-red-500/50">
              🔓 PII Detected
            </span>
          ) : isFound ? (
            <span className="px-2 py-1 text-xs font-semibold bg-green-500/30 text-green-300 rounded border border-green-500/50">
              ✓ Found
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/30 text-yellow-300 rounded border border-yellow-500/50">
              ⚠ Missing
            </span>
          )}
          {confidence > 0 && (
            <span className="text-xs font-mono text-gray-400">{confidence}%</span>
          )}
        </div>

        {/* Confidence Bar */}
        {confidence > 0 && (
          <div className="w-full h-1 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${
                isPII
                  ? 'bg-red-500'
                  : isFound
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
              }`}
            ></motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ===============================================
// IMAGE CANVAS - Interactive Bounding Boxes
// ===============================================
function ImageCanvas({ imageBase64, coordinates, showProcessed = false, processedImageBase64 }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = showProcessed ? processedImageBase64 : imageBase64;
  }, [imageBase64, processedImageBase64, showProcessed]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
      {/* Main Image */}
      <img
        src={showProcessed && processedImageBase64 ? processedImageBase64 : imageBase64}
        alt={showProcessed ? 'Processed' : 'Original'}
        className="w-full h-auto"
      />

      {/* SVG Overlay for Bounding Boxes */}
      {!showProcessed && coordinates?.items && coordinates.items.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="none"
        >
          {coordinates.items.map((item, idx) => (
            <motion.g key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Animated Border */}
              <motion.rect
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                fill="none"
                stroke={item.confidence > 80 ? '#10b981' : '#f59e0b'}
                strokeWidth="2"
                rx="2"
                initial={{ strokeDasharray: '1000' }}
                animate={{ strokeDasharray: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.05 }}
              />

              {/* Glow Effect */}
              <rect
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                fill="none"
                stroke={item.confidence > 80 ? '#10b98180' : '#f59e0b80'}
                strokeWidth="4"
                rx="2"
                opacity="0.3"
              />

              {/* Label */}
              <motion.rect
                x={item.x}
                y={Math.max(0, item.y - 25)}
                width={Math.max(60, item.text.length * 6)}
                height="20"
                fill={item.confidence > 80 ? '#10b981' : '#f59e0b'}
                rx="3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: idx * 0.05 + 0.3 }}
              />
              <motion.text
                x={item.x + 3}
                y={Math.max(0, item.y - 9)}
                fontSize="12"
                fill="white"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 + 0.4 }}
              >
                {item.text.substring(0, 10)}
              </motion.text>

              {/* Confidence Percentage */}
              <motion.text
                x={item.x + item.w / 2}
                y={item.y + item.h + 15}
                fontSize="11"
                fill={item.confidence > 80 ? '#10b981' : '#f59e0b'}
                textAnchor="middle"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
              >
                {Math.round(item.confidence)}%
              </motion.text>
            </motion.g>
          ))}
        </svg>
      )}
    </div>
  );
}

// =====================================================
// MAIN SCANNER COMPONENT
// =====================================================
export default function ScannerAI() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [tamilSupport, setTamilSupport] = useState(false);
  const [error, setError] = useState('');
  const [useSmartAudit, setUseSmartAudit] = useState(true);
  const [showProcessed, setShowProcessed] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Add log to terminal feed
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setTerminalLogs((prev) => [...prev, { time: timestamp, message, type }]);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError('');
      setTerminalLogs([]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        addLog(`Image loaded: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  const handleScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');
    setTerminalLogs([]);
    addLog('🚀 Initializing neural network...');
    addLog('📊 Loading compliance database...');

    try {
      // Simulate processing steps
      const processingSteps = [
        'Extracting text with OCR engine...',
        'Running fuzzy keyword matching...',
        'Detecting PII in image...',
        'Analyzing image tampering (ELA)...',
        'Generating visual analysis...',
        'Building compliance report...',
      ];

      for (const step of processingSteps) {
        addLog(step);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // Call API
      const scanResult = useSmartAudit
        ? await scanAPI.smartScan(selectedFile, tamilSupport)
        : await scanAPI.scanImage(selectedFile, tamilSupport);

      addLog('✅ Analysis complete!', 'success');
      setResult(scanResult);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Scan failed. Please try again.';
      setError(errorMsg);
      addLog(`❌ Error: ${errorMsg}`, 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setTerminalLogs([]);
    setShowProcessed(false);
  };

  // Extract compliance results
  const complianceResults = result?.compliance_results || [];
  const foundResults = complianceResults.filter((r) => r.status === 'FOUND');
  const missingResults = complianceResults.filter((r) => r.status !== 'FOUND');

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glass-dark rounded-xl p-8 border border-white/10 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              🤖 AI Audit Scanner
            </h1>
            <p className="text-gray-400">
              Advanced compliance verification with Explainable AI, Fuzzy Matching & Forgery Detection
            </p>
          </div>
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
            <span className="text-green-400 text-sm font-semibold">● NEURAL NETWORK ONLINE</span>
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Upload & Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass glass-dark rounded-xl p-6 border border-white/10"
          >
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-cyan-500 bg-cyan-500/10 scale-105'
                    : 'border-gray-600 hover:border-cyan-400 hover:bg-white/5'
                }`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={{ y: isDragActive ? -10 : 0 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ scale: isDragActive ? 1.2 : 1 }}
                    className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mb-4"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-100 mb-2">
                    {isDragActive ? '🎯 Drop Here!' : 'Drag Image Here'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">or click to browse</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP • Max 10MB</p>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative rounded-lg overflow-hidden bg-gray-900/50 border border-white/10">
                  <img src={preview} alt="Preview" className="w-full h-40 object-contain" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors backdrop-blur"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* File Info */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
                </div>

                {/* Smart Audit Toggle */}
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-200">
                      <Zap className="w-4 h-4 inline mr-2 text-yellow-400" />
                      AI Auditor Mode
                    </span>
                    <button
                      onClick={() => setUseSmartAudit(!useSmartAudit)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useSmartAudit ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}
                    >
                      <motion.span
                        layout
                        className="inline-block h-5 w-5 bg-white rounded-full"
                        animate={{ x: useSmartAudit ? 20 : 2 }}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    {useSmartAudit
                      ? '✓ Advanced AI features enabled'
                      : '○ Standard scan mode'}
                  </p>
                </div>

                {/* Tamil Support Toggle */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-200">Tamil OCR</span>
                    <button
                      onClick={() => setTamilSupport(!tamilSupport)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tamilSupport ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <motion.span
                        layout
                        className="inline-block h-5 w-5 bg-white rounded-full"
                        animate={{ x: tamilSupport ? 20 : 2 }}
                      />
                    </button>
                  </div>
                </div>

                {/* Scan Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scanning ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      Analyzing...
                    </span>
                  ) : (
                    'Start AI Audit'
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>

        {/* CENTER + RIGHT COLUMN - Results */}
        <div className="xl:col-span-2 space-y-6">
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start space-x-3 backdrop-blur"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* COMPARISON TOGGLE + IMAGE CANVAS */}
              {useSmartAudit && result.processed_image && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass glass-dark rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* Toggle Header */}
                  <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-bold text-gray-100">Interactive Analysis Canvas</h3>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowProcessed(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          !showProcessed
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        🔍 Raw + Boxes
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowProcessed(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          showProcessed
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        🔐 PII Masked
                      </motion.button>
                    </div>
                  </div>

                  {/* Image Canvas */}
                  <div className="p-4">
                    <ImageCanvas
                      imageBase64={preview}
                      coordinates={result.coordinates_data}
                      showProcessed={showProcessed}
                      processedImageBase64={
                        result.processed_image
                          ? `data:image/png;base64,${result.processed_image}`
                          : null
                      }
                    />
                  </div>
                </motion.div>
              )}

              {/* COMPLIANCE TILES GRID */}
              {useSmartAudit && complianceResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass glass-dark rounded-xl border border-white/10 p-6"
                >
                  <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    Compliance Audit Results
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {complianceResults.map((item, idx) => (
                      <ComplianceTile
                        key={idx}
                        field={item.field}
                        status={item.status}
                        confidence={item.confidence}
                        piiDetected={false}
                      />
                    ))}
                    {result.pii_detected?.map((piiType, idx) => (
                      <ComplianceTile
                        key={`pii-${idx}`}
                        field={piiType.toUpperCase()}
                        status="DETECTED"
                        confidence={100}
                        piiDetected={true}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* FORGERY ALERT */}
              {useSmartAudit && result.tamper_alert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass glass-dark rounded-xl border border-red-500/50 bg-red-500/10 p-6"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(239,68,68,0.3)',
                          '0 0 20px rgba(239,68,68,0.5)',
                        ],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <AlertCircle className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-red-300 mb-1">🚨 Tampering Detected</h4>
                      <p className="text-sm text-red-200 mb-2">
                        Error Level Analysis indicates possible image forgery
                      </p>
                      <div className="flex gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">Tamper Score: </span>
                          <span className="text-red-300 font-bold">
                            {(result.tamper_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        {result.tamper_reason && (
                          <div>
                            <span className="text-gray-400">Reason: </span>
                            <span className="text-red-300">{result.tamper_reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STATUS SUMMARY */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* Overall Status */}
                <div
                  className={`glass glass-dark rounded-xl p-6 border ${
                    result.compliance_status === 'COMPLIANT'
                      ? 'border-green-500/50'
                      : 'border-red-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {result.compliance_status === 'COMPLIANT' ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <X className="w-6 h-6 text-red-400" />
                    )}
                    <p className="text-xs text-gray-400">Overall Status</p>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      result.compliance_status === 'COMPLIANT'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {result.compliance_status}
                  </p>
                </div>

                {/* Confidence Score */}
                <div className="glass glass-dark rounded-xl p-6 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">AI Confidence</p>
                  <p className="text-2xl font-bold text-cyan-400 mb-2">
                    {result.confidence_score.toFixed(1)}%
                  </p>
                  <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence_score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    />
                  </div>
                </div>
              </motion.div>

              {/* EXTRACTED TEXT */}
              {result.extracted_text && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass glass-dark rounded-xl p-6 border border-white/10"
                >
                  <h3 className="text-sm font-bold text-gray-100 mb-3">Extracted Text (OCR)</h3>
                  <pre className="text-xs text-gray-300 bg-black/50 p-4 rounded-lg max-h-32 overflow-y-auto">
                    {result.extracted_text}
                  </pre>
                </motion.div>
              )}

              {/* Processing Time */}
              <div className="text-center text-xs text-gray-500">
                ⏱️ Processing time: {result.processing_time_ms?.toFixed(0) || '?'}ms
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass glass-dark rounded-xl p-12 border border-white/10 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                <Eye className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-2">Ready for Scan</h3>
              <p className="text-gray-400 text-sm">
                Upload an image to begin neural analysis
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* BOTTOM - TERMINAL FEED */}
      {scanning || terminalLogs.length > 0 ? (
        <ProcessingTerminal logs={terminalLogs} isActive={scanning} />
      ) : null}
    </div>
  );
}
