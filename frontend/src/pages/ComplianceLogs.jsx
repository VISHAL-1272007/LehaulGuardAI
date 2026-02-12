import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { auditAPI } from '../services/api';
import { formatDate, getComplianceColor } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function ComplianceLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filterStatus],
    queryFn: () => auditAPI.getAuditLogs({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: auditAPI.deleteAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['audit-logs']);
    },
  });

  const filteredLogs = data?.logs?.filter((log) => {
    const matchesSearch = log.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || log.compliance_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="glass glass-dark rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold gradient-text mb-2">Compliance Audit Logs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete history of all compliance scans and audits
        </p>
      </div>

      {/* Filters */}
      <div className="glass glass-dark rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by filename..."
              className="w-full pl-10 pr-4 py-2.5 glass rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
            </select>
          </div>

          {/* Export */}
          <button className="flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:shadow-lg transition-all">
            <Download className="w-5 h-5" />
            <span className="font-medium">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass glass-dark rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass glass-dark rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compliant</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data?.logs?.filter((l) => l.compliance_status === 'COMPLIANT').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass glass-dark rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {data?.logs?.filter((l) => l.compliance_status === 'NON_COMPLIANT').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass glass-dark rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Filename
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Confidence
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Missing Fields
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Timestamp
                </th>
                {user?.role === 'Admin' && (
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="loading-spinner mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLogs?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs?.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">
                      {log.filename}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          log.compliance_status === 'COMPLIANT'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {log.compliance_status === 'COMPLIANT' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {log.compliance_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {log.confidence_score.toFixed(1)}%
                    </td>
                    <td className="py-4 px-6">
                      {log.missing_keywords && (Array.isArray(log.missing_keywords) ? log.missing_keywords.length > 0 : log.missing_keywords) ? (
                        <span className="text-xs text-red-500">
                          {Array.isArray(log.missing_keywords) ? log.missing_keywords.join(', ') : log.missing_keywords}
                        </span>
                      ) : (
                        <span className="text-xs text-green-500">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.timestamp)}
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
