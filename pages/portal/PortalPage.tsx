import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MockBackend } from '../../services/mockBackend';
import { WiFiPortalConfig } from '../../types';
import { Wifi, CheckCircle, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PortalPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  
  const [config, setConfig] = useState<WiFiPortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  
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
    loadConfig();
  }, [clientId, user]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError('');
      
      let targetClientId = clientId;
      
      // Handle Preview Mode logic:
      // If URL is /portal/preview, we try to load the currently logged-in user's config
      if (clientId === 'preview') {
         setIsPreview(true);
         if (user?.clientId) {
            targetClientId = user.clientId;
         } else {
             // If not logged in and trying to preview, we can't show their specific data
             // in this mock environment without a session.
             throw new Error("Please log in to the dashboard to preview your portal.");
         }
      }

      if (targetClientId) {
        const settings = await MockBackend.getWifiSettings(targetClientId);
        if (settings) {
            setConfig(settings);
        } else {
            throw new Error("Portal configuration not found for this client.");
        }
      } else {
         throw new Error("Invalid Portal URL");
      }
    } catch (e: any) {
      console.warn("Portal load failed", e);
      setError(e.message || 'Could not load portal settings.');
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
    
    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!isPreview && clientId) {
        // Only save data if this is a "real" visit (not preview mode)
        try {
           await MockBackend.addContact(
             clientId, 
             formData.name, 
             formData.email, 
             formData.phone, 
             'wifi_portal'
           );
        } catch(e) {
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
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal Unavailable</h1>
        <p className="text-gray-600 max-w-md mx-auto">{error}</p>
        <button 
            onClick={() => window.location.reload()} 
            className="mt-8 px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
            Try Again
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
       
       {isPreview && (
          <div className="fixed top-0 left-0 w-full bg-indigo-600 text-white text-xs py-1.5 text-center z-50 font-bold uppercase tracking-wider shadow-md">
              Preview Mode
          </div>
       )}

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