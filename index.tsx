import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- PRODUCTION SAFETIES ---

// 1. Process Polyfill
// Browsers don't have 'process.env'. If the build tool doesn't inject it, the app crashes immediately.
// This ensures the app can at least render, even if the API Key is missing.
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// 2. Error Boundary
// Catches runtime errors (like import failures or missing props) and shows a UI message
// instead of a blank white screen.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '2rem', 
          fontFamily: 'sans-serif',
          backgroundColor: '#fef2f2',
          color: '#991b1b'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong.</h1>
          <p style={{ marginBottom: '1rem' }}>The application crashed before it could load. See details below:</p>
          <pre style={{ 
            backgroundColor: 'rgba(255,255,255,0.5)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            overflow: 'auto', 
            maxWidth: '100%' 
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);