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

// 2. Vercel/Vite Environment Bridge
// If the user set VITE_GEMINI_API_KEY in Vercel, we map it to process.env.API_KEY
// so the rest of the application works without refactoring.
if (import.meta.env?.VITE_GEMINI_API_KEY) {
  (window as any).process.env.API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
}

// 3. Error Boundary
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

// 4. API Key Gate
// This prevents the white screen crash by rendering a helpful message if the key is missing.
if (!process.env.API_KEY) {
  root.render(
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ maxWidth: '600px', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Configuration Error</h1>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>The application cannot start because the API Key is missing.</p>
        
        <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.875rem' }}>How to fix on Vercel:</p>
          <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
            <li>Go to your Project Settings.</li>
            <li>Select <strong>Environment Variables</strong>.</li>
            <li>Add a new variable:
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontFamily: 'monospace', background: '#e5e7eb', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>VITE_GEMINI_API_KEY</span>
              </div>
            </li>
            <li>Paste your Gemini API key as the value.</li>
            <li>Redeploy your application.</li>
          </ol>
        </div>

        <button 
          onClick={() => window.location.reload()}
          style={{ 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.5rem', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}
        >
          I've Added It, Reload
        </button>
      </div>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}