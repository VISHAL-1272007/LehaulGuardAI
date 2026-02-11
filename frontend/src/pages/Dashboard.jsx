import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, CheckCircle, XCircle, Activity, Clock } from 'lucide-react';
import { auditAPI } from '../services/api';
import { formatDate } from '../lib/utils';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: auditAPI.getStatistics,
  });

  const { data: logsData } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditAPI.getAuditLogs({ limit: 10 }),
  });

  const kpiCards = [
    {
      title: 'Total Scans',
      value: stats?.total_scans || 0,
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Compliant',
      value: stats?.compliant_count || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Non-Compliant',
      value: stats?.non_compliant_count || 0,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Compliance Rate',
      value: `${stats?.compliance_rate?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  // Mock trend data - in production, fetch from backend
  const trendData = [
    { date: 'Mon', compliant: 12, nonCompliant: 3 },
    { date: 'Tue', compliant: 15, nonCompliant: 4 },
    { date: 'Wed', compliant: 18, nonCompliant: 2 },
    { date: 'Thu', compliant: 14, nonCompliant: 5 },
    { date: 'Fri', compliant: 20, nonCompliant: 3 },
    { date: 'Sat', compliant: 16, nonCompliant: 4 },
    { date: 'Sun', compliant: 19, nonCompliant: 2 },
  ];

  const pieData = [
    { name: 'Compliant', value: stats?.compliant_count || 0 },
    { name: 'Non-Compliant', value: stats?.non_compliant_count || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glass-dark rounded-xl p-6 border border-white/10"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Real-time Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your compliance metrics and audit trends in real-time
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass glass-dark rounded-xl p-6 border border-white/10 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${card.bgColor} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <div className={`w-2 h-2 ${card.bgColor} rounded-full animate-pulse`}></div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass glass-dark rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Weekly Audit Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="compliant"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="nonCompliant"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Compliance Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass glass-dark rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Compliance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Scans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glass-dark rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Scans
          </h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Filename
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Confidence
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {logsData?.logs?.slice(0, 5).map((log, index) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {log.filename}
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {log.confidence_score.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!logsData || logsData.logs?.length === 0) && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No scans yet. Upload an image to get started!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
