import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Client',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ username: formData.username, password: formData.password });
      } else {
        await register(formData);
      }
      // Navigation happens automatically on successful login/register
      navigate('/', { replace: true });
    } catch (err) {
      // Extract error message from various sources
      const errorMessage = 
        err.response?.data?.detail || 
        err.message || 
        'Authentication failed. Please try again.';
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>

      {/* Floating Orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-20 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass glass-dark rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 animate-glow"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-2">LegalGuard AI</h1>
            <p className="text-gray-400">Enterprise Compliance Platform</p>
          </div>

          {/* Toggle Button */}
          <div className="flex glass rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                isLogin
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                !isLogin
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 glass rounded-lg border border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 bg-white/5 text-white placeholder-gray-500 transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 glass rounded-lg border border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 bg-white/5 text-white placeholder-gray-500 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 glass rounded-lg border border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 bg-white/5 text-white placeholder-gray-500 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass rounded-lg border border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 bg-white/5 text-white transition-all duration-200"
                >
                  <option value="Client">Client</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Processing...
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 LegalGuard AI. Enterprise-grade compliance platform.
        </p>
      </motion.div>
    </div>
  );
}
