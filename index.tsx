
import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- PRODUCTION SAFETIES ---

// 1. Process Polyfill (Already handled by index.html, but keeping for safety in environments with direct index.tsx loading)
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// 2. Vercel/Vite Environment Bridge
const VERCEL_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;
if (VERCEL_API_KEY) {
  (window as any).process.env.API_KEY = VERCEL_API_KEY;
}

// 3. Error Boundary
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
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
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
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
            {error?.toString()}
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

    return children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// 4. API Key Gate
const hasKey = (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' && process.env?.API_KEY);

if (!hasKey) {
  root.render(
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '2rem',
      backgroundColor: '#f8fafc',
      color: '#1e293b'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
        backgroundColor: 'white', 
        padding: '2.5rem', 
        borderRadius: '1rem', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          backgroundColor: '#fee2e2', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#0f172a' }}>Setup Required</h1>
        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          The application has started successfully, but it needs your Gemini API key to function.
        </p>
        
        <div style={{ backgroundColor: '#f1f5f9', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.75rem', color: '#334155' }}>Instructions for Vercel:</p>
          <ol style={{ listStyleType: 'decimal', paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: '1.6' }}>
            <li>Go to your Vercel Project Settings.</li>
            <li>Navigate to <strong>Environment Variables</strong>.</li>
            <li>Add Key: <code style={{ fontFamily: 'monospace', backgroundColor: '#e2e8f0', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', color: '#0f172a' }}>VITE_GEMINI_API_KEY</code></li>
            <li>Paste your Gemini API key as the Value.</li>
            <li><strong>Redeploy</strong> your project.</li>
          </ol>
        </div>

        <button 
          onClick={() => window.location.reload()}
          style={{ 
            width: '100%',
            backgroundColor: '#4f46e5', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.5rem', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
        >
          I've Added It, Reload Page
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
