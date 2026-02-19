
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, User, Building, Mail, Loader2, CheckCircle, Lock, Trash2, AlertTriangle, Key, Globe, LayoutTemplate, Link as LinkIcon, X, Cloud, BrainCircuit, Briefcase, ChevronDown } from 'lucide-react';
import { MockBackend } from '../../services/mockBackend';
import { useNavigate } from 'react-router-dom';

const GLOBAL_LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese (Simplified)',
    'Japanese',
    'Portuguese',
    'Italian',
    'Dutch',
    'Russian',
    'Arabic',
    'Hindi',
    'Korean',
    'Greek'
];

const BUSINESS_TYPES = [
    'SaaS',
    'Enterprise Software',
    'E-commerce',
    'Service Agency',
    'IT Consulting',
    'Retail',
    'Restaurant & Food',
    'Coffee Shop & Cafe',
    'Bakery',
    'Winery',
    'Gaming',
    'Fitness',
    'Healthcare',
    'Real Estate',
    'Education',
    'Entertainment',
    'Manufacturing',
    'Logistics',
    'Non-Profit',
    'Other'
];

// ... (GoogleIcon component remains unchanged) ...
const GoogleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957273V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
        <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
        <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957273 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
);

export const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Loading States
  const [profileLoading, setProfileLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [integrationLoading, setIntegrationLoading] = useState(false);
  
  // Success States
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  // Data States
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // Form Data
  const [profileData, setProfileData] = useState({
    name: '',
    businessName: '',
    industry: '',
    website: '',
    businessDescription: '', 
    language: 'English',
    uiLanguage: 'English'
  });

  const [securityData, setSecurityData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Calculate available business types including current value if custom
  const availableBusinessTypes = useMemo(() => {
    const types = new Set(BUSINESS_TYPES);
    if (profileData.industry && !types.has(profileData.industry)) {
        // If current industry isn't in standard list, allow it as a valid option but sort nicely
        return [profileData.industry, ...BUSINESS_TYPES].sort();
    }
    return BUSINESS_TYPES.sort();
  }, [profileData.industry]);

  // Load Initial Data
  useEffect(() => {
    if (user) {
        const loadData = async () => {
            let businessName = '';
            let industry = '';
            let website = '';
            let businessDescription = '';
            let language = 'English';
            let uiLanguage = 'English';
            let googleEmail = null;

            if (user.clientId) {
                const client = await MockBackend.getClientById(user.clientId);
                if (client) {
                    businessName = client.name;
                    industry = client.industry || '';
                    website = client.website || '';
                    businessDescription = client.businessDescription || '';
                    if (client.settings?.preferredLanguage) {
                        language = client.settings.preferredLanguage;
                    }
                    if (client.settings?.uiLanguage) {
                        uiLanguage = client.settings.uiLanguage;
                    }
                    // Load Google Integration Status
                    if (client.settings?.googleIntegration?.connected && client.settings.googleIntegration.email) {
                        googleEmail = client.settings.googleIntegration.email;
                    }
                }
            }
            setProfileData({
                name: user.name,
                businessName: businessName,
                industry: industry,
                website: website,
                businessDescription: businessDescription,
                language: language,
                uiLanguage: uiLanguage
            });
            setConnectedEmail(googleEmail);
            setSecurityData(prev => ({ ...prev, email: user.email }));
        };
        loadData();
    }
  }, [user]);

  // Handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    
    try {
        if (user?.clientId) {
            // Fetch current client first to preserve other fields
            const currentClient = await MockBackend.getClientById(user.clientId);
            if (currentClient) {
                await MockBackend.updateClient(user.clientId, {
                    name: profileData.businessName,
                    industry: profileData.industry,
                    website: profileData.website,
                    businessDescription: profileData.businessDescription,
                    settings: {
                        ...currentClient.settings,
                        preferredLanguage: profileData.language,
                        uiLanguage: profileData.uiLanguage
                    }
                });
            }
        }
        
        // Simulate minor network delay for feedback
        setTimeout(() => {
            setProfileLoading(false);
            setProfileSuccess(true);
            // Dispatch event to notify Layout to update language
            window.dispatchEvent(new Event('qorvyn_settings_updated'));
            setTimeout(() => setProfileSuccess(false), 3000);
        }, 800);
    } catch (error) {
        setProfileLoading(false);
        alert("Failed to update profile.");
    }
  };

  // ... (handleSecurityUpdate, handleGoogleConnect, handleGoogleDisconnect, handleDeleteAccount remain unchanged) ...
  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
        alert("New passwords do not match.");
        return;
    }
    
    setSecurityLoading(true);
    setSecuritySuccess(false);
    
    // Simulate API call for security update
    setTimeout(() => {
        setSecurityLoading(false);
        setSecuritySuccess(true);
        setSecurityData(prev => ({...prev, currentPassword: '', newPassword: '', confirmPassword: ''}));
        setTimeout(() => setSecuritySuccess(false), 3000);
    }, 1500);
  };

  const handleGoogleConnect = async () => {
      if (!user?.clientId) return;
      setIntegrationLoading(true);
      try {
          const result = await MockBackend.connectGmail(user.clientId);
          setConnectedEmail(result.email);
      } catch (e) {
          alert("Failed to connect Google Account");
      } finally {
          setIntegrationLoading(false);
      }
  };

  const handleGoogleDisconnect = async () => {
      if (!user?.clientId) return;
      if (!window.confirm("Are you sure? Disconnecting will prevent Qorvyn from sending emails via your Gmail account.")) return;
      
      setIntegrationLoading(true);
      try {
          await MockBackend.disconnectGmail(user.clientId);
          setConnectedEmail(null);
      } catch (e) {
          alert("Failed to disconnect.");
      } finally {
          setIntegrationLoading(false);
      }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
        setDeleteLoading(true);
        // Simulate deletion delay
        setTimeout(() => {
            logout();
            navigate('/login');
        }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
        <p className="text-gray-500 dark:text-slate-400">Manage your personal information, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* 1. Profile Information */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <User size={20} className="text-gray-500 dark:text-slate-400" />
                    Profile Information
                </h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Business Name</label>
                         <div className="relative">
                            <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={profileData.businessName}
                                onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>
                    
                    {/* Business Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Business Type</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={profileData.industry}
                                onChange={(e) => setProfileData({...profileData, industry: e.target.value})}
                                className="w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white appearance-none text-sm"
                            >
                                <option value="" disabled>Select Business Type</option>
                                {availableBusinessTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Website URL</label>
                         <div className="relative">
                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                value={profileData.website}
                                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white"
                                placeholder="https://yourbusiness.com"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-1 ml-1">Used by AI to analyze your brand colors and style.</p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-slate-800" />

                {/* AI Context Section */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                        <BrainCircuit size={16} />
                        AI Brain & Context
                    </h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300/80 mb-4">
                        This description is used by the AI to generate tailored growth strategies and content. Update this to retrain the model on your current business goals.
                    </p>
                    <textarea 
                        value={profileData.businessDescription}
                        onChange={(e) => setProfileData({...profileData, businessDescription: e.target.value})}
                        className="w-full px-4 py-3 border border-indigo-200 dark:border-indigo-800/50 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white text-sm"
                        rows={4}
                        placeholder="Describe your business, target audience, and key values..."
                    />
                </div>
                
                {/* Regional Preferences */}
                <div>
                     <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe size={16} className="text-indigo-500" /> Regional & Language Preferences
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">AI Output Language</label>
                            <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">Default language for all generated emails and newsletters.</p>
                            <div className="relative">
                                <select
                                    value={profileData.language}
                                    onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white appearance-none"
                                >
                                    {GLOBAL_LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Globe size={14} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Dashboard Interface Language</label>
                            <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">Language used for the application menu and controls.</p>
                            <div className="relative">
                                <select
                                    value={profileData.uiLanguage}
                                    onChange={(e) => setProfileData({...profileData, uiLanguage: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white appearance-none"
                                >
                                    {GLOBAL_LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <LayoutTemplate size={14} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    {profileSuccess && <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1 animate-fade-in-up"><CheckCircle size={16}/> Context Retrained</span>}
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {profileLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save & Retrain AI
                    </button>
                </div>
            </form>
        </section>

        {/* 2. Security Settings */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock size={20} className="text-gray-500 dark:text-slate-400" />
                    Security & Login
                </h3>
            </div>
            <form onSubmit={handleSecurityUpdate} className="p-6 space-y-8">
                
                {/* Change Email */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Email Address</h4>
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Account Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={securityData.email}
                                onChange={(e) => setSecurityData({...securityData, email: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                         <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">Changing your email will require re-verification.</p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-slate-800" />

                {/* Change Password */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current Password</label>
                             <div className="relative">
                                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={securityData.currentPassword}
                                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">New Password</label>
                            <input
                                type="password"
                                value={securityData.newPassword}
                                onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white"
                                placeholder="Min 8 chars"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={securityData.confirmPassword}
                                onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 dark:text-white"
                                placeholder="Confirm new pass"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                    {securitySuccess && <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1"><CheckCircle size={16}/> Credentials Updated</span>}
                    <button
                        type="submit"
                        disabled={securityLoading}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        {securityLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Update Security
                    </button>
                </div>
            </form>
        </section>

        {/* 3. Integrations (NEW) */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <LinkIcon size={20} className="text-gray-500 dark:text-slate-400" />
                    Email Integrations
                </h3>
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                    Connect your external email providers to send campaigns directly from your own domain.
                </p>
                
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                            <GoogleIcon />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Google Workspace / Gmail
                                {connectedEmail && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Active</span>}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                {connectedEmail ? `Connected as ${connectedEmail}` : 'Send emails using your Gmail or Workspace account.'}
                            </p>
                        </div>
                    </div>

                    {connectedEmail ? (
                         <button 
                            onClick={handleGoogleDisconnect}
                            disabled={integrationLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 transition-all shadow-sm"
                        >
                            {integrationLoading ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                            Disconnect
                        </button>
                    ) : (
                        <button 
                            onClick={handleGoogleConnect}
                            disabled={integrationLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {integrationLoading ? <Loader2 className="animate-spin" size={16} /> : <Cloud size={16} />}
                            Connect Account
                        </button>
                    )}
                </div>
            </div>
        </section>

        {/* 4. Danger Zone */}
        <section className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 shadow-sm overflow-hidden transition-colors">
             <div className="p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/20">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Danger Zone
                </h3>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h4 className="font-medium text-red-900 dark:text-red-300">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-400/80 mt-1">
                        Permanently remove your personal data, contacts, and campaign history. This action is not reversible.
                    </p>
                </div>
                <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    {deleteLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    Delete Account
                </button>
            </div>
        </section>

      </div>
    </div>
  );
};
