import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MockBackend } from '../../services/mockBackend';
import { WiFiPortalConfig } from '../../types';
import { Wifi, CheckCircle, Loader2, X } from 'lucide-react';

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
  const { clientId } = useParams<{ clientId: string }>();
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
    if (previewMode && previewConfig) {
      setConfig(previewConfig);
      setLoading(false);
      return;
    }

    if (clientId) {
      loadConfig(clientId);
    } else {
      setLoading(false);
      setError('Invalid Portal URL');
    }
  }, [clientId, searchParams, previewMode, previewConfig]);

  const loadConfig = async (id: string) => {
    try {
      // 1. Try to load from local backend first (Same browser session)
      const settings = await MockBackend.getWifiSettings(id);
      
      if (settings) {
        setConfig(settings);
      } else {
        // 2. If not found (Cross-browser demo), try to load from URL query param
        const demoConfig = searchParams.get('demo_config');
        if (demoConfig) {
            try {
                // Decode safe base64 utf-8
                const jsonStr = decodeURIComponent(escape(atob(demoConfig)));
                const parsedConfig = JSON.parse(jsonStr) as WiFiPortalConfig;
                setConfig(parsedConfig);
            } catch (e) {
                console.error("Failed to parse demo config", e);
                // Fallback to default if parsing fails
                setError('Portal configuration is invalid.');
            }
        } else {
            setError('Portal configuration not found.');
        }
      }
    } catch (e) {
      setError('Failed to load portal configuration.');
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
    
    if (previewMode) {
        // Simulate delay for preview
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccess(true);
        setSubmitting(false);
        return;
    }

    if (!clientId) return;

    try {
      const clientExists = await MockBackend.getClientById(clientId);
      
      if (clientExists) {
          await MockBackend.addContact(
            clientId, 
            formData.name, 
            formData.email, 
            formData.phone, 
            'wifi_portal'
          );
      } else {
          // Simulate network request if cross-browser demo
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSuccess(true);
    } catch (e) {
      alert("Connection failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  
  if (error || !config) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <Wifi size={48} className="text-gray-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">Connection Error</h1>
        <p className="text-gray-600 mt-2">{error || "Configuration missing"}</p>
        {previewMode && onClose && (
            <button onClick={onClose} className="mt-4 text-sm text-blue-600 hover:underline">Close Preview</button>
        )}
    </div>
  );

  if (success) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in absolute inset-0 z-50" style={{ backgroundColor: config.backgroundColor }}>
             {previewMode && onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                >
                    <X size={24} className="text-gray-800" />
                </button>
             )}
             <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-green-600" />
             </div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Connected!</h1>
             <p className="text-gray-600 mb-8 max-w-xs mx-auto">You now have access to the internet. Enjoy your session.</p>
             <button 
                onClick={() => previewMode && onClose ? onClose() : window.location.href = 'https://google.com'} 
                className="px-8 py-3 rounded-full font-bold text-white shadow-lg"
                style={{ backgroundColor: config.accentColor }}
            >
                {previewMode ? 'Close Preview' : 'Start Browsing'}
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full" style={{ backgroundColor: config.backgroundColor }}>
       {/* Close Button for Preview Mode */}
       {previewMode && onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/50 backdrop-blur hover:bg-white/80 transition-colors shadow-sm"
            >
                <X size={24} className="text-gray-800" />
            </button>
       )}

       {/* Background Image Layer */}
       {config.backgroundImage && (
            <div 
                className="absolute inset-0 bg-cover bg-center z-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: `url(${config.backgroundImage})` }}
            />
        )}

       <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto">
          {/* Logo Area */}
          <div className="mb-8">
            {config.logoImage ? (
                <img src={config.logoImage} alt="Logo" className="h-16 object-contain" />
            ) : (
                <div className="w-16 h-16 bg-gray-100/50 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Wifi size={32} style={{ color: config.accentColor }} />
                </div>
            )}
          </div>

          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.headline}</h1>
             <p className="text-gray-600">{config.subheadline}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
             <div>
                <input 
                    type="text" 
                    required
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none bg-white/80 backdrop-blur-sm"
                    style={{ '--tw-ring-color': config.accentColor } as React.CSSProperties}
                />
             </div>
             <div>
                <input 
                    type="email" 
                    required
                    placeholder="Email Address (Required)" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none bg-white/80 backdrop-blur-sm"
                    style={{ '--tw-ring-color': config.accentColor } as React.CSSProperties}
                />
             </div>
             
             {config.requirePhone && (
                <div>
                    <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none bg-white/80 backdrop-blur-sm"
                        style={{ '--tw-ring-color': config.accentColor } as React.CSSProperties}
                    />
                </div>
             )}

             <label className="flex items-start gap-3 p-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    required
                    checked={formData.acceptedTerms}
                    onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-500 leading-snug select-none">
                    {config.termsText}
                </span>
             </label>

             <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition active:scale-95 disabled:opacity-70 disabled:scale-100 mt-4"
                style={{ backgroundColor: config.accentColor }}
             >
                {submitting ? 'Connecting...' : config.buttonText}
             </button>
          </form>
       </div>
       
       <div className="p-4 text-center z-10">
          <p className="text-xs text-gray-400">Secure Wi-Fi Portal by Qorvyn</p>
       </div>
    </div>
  );
};