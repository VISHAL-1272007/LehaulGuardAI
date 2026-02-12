import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScannerAI from './pages/ScannerAI';
import MobileScanner from './pages/MobileScanner';
import BatchAudit from './pages/BatchAudit';
import ComplianceLogs from './pages/ComplianceLogs';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';

// Smart Scanner Router - Detects mobile/desktop
function ScannerRouter() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile based on screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile gets fullscreen camera scanner
  if (isMobile) {
    return <MobileScanner />;
  }

  // Desktop gets ScannerAI (Layout already provided by parent route)
  return <ScannerAI />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/mobile-scanner" element={<ProtectedRoute><MobileScanner /></ProtectedRoute>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="scanner" element={<ScannerRouter />} />
              <Route path="batch-audit" element={<BatchAudit />} />
              <Route path="compliance-logs" element={<ComplianceLogs />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
