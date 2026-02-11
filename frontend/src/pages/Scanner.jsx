import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle, Loader2, Eye } from 'lucide-react';
import { scanAPI } from '../services/api';
import { formatBytes, getComplianceColor, getComplianceBgColor } from '../lib/utils';

export default function Scanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [tamilSupport, setTamilSupport] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');

    try {
      const scanResult = await scanAPI.scanImage(selectedFile, tamilSupport);
      setResult(scanResult);
    } catch (err) {
      setError(err.response?.data?.detail || 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass glass-dark rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold gradient-text mb-2">AI Scanner</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload product label images for instant compliance verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload Section */}
        <div className="space-y-6">
          {/* Upload Zone */}
          <div className="glass glass-dark rounded-xl p-6 border border-white/10">
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-white/5'
                }`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={{ y: isDragActive ? -10 : 0 }}
                  className="flex flex-col items-center"
                >
                  <Upload className="w-16 h-16 text-primary-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {isDragActive ? 'Drop the image here' : 'Drag & Drop Image'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse your files
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: PNG, JPG, JPEG, WEBP (Max 10MB)
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-contain"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 glass rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tamil Support Toggle */}
                <div className="flex items-center justify-between p-4 glass rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Tamil OCR Support
                  </span>
                  <button
                    onClick={() => setTamilSupport(!tamilSupport)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tamilSupport ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tamilSupport ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Scan Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scanning ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Neural Network Processing...
                    </span>
                  ) : (
                    'Scan for Compliance'
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Scanning Animation */}
          <AnimatePresence>
            {scanning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass glass-dark rounded-xl p-6 border border-primary-500/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      AI Processing in Progress
                    </h4>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Right: Results Section */}
        <div className="space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Compliance Status */}
              <div className={`glass glass-dark rounded-xl p-6 border ${
                result.compliance_status === 'COMPLIANT'
                  ? 'border-green-500/50'
                  : 'border-red-500/50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Scan Results
                  </h3>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${getComplianceBgColor(result.compliance_status)}`}>
                    {result.compliance_status === 'COMPLIANT' ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-semibold ${getComplianceColor(result.compliance_status)}`}>
                      {result.compliance_status}
                    </span>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Confidence Score</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {result.confidence_score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence_score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${
                        result.confidence_score >= 80
                          ? 'bg-green-500'
                          : result.confidence_score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Keywords Found */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Keywords Found ({result.found_keywords.length}/5)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.found_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium"
                      >
                        ✓ {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                {result.missing_keywords.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-semibold text-red-600 dark:text-red-400">
                      Missing Keywords ({result.missing_keywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium"
                        >
                          ✗ {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Quality */}
              <div className="glass glass-dark rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Image Quality Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quality</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {result.image_quality.quality}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Variance</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {result.image_quality.variance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Blurry</span>
                    <span className={`font-semibold ${result.image_quality.is_blurry ? 'text-red-500' : 'text-green-500'}`}>
                      {result.image_quality.is_blurry ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted Text */}
              <div className="glass glass-dark rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Extracted Text (OCR)
                </h3>
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {result.extracted_text || 'No text extracted'}
                </pre>
              </div>

              {/* Processing Time */}
              <div className="text-center text-sm text-gray-500">
                Processing time: {result.processing_time_ms.toFixed(0)}ms
              </div>
            </motion.div>
          ) : (
            <div className="glass glass-dark rounded-xl p-12 border border-white/10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Results Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload and scan an image to see compliance results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
