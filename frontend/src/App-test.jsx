// Minimal test to check if React works
function App() {
  return (
    <div style={{
      padding: '40px',
      color: 'white',
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '20px', color: '#38bdf8' }}>
        ✅ React is Working!
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        LegalGuard AI - Enterprise Compliance Dashboard
      </p>
      <p style={{ fontSize: '14px', color: '#94a3b8' }}>
        If you see this page, React is loading correctly.
      </p>
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        borderLeft: '4px solid #38bdf8',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Status:</strong> Components loading... Please wait.
        </p>
      </div>
    </div>
  );
}

export default App;
