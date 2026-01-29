import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, User, Building, Mail, Loader2, CheckCircle, Lock, Trash2, AlertTriangle, Key } from 'lucide-react';
import { MockBackend } from '../../services/mockBackend';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Loading States
  const [profileLoading, setProfileLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Success States
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  // Form Data
  const [profileData, setProfileData] = useState({
    name: '',
    businessName: ''
  });

  const [securityData, setSecurityData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load Initial Data
  useEffect(() => {
    if (user) {
        const loadData = async () => {
            let businessName = '';
            if (user.clientId) {
                const client = await MockBackend.getClientById(user.clientId);
                if (client) businessName = client.name;
            }
            setProfileData({
                name: user.name,
                businessName: businessName
            });
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
    // Simulate API call for profile update
    setTimeout(() => {
        setProfileLoading(false);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
    }, 1000);
  };

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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-gray-500">Manage your personal information, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* 1. Profile Information */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <User size={20} className="text-gray-500" />
                    Profile Information
                </h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                         <div className="relative">
                            <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={profileData.businessName}
                                onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-4">
                    {profileSuccess && <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle size={16}/> Saved</span>}
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {profileLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Profile
                    </button>
                </div>
            </form>
        </section>

        {/* 2. Security Settings */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Lock size={20} className="text-gray-500" />
                    Security & Login
                </h3>
            </div>
            <form onSubmit={handleSecurityUpdate} className="p-6 space-y-8">
                
                {/* Change Email */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Email Address</h4>
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={securityData.email}
                                onChange={(e) => setSecurityData({...securityData, email: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                         <p className="mt-1 text-xs text-gray-500">Changing your email will require re-verification.</p>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Change Password */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                             <div className="relative">
                                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={securityData.currentPassword}
                                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={securityData.newPassword}
                                onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Min 8 chars"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={securityData.confirmPassword}
                                onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Confirm new pass"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    {securitySuccess && <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle size={16}/> Credentials Updated</span>}
                    <button
                        type="submit"
                        disabled={securityLoading}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        {securityLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Update Security
                    </button>
                </div>
            </form>
        </section>

        {/* 3. Danger Zone */}
        <section className="bg-red-50 rounded-xl border border-red-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-red-100 bg-red-50/50">
                <h3 className="text-lg font-medium text-red-800 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Danger Zone
                </h3>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700 mt-1">
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