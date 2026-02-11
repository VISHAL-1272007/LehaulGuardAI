import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Key, Database, Bell } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    apiKey: '',
    dbConnection: 'sqlite',
    notifications: true,
    autoSave: true,
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass glass-dark rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your LegalGuard AI preferences
        </p>
      </div>

      <div className="glass glass-dark rounded-xl p-6 border border-white/10">
        <div className="space-y-6">
          {/* API Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Key className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                API Configuration
              </h3>
            </div>
            <input
              type="text"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="Enter API Key"
              className="w-full px-4 py-3 glass rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {/* Database Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Database Connection
              </h3>
            </div>
            <select
              value={settings.dbConnection}
              onChange={(e) => setSettings({ ...settings, dbConnection: e.target.value })}
              className="w-full px-4 py-3 glass rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white"
            >
              <option value="sqlite">SQLite</option>
              <option value="postgresql">PostgreSQL</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 glass rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-primary-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Enable Notifications
              </span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
