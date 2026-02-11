import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FolderOpen, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { scanAPI } from '../services/api';
import { formatBytes } from '../lib/utils';

export default function BatchAudit() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [tamilSupport, setTamilSupport] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setResults(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 50,
  });

  const handleBatchScan = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setError('');

    try {
      const batchResults = await scanAPI.batchScan(files, tamilSupport);
      setResults(batchResults);
    } catch (err) {
      setError(err.response?.data?.detail || 'Batch scan failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="glass glass-dark rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold gradient-text mb-2">Batch Audit Scanner</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload multiple images for simultaneous compliance verification (Max 50 images)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="glass glass-dark rounded-xl p-6 border border-white/10">
            {files.length === 0 ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-white/5'
                }`}
              >
                <input {...getInputProps()} />
                <FolderOpen className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload Multiple Images'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Drag & drop or click to select up to 50 images
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {files.length} file(s) selected
                  </h3>
                  <button
                    onClick={() => setFiles([])}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 glass rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FolderOpen className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tamil Support */}
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

                {/* Process Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBatchScan}
                  disabled={processing}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing {files.length} images...
                    </span>
                  ) : (
                    `Process Batch (${files.length} images)`
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass glass-dark rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Batch Results Summary
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total Images
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {results.total_images}
                    </p>
                  </div>

                  <div className="glass rounded-lg p-4 bg-green-500/10">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      Compliant
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {results.compliant_count}
                    </p>
                  </div>

                  <div className="glass rounded-lg p-4 bg-red-500/10">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      Non-Compliant
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {results.non_compliant_count}
                    </p>
                  </div>

                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Processing Time
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(results.processing_time_ms / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Results */}
              <div className="glass glass-dark rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Individual Results ({results.results.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 glass rounded-lg border ${
                        result.compliance_status === 'COMPLIANT'
                          ? 'border-green-500/30'
                          : 'border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {result.compliance_status === 'COMPLIANT' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {result.filename}
                            </p>
                            <p className="text-sm text-gray-500">
                              Confidence: {result.confidence_score.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            result.compliance_status === 'COMPLIANT'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {result.compliance_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass glass-dark rounded-xl p-12 border border-white/10 text-center">
              <FolderOpen className="w-20 h-20 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Results Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload images and process batch to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
