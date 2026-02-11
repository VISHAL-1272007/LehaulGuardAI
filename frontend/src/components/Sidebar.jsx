import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ScanLine,
  FolderKanban,
  ScrollText,
  Users,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Scanner', path: '/scanner', icon: ScanLine },
  { name: 'Batch Audit', path: '/batch-audit', icon: FolderKanban },
  { name: 'Compliance Logs', path: '/compliance-logs', icon: ScrollText },
  { name: 'User Management', path: '/user-management', icon: Users, adminOnly: true },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="w-64 glass glass-dark border-r border-white/10 flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center animate-glow">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">LegalGuard AI</h1>
            <p className="text-xs text-gray-400">Compliance Suite</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3 p-3 glass rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Hide admin-only items for non-admin users
          if (item.adminOnly && user?.role !== 'Admin') {
            return null;
          }

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'glass bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-600 dark:text-primary-400 shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:glass hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-200',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 group-hover:text-primary-500'
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
