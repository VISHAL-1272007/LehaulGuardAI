import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, AlertCircle, Maximize2, X, Smartphone, Zap } from 'lucide-react';
import { scanAPI } from '../services/api';

// ============================================
// IMAGE STABILITY DETECTION ALGORITHM
// ============================================
class StabilityDetector {
  constructor(frameSampleSize = 5, threshold = 0.85) {
    this.frames = [];
    this.frameSampleSize = frameSampleSize;
    this.threshold = threshold;
  }

  /**
   * Calculate hash of image for comparison
   * Uses simple pixel sampling to avoid expensive operations
   */
  getImageHash(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Sample every 100th pixel (4 channels per pixel)
    let hash = 0;
    for (let i = 0; i < data.length; i += 400) {
      hash += data[i] + data[i + 1] + data[i + 2];
    }
    return hash;
  }

  /**
   * Calculate similarity between two hashes (0-1, 1=identical)
   */
  calculateSimilarity(hash1, hash2) {
    const diff = Math.abs(hash1 - hash2);
    const maxDiff = 255 * 100; // Approximate max difference
    return Math.max(0, 1 - diff / maxDiff);
  }

  /**
   * Check if current frame is stable
   * Returns { isStable: boolean, similarity: number }
   */
  checkStability(canvas) {
    const hash = this.getImageHash(canvas);
    this.frames.push(hash);

    // Keep only last N frames
    if (this.frames.length > this.frameSampleSize) {
      this.frames.shift();
    }

    // Need at least 2 frames to compare
    if (this.frames.length < 2) {
      return { isStable: false, similarity: 0 };
    }

    // Calculate average similarity between consecutive frames
    let totalSimilarity = 0;
    for (let i = 1; i < this.frames.length; i++) {
      const similarity = this.calculateSimilarity(this.frames[i - 1], this.frames[i]);
      totalSimilarity += similarity;
    }
    const avgSimilarity = totalSimilarity / (this.frames.length - 1);

    // Consider stable if average similarity exceeds threshold
    const isStable = avgSimilarity >= this.threshold;

    return { isStable, similarity: avgSimilarity };
  }

  reset() {
    this.frames = [];
  }
}

// ============================================
// SCANNER OVERLAY COMPONENT
// ============================================
function ScannerOverlay({ width, height, isStable }) {
  const overlayWidth = Math.min(width * 0.85, 320);
  const overlayHeight = overlayWidth * 1.4; // Aspect ratio for product labels
  const offsetX = (width - overlayWidth) / 2;
  const offsetY = (height - overlayHeight) / 2;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Semi-transparent dark overlay outside the frame */}
      <defs>
        <mask id="scanner-mask">
          {/* White rectangle = visible, black = hidden */}
          <rect width={width} height={height} fill="black" />
          <rect
            x={offsetX}
            y={offsetY}
            width={overlayWidth}
            height={overlayHeight}
            fill="white"
          />
        </mask>
      </defs>

      {/* Dark overlay with mask */}
      <rect
        width={width}
        height={height}
        fill="rgba(0,0,0,0.6)"
        mask="url(#scanner-mask)"
      />

      {/* Animated corner brackets */}
      <g
        stroke={isStable ? '#10b981' : '#f59e0b'}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      >
        {/* Top-left */}
        <line x1={offsetX} y1={offsetY + 20} x2={offsetX} y2={offsetY} />
        <line x1={offsetX} y1={offsetY} x2={offsetX + 20} y2={offsetY} />

        {/* Top-right */}
        <line
          x1={offsetX + overlayWidth - 20}
          y1={offsetY}
          x2={offsetX + overlayWidth}
          y2={offsetY}
        />
        <line x1={offsetX + overlayWidth} y1={offsetY} x2={offsetX + overlayWidth} y2={offsetY + 20} />

        {/* Bottom-left */}
        <line
          x1={offsetX}
          y1={offsetY + overlayHeight - 20}
          x2={offsetX}
          y2={offsetY + overlayHeight}
        />
        <line
          x1={offsetX}
          y1={offsetY + overlayHeight}
          x2={offsetX + 20}
          y2={offsetY + overlayHeight}
        />

        {/* Bottom-right */}
        <line
          x1={offsetX + overlayWidth - 20}
          y1={offsetY + overlayHeight}
          x2={offsetX + overlayWidth}
          y2={offsetY + overlayHeight}
        />
        <line
          x1={offsetX + overlayWidth}
          y1={offsetY + overlayHeight - 20}
          x2={offsetX + overlayWidth}
          y2={offsetY + overlayHeight}
        />
      </g>

      {/* Center crosshair */}
      <line
        x1={offsetX + overlayWidth / 2 - 15}
        y1={offsetY + overlayHeight / 2}
        x2={offsetX + overlayWidth / 2 + 15}
        y2={offsetY + overlayHeight / 2}
        stroke={isStable ? '#10b981' : '#f59e0b'}
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1={offsetX + overlayWidth / 2}
        y1={offsetY + overlayHeight / 2 - 15}
        x2={offsetX + overlayWidth / 2}
        y2={offsetY + overlayHeight / 2 + 15}
        stroke={isStable ? '#10b981' : '#f59e0b'}
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Corner indicators */}
      {[
        { x: offsetX - 5, y: offsetY - 5 },
        { x: offsetX + overlayWidth + 5, y: offsetY - 5 },
        { x: offsetX - 5, y: offsetY + overlayHeight + 5 },
        { x: offsetX + overlayWidth + 5, y: offsetY + overlayHeight + 5 },
      ].map((pos, idx) => (
        <motion.circle
          key={idx}
          cx={pos.x}
          cy={pos.y}
          r="6"
          fill={isStable ? '#10b981' : '#f59e0b'}
          animate={{ r: isStable ? 6 : 8 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </svg>
  );
}

// ============================================
// STABILITY INDICATOR BAR
// ============================================
function StabilityIndicator({ similarity, isStable, autoCapturingIn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-3"
    >
      {/* Stability Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center gap-2">
            {isStable ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                STABLE
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                STABILIZING...
              </>
            )}
          </span>
          <span className="text-xs text-gray-300">{Math.round(similarity * 100)}%</span>
        </div>

        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${similarity * 100}%` }}
            transition={{ duration: 0.3 }}
            className={`h-full ${isStable ? 'bg-green-500' : 'bg-yellow-500'}`}
          />
        </div>
      </div>

      {/* Auto-Capture Countdown */}
      {autoCapturingIn > 0 && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-between bg-green-500/20 border border-green-500/50 rounded px-3 py-2"
        >
          <span className="text-xs font-semibold text-green-300">
            <Zap className="w-3 h-3 inline mr-2" />
            AUTO-CAPTURING IN...
          </span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-lg font-bold text-green-400"
          >
            {autoCapturingIn}
          </motion.span>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center text-xs text-gray-300">
        {isStable ? '✓ Image stable • Ready to capture' : '⌛ Keep the label steady...'}
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN MOBILE SCANNER COMPONENT
// ============================================
export default function MobileScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stabilityDetectorRef = useRef(new StabilityDetector());
  const frameIntervalRef = useRef(null);
  const autoCaptureTimeoutRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending'); // pending, granted, denied
  const [similarity, setSimilarity] = useState(0);
  const [isStable, setIsStable] = useState(false);
  const [autoCapturingIn, setAutoCapturingIn] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('camera'); // 'camera' or 'result'
  const [tamilSupport, setTamilSupport] = useState(false);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermission('granted');
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setCameraPermission('denied');
        setError('Camera permission denied. Please allow camera access to use the scanner.');
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture frames for stability detection
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    frameIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Flip horizontally (mirror) for front camera if needed
        ctx.drawImage(video, 0, 0);

        // Check stability
        const { isStable: stable, similarity: sim } = stabilityDetectorRef.current.checkStability(
          canvas
        );

        setSimilarity(sim);
        setIsStable(stable);

        // Auto-capture logic
        if (stable && autoCapturingIn === 0) {
          // Start countdown
          setAutoCapturingIn(3);
          let countdown = 3;

          if (autoCaptureTimeoutRef.current) clearTimeout(autoCaptureTimeoutRef.current);

          autoCaptureTimeoutRef.current = setInterval(() => {
            countdown--;
            setAutoCapturingIn(countdown);

            if (countdown === 0) {
              clearInterval(autoCaptureTimeoutRef.current);
              handleAutoCapture();
            }
          }, 1000);
        } else if (!stable && autoCapturingIn > 0) {
          // Reset countdown if image becomes unstable
          clearInterval(autoCaptureTimeoutRef.current);
          setAutoCapturingIn(0);
        }
      }
    }, 200); // Check every 200ms

    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (autoCaptureTimeoutRef.current) clearInterval(autoCaptureTimeoutRef.current);
    };
  }, [cameraActive, autoCapturingIn]);

  // Manual capture
  const handleManualCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setLastPhoto(photoData);
    setViewMode('result');

    // Stop camera to save battery
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  // Auto capture
  const handleAutoCapture = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setCapturing(true);
    setAutoCapturingIn(0);

    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setLastPhoto(photoData);

    // Stop camera
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }

    // Scan the photo
    await scanPhoto(photoData);
  };

  // Scan captured photo
  const scanPhoto = async (photoData) => {
    try {
      setError(null);

      // Convert Base64 to Blob
      const response = await fetch(photoData);
      const blob = await response.blob();
      const file = new File([blob], 'mobile-scan.jpg', { type: 'image/jpeg' });

      // Call backend
      const scanResult = await scanAPI.smartScan(file, tamilSupport);
      setResult(scanResult);
      setViewMode('result');
    } catch (err) {
      setError(err.response?.data?.detail || 'Scan failed. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  // Retry (go back to camera)
  const handleRetry = () => {
    setLastPhoto(null);
    setResult(null);
    setViewMode('camera');
    stabilityDetectorRef.current.reset();
    setSimilarity(0);
    setIsStable(false);
    setAutoCapturingIn(0);

    // Restart camera
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Camera restart error:', err);
      }
    };

    initCamera();
  };

  // Camera view
  if (viewMode === 'camera') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between safe-area-inset-top">
          <div className="flex items-center gap-2 text-white">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold">Mobile Scanner</span>
          </div>
          <div className="text-xs text-gray-400">Product Label Scan</div>
        </div>

        {/* Camera Feed with Overlay */}
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onLoadedMetadata={() => {
              if (canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
            }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay */}
          {cameraActive && (
            <ScannerOverlay
              width={videoRef.current?.videoWidth || 1280}
              height={videoRef.current?.videoHeight || 720}
              isStable={isStable}
            />
          )}

          {/* Stability Indicator */}
          {cameraActive && (
            <StabilityIndicator similarity={similarity} isStable={isStable} autoCapturingIn={autoCapturingIn} />
          )}

          {/* Permission Denied */}
          {cameraPermission === 'denied' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Camera Access Denied</h3>
              <p className="text-sm text-gray-400 text-center px-4">
                Please enable camera permissions in your browser settings to use the scanner.
              </p>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <motion.div className="bg-gradient-to-t from-black/80 to-transparent p-6 safe-area-inset-bottom space-y-4">
          {/* Capture Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualCapture}
            disabled={capturing || !cameraActive}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50 flex items-center justify-center border-4 border-white/30 transition-all disabled:opacity-50"
          >
            {capturing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                <Camera className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </motion.button>

          {/* Settings */}
          <div className="flex items-center justify-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={tamilSupport}
                onChange={(e) => setTamilSupport(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Tamil OCR
            </label>
          </div>

          {/* Instructions */}
          <div className="text-center text-xs text-gray-400">
            {isStable
              ? '✓ Ready to scan. Auto-capture will start soon...'
              : '📍 Position label within frame and keep steady'}
          </div>
        </motion.div>
      </div>
    );
  }

  // Result view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex flex-col safe-area-inset">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Scan Results
        </h1>
        <button
          onClick={() => setViewMode('camera')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Photo Preview */}
      {lastPhoto && (
        <div className="mb-6 rounded-xl overflow-hidden border border-white/20">
          <img src={lastPhoto} alt="Captured" className="w-full h-auto" />
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1">
          {/* Status */}
          <div
            className={`p-4 rounded-lg border ${
              result.compliance_status === 'COMPLIANT'
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">Compliance Status</span>
              <CheckCircle
                className={`w-5 h-5 ${result.compliance_status === 'COMPLIANT' ? 'text-green-400' : 'text-red-400'}`}
              />
            </div>
            <p
              className={`text-lg font-bold ${
                result.compliance_status === 'COMPLIANT' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {result.compliance_status}
            </p>
          </div>

          {/* Confidence Score */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">AI Confidence</span>
              <span className="text-sm font-semibold text-cyan-400">{result.confidence_score?.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence_score}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              />
            </div>
          </div>

          {/* Compliance Results */}
          {result.compliance_results && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">Fields Report</h3>
              <div className="space-y-2">
                {result.compliance_results.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{field.field}</span>
                    <span
                      className={
                        field.status === 'FOUND' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
                      }
                    >
                      {field.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PII Alert */}
          {result.pii_detected?.length > 0 && (
            <motion.div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">PII Data Detected</p>
                  <p className="text-xs text-red-200 mt-1">{result.pii_detected.join(', ')} detected and masked</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Processing Time */}
          <p className="text-xs text-gray-500 text-center">
            ⏱️ Processed in {result.processing_time_ms?.toFixed(0)}ms
          </p>
        </motion.div>
      )}

      {/* Loading State */}
      {capturing && !result && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"></div>
            </motion.div>
            <p className="text-sm text-gray-300">Analyzing image...</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRetry}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
        >
          Scan Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg"
        >
          Save Results
        </motion.button>
      </div>
    </div>
  );
}
