
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MockBackend } from '../../services/mockBackend';
import { WiFiPortalConfig } from '../../types';
import { Wifi, CheckCircle, Loader2, Globe, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface CaptivePortalProps {
  previewMode?: boolean;
  previewConfig?: WiFiPortalConfig;
  onClose?: () => void;
}

export const CaptivePortal: React.FC<CaptivePortalProps> = ({ 
  previewMode = false, 
  previewConfig, 
  onClose 
}) => {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<WiFiPortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    acceptedTerms: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Direct Preview Mode (Internal)
    if (previewMode && previewConfig) {
      setConfig(previewConfig);
      setLoading(false);
      return;
    }

    // 2. Load from URL (Public Link) or Local Storage
    loadConfig();
  }, [clientId, searchParams, previewMode, previewConfig]);

  const loadConfig = async () => {
    try {
      // PRIORITY 1: Check for 'data' param in URL (Portable Live Link)
      // This allows the link to work on ANY device/browser without backend sync
      const dataParam = searchParams.get('data');
      if (dataParam) {
         try {
            // Robust Base64 decode for Unicode
            const jsonStr = decodeURIComponent(escape(atob(dataParam)));
            const parsedConfig = JSON.parse(jsonStr) as WiFiPortalConfig;
            setConfig(parsedConfig);
            setLoading(false);
            return;
         } catch (e) {
            console.warn("Failed to parse data param, falling back to local storage");
         }
      }

      // PRIORITY 2: Check Local Mock Backend (Same Device)
      if (clientId) {
        const settings = await MockBackend.getWifiSettings(clientId);
        if (settings) {
            setConfig(settings);
            setLoading(false);
            return;
        }
      }

      // Fallback: Default Config if nothing found (Prevent broken page)
      setConfig({
        headline: "Welcome",
        subheadline: "Sign in to join the network",
        buttonText: "Connect",
        backgroundColor: "#ffffff",
        accentColor: "#4f46e5",
        requirePhone: false,
        termsText: "I agree to the Terms of Service."
      });
      
    } catch (e) {
      console.error(e);
      setError('Unable to load portal configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptedTerms) {
      alert("You must accept the terms to continue.");
      return;
    }

    setSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!previewMode && clientId) {
        // Try to save if we are in the local environment
        try {
           // Fix: Pass an object to addContact instead of multiple parameters
           await MockBackend.addContact(
             clientId, 
             {
               name: formData.name,
               email: formData.email,
               phone: formData.phone,
               source: 'wifi_portal'
             }
           );
        } catch(e) {
            // Ignore errors in public demo mode (no backend)
            console.log("Mock save failed (expected in public demo)");
        }
    }
    
    setSuccess(true);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading Portal...</p>
    </div>
  );
  
  if (error || !config) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6 border border-red-100 shadow-sm">
            <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Connection Failed</h1>
        <p className="text-gray-500 font-medium max-w-xs mx-auto leading-relaxed mb-8">
            {error || "We couldn't load the login portal configuration. Please check your internet connection."}
        </p>
        <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
        >
            <RefreshCw size={16} />
            Retry Connection
        </button>
    </div>
  );

  if (success) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300" style={{ backgroundColor: config.backgroundColor }}>
             <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8 shadow-sm">
                <CheckCircle size={48} className="text-green-600" />
             </div>
             <h1 className="text-4xl font-bold text-gray-900 mb-4">You're Online!</h1>
             <p className="text-gray-600 mb-10 text-lg max-w-sm mx-auto">
                Successfully connected to the network. You may now browse the internet freely.
             </p>
             <button 
                onClick={() => window.location.href = 'https://www.google.com'} 
                className="px-10 py-4 rounded-full font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                style={{ backgroundColor: config.accentColor }}
            >
                Start Browsing
            </button>
             <div className="absolute bottom-8 text-gray-400 text-xs flex items-center gap-1">
                <ShieldCheck size={12} />
                Secured by Qorvyn
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-hidden font-sans" style={{ backgroundColor: config.backgroundColor }}>
       
       {/* Background Image Layer */}
       {config.backgroundImage && (
            <div 
                className="absolute inset-0 bg-cover bg-center z-0 opacity-15 pointer-events-none"
                style={{ backgroundImage: `url(${config.backgroundImage})` }}
            />
        )}

       <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-lg mx-auto">
          {/* Logo Area */}
          <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
            {config.logoImage ? (
                <img src={config.logoImage} alt="Logo" className="h-24 object-contain" />
            ) : (
                <div className="w-20 h-20 bg-gray-50/80 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-sm">
                    <Wifi size={36} style={{ color: config.accentColor }} />
                </div>
            )}
          </div>

          <div className="text-center mb-10 space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-100">
             <h1 className="text-3xl font-bold text-gray-900">{config.headline}</h1>
             <p className="text-gray-600 text-lg">{config.subheadline}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4 animate-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="space-y-4">
                <input 
                    type="text" 
                    required
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:outline-none bg-white/90 backdrop-blur transition-all focus:scale-[1.01]"
                    style={{ '--tw-ring-color': config.accentColor } as React.CSSProperties}
                />
                
                <input 
                    type="email" 
                    required
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:outline-none bg-white/90 backdrop-blur transition-all focus:scale-[1.01]"
                    style={{ '--tw-ring-color': config.accentColor } as React.CSSProperties}
                />
                
                {config.requirePhone && (
                    <input 
                        type="tel" 
                        required
                        placeholder="Phone Number" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:outline-none bg-white/90 backdrop-blur transition-all focus:scale-[1.01]"
                        style={{ '--tw-ring-color': config.accentColor } as React.CSSProperties}
                    />
                )}
             </div>

             <label className="flex items-start gap-3 p-2 cursor-pointer group">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        required
                        checked={formData.acceptedTerms}
                        onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:shadow-md"
                        style={{ backgroundColor: formData.acceptedTerms ? config.accentColor : 'white', borderColor: formData.acceptedTerms ? config.accentColor : '#d1d5db' }}
                    />
                    <CheckCircle size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-sm text-gray-500 leading-snug select-none group-hover:text-gray-700 transition-colors">
                    {config.termsText}
                </span>
             </label>

             <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg shadow-indigo-200 transform transition-all active:scale-95 hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:scale-100 disabled:shadow-none mt-6"
                style={{ backgroundColor: config.accentColor }}
             >
                {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" /> Connecting...
                    </span>
                ) : config.buttonText}
             </button>
          </form>
       </div>
       
       <div className="p-6 text-center z-10">
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Powered by Qorvyn</p>
       </div>
    </div>
  );
};
