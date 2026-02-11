import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="glass glass-dark border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to <span className="gradient-text">LegalGuard AI</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enterprise-grade Legal Metrology Compliance Platform
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 glass rounded-lg hover:bg-white/10 transition-all duration-200">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-200 group"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600 group-hover:-rotate-180 transition-transform duration-500" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
