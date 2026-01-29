import React, { useState, useEffect } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { WiFiPortalConfig } from '../../types';
import { Save, ExternalLink, RefreshCw, Check, Copy } from 'lucide-react';
import { CaptivePortal } from '../../pages/public/CaptivePortal';

export const WifiPortalBuilder = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<WiFiPortalConfig>({
    headline: 'Welcome Guest',
    subheadline: 'Sign in to access free Wi-Fi',
    buttonText: 'Connect',
    backgroundColor: '#ffffff',
    accentColor: '#4f46e5',
    requirePhone: false,
    termsText: 'I accept the Terms of Service and Privacy Policy.'
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    if (user?.clientId) {
      loadSettings(user.clientId);
    }
  }, [user]);

  const loadSettings = async (clientId: string) => {
    const settings = await MockBackend.getWifiSettings(clientId);
    if (settings) {
      setConfig(settings);
    }
  };

  const handleSave = async () => {
    if (!user?.clientId) return;
    setSaving(true);
    await MockBackend.updateWifiSettings(user.clientId, config);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // Robust URL generation with State encoding for demo purposes
  const getPortalUrl = () => {
    if (!user?.clientId) return '';
    
    // Get the base URL directly from the current location
    const currentUrl = window.location.href;
    const rootUrl = currentUrl.split('#')[0];
    const cleanBaseUrl = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
    
    // Encode config to support cross-browser demo
    const configString = JSON.stringify(config);
    const encodedConfig = btoa(unescape(encodeURIComponent(configString)));
    
    return `${cleanBaseUrl}/#/portal/${user.clientId}?demo_config=${encodedConfig}`;
  };

  const portalUrl = getPortalUrl();

  const copyLink = () => {
    // Check if we are in a blob environment or local preview which often fails with external copying
    if (window.location.protocol === 'blob:') {
        alert("NOTE: You are in a restricted preview environment (Blob URL). The copied link may not be accessible outside this tab.");
    }
    
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wi-Fi Portal Builder</h2>
            <p className="text-gray-500">Design the login page your customers see when they connect.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={copyLink}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
            >
              <Copy size={16} /> Copy Public Link
            </button>
            <button 
              onClick={() => setShowLivePreview(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
            >
              <ExternalLink size={16} /> View Live
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 font-medium disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={18} /> : success ? <Check size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
              Page Configuration
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={config.headline}
                  onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                <input
                  type="text"
                  value={config.subheadline}
                  onChange={(e) => setConfig({ ...config, subheadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input
                          type="color"
                          value={config.backgroundColor}
                          onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                          className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <input 
                          type="text"
                          value={config.backgroundColor}
                          onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                    <div className="flex gap-2">
                      <input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                          className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <input 
                          type="text"
                          value={config.accentColor}
                          onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      />
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL (Optional)</label>
                <input
                  type="text"
                  value={config.backgroundImage || ''}
                  onChange={(e) => setConfig({ ...config, backgroundImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="h-px bg-gray-200" />
              
              <div>
                <label className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={config.requirePhone}
                      onChange={(e) => setConfig({...config, requirePhone: e.target.checked})}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Collect Phone Number (Optional field)</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">If unchecked, only Name and Email are required.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={config.buttonText}
                  onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions Text</label>
                <textarea
                  value={config.termsText}
                  onChange={(e) => setConfig({ ...config, termsText: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex justify-center items-start">
              <div className="relative border-8 border-gray-900 rounded-[3rem] h-[700px] w-[360px] bg-black shadow-2xl overflow-hidden ring-4 ring-gray-200">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-20"></div>
                  
                  {/* Screen Content */}
                  <div 
                      className="w-full h-full overflow-y-auto bg-white flex flex-col relative"
                      style={{ backgroundColor: config.backgroundColor }}
                  >
                      {config.backgroundImage && (
                          <div 
                              className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
                              style={{ backgroundImage: `url(${config.backgroundImage})` }}
                          />
                      )}
                      
                      <div className="relative z-10 flex flex-col h-full p-6">
                          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                              {config.logoImage ? (
                                  <img src={config.logoImage} alt="Logo" className="h-16 w-auto object-contain" />
                              ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                      Logo
                                  </div>
                              )}
                              
                              <div className="space-y-2">
                                  <h2 className="text-2xl font-bold text-gray-900">{config.headline}</h2>
                                  <p className="text-gray-600 text-sm">{config.subheadline}</p>
                              </div>

                              <div className="w-full space-y-3 pt-4">
                                  <input disabled type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" />
                                  <input disabled type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" />
                                  {config.requirePhone && (
                                      <input disabled type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" />
                                  )}
                              </div>
                              
                              <div className="flex items-start gap-2 text-left pt-2">
                                  <div className="mt-1 w-4 h-4 border border-gray-300 rounded flex-shrink-0" />
                                  <p className="text-xs text-gray-500 leading-tight">
                                      {config.termsText}
                                  </p>
                              </div>
                          </div>

                          <div className="pt-6">
                              <button 
                                  className="w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95"
                                  style={{ backgroundColor: config.accentColor }}
                              >
                                  {config.buttonText}
                              </button>
                              <p className="text-[10px] text-center text-gray-400 mt-4">
                                  Powered by Qorvyn Wi-Fi
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Full Screen Live Preview Overlay */}
      {showLivePreview && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in slide-in-from-bottom-10 duration-300">
           <CaptivePortal previewMode={true} previewConfig={config} onClose={() => setShowLivePreview(false)} />
        </div>
      )}
    </>
  );
};