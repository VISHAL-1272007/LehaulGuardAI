import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          color: 'white',
          backgroundColor: '#1a1a2e',
          minHeight: '100vh',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '20px' }}>
            ⚠️ Something went wrong
          </h1>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Error:</p>
            <pre style={{ 
              color: '#fca5a5',
              fontSize: '14px',
              overflow: 'auto',
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '10px',
              borderRadius: '4px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
