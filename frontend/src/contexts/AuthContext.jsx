import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    try {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (err) {
      console.error('Error checking auth on mount:', err);
      authAPI.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authAPI.login(credentials);
      if (data?.user) {
        setUser(data.user);
        return data;
      } else {
        throw new Error('No user data in response');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await authAPI.register(userData);
      if (data?.user) {
        setUser(data.user);
        return data;
      } else {
        throw new Error('No user data in response');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    authAPI.logout();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    error,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
