
import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { Client, User } from '../../types';
import { 
  Search, Power, Settings, Wifi, Mail, User as UserIcon, Check, X, Shield, ArrowRight, Save,
  Trash2, Lock, RefreshCw, CreditCard, MapPin, Phone, AlertTriangle, Key, Calendar, Eye
} from 'lucide-react';

export const AdminClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // IT Support Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Edit Form States
  const [editForm, setEditForm] = useState({
      clientName: '',
      userName: '',
      email: '',
      phone: '',
      address: '',
      plan: 'basic' as 'basic'|'pro'|'enterprise'
  });
  
  // Security Action States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await MockBackend.getClients();
    setClients(data);
    setLoading(false);
  };

  const handleOpenSettings = async (client: Client) => {
      setModalLoading(true);
      setSelectedClient(client);
      
      // Reset States
      setNewPassword('');
      setConfirmPassword('');
      setSecuritySuccess('');

      // Fetch Primary User for Login Details
      const user = await MockBackend.getPrimaryUserForClient(client.id);
      setSelectedUser(user || null);

      // Populate Form
      setEditForm({
          clientName: client.name,
          userName: user?.name || 'N/A',
          email: user?.email || 'N/A',
          phone: client.phone || '',
          address: client.address || '',
          plan: client.plan
      });

      setIsModalOpen(true);
      setModalLoading(false);
  };

  const handleToggleStatus = async (e: React.MouseEvent, client: Client) => {
      e.stopPropagation(); // Prevent row click
      const newStatus = client.status === 'active' ? 'disabled' : 'active';
      const actionName = newStatus === 'active' ? 'Activate' : 'Disable';
      
      if (window.confirm(`Are you sure you want to ${actionName} access for ${client.name}?`)) {
          await MockBackend.updateClient(client.id, { status: newStatus });
          // Optimistic UI update
          setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: newStatus } : c));
      }
  };

  const handleSaveChanges = async () => {
      if (!selectedClient || !selectedUser) return;
      
      // Update Client Info
      await MockBackend.updateClient(selectedClient.id, {
          name: editForm.clientName,
          plan: editForm.plan,
          phone: editForm.phone,
          address: editForm.address
      });

      // Update User Info (Name/Email)
      // Note: Changing email here updates the login email
      await MockBackend.adminUpdateUser(selectedUser.id, {
          name: editForm.userName,
          email: editForm.email
      });

      alert("Client profile updated successfully.");
      setIsModalOpen(false);
      loadClients();
  };

  const handleChangePassword = async () => {
      if (!selectedUser) return;
      if (newPassword !== confirmPassword) {
          alert("Passwords do not match.");
          return;
      }
      if (newPassword.length < 6) {
          alert("Password too short.");
          return;
      }

      await MockBackend.adminUpdateUser(selectedUser.id, { password: newPassword });
      setSecuritySuccess("Password updated successfully.");
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 3000);
  };

  const handleRecoverAccount = async () => {
      if (!selectedClient) return;
      if (window.confirm("This will unlock the account and set status to Active. Continue?")) {
          await MockBackend.updateClient(selectedClient.id, { status: 'active' });
          setSelectedClient({...selectedClient, status: 'active'});
          loadClients(); // Refresh background list
          alert("Account recovered.");
      }
  };

  const handleDeleteAccount = async () => {
      if (!selectedClient) return;
      const confirmText = prompt(`TYPE "DELETE" to permanently destroy the account for ${selectedClient.name}. This cannot be undone.`);
      if (confirmText === "DELETE") {
          await MockBackend.deleteClient(selectedClient.id);
          setIsModalOpen(false);
          loadClients();
      }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Client Registry</h2>
           <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Global IT Administration Console.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
            <input 
            type="text" 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 outline-none transition-all font-bold text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm" 
            placeholder="Search by name or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
            <thead className="bg-gray-50/50 dark:bg-slate-950/20">
            <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Client Identity</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Services</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Controls</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
            {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-all group cursor-pointer" onClick={() => handleOpenSettings(client)}>
                <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${client.status === 'active' ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                            {client.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1.5">{client.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono tracking-tighter">ID: {client.id}</div>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                        {client.plan}
                    </span>
                </td>
                <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            client.status === 'active' 
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600'
                        }`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                       {client.status}
                    </div>
                </td>
                <td className="px-8 py-6">
                    <div className="flex gap-2 text-gray-400">
                        {client.wifiPortalConfig && (
                            <div title="Wifi Active">
                                <Wifi size={16} className="text-indigo-500" />
                            </div>
                        )}
                        {client.contactCount > 0 && (
                            <div title="Contacts Active">
                                <UserIcon size={16} className="text-purple-500" />
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* Toggle Status Button */}
                        <button
                            onClick={(e) => handleToggleStatus(e, client)}
                            className={`p-2 rounded-lg transition-colors border border-transparent ${
                                client.status === 'active' 
                                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-900/20' 
                                : 'text-green-500 hover:text-green-600 hover:bg-green-50 hover:border-green-100 dark:hover:bg-green-900/20'
                            }`}
                            title={client.status === 'active' ? "Disable Access" : "Activate Access"}
                        >
                            <Power size={18} />
                        </button>

                        {/* View Details Button */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenSettings(client); }}
                            className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-transparent hover:border-indigo-100" 
                            title="View Details"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
      </div>

      {/* IT Support Modal */}
      {isModalOpen && selectedClient && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/5 backdrop-blur-[2px] animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl h-[90vh] shadow-2xl animate-zoom-in border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/50">
                      <div>
                          <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedClient.name}</h3>
                              {selectedClient.status === 'disabled' && (
                                  <button onClick={handleRecoverAccount} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 hover:bg-green-200 transition-colors">
                                      <RefreshCw size={12} /> Recover
                                  </button>
                              )}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                              <span className="font-mono">ID: {selectedClient.id}</span>
                              <span className="flex items-center gap-1"><Shield size={12} className="text-indigo-500"/> IT Admin Mode</span>
                          </div>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"><X size={20} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-10">
                      
                      {/* Section 1: Profile & Identity */}
                      <section className="space-y-4">
                          <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              <UserIcon size={16} /> Profile Identity
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-slate-950/30 border border-gray-100 dark:border-slate-800">
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Company Name</label>
                                  <input type="text" value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Primary Contact (User)</label>
                                  <input type="text" value={editForm.userName} onChange={e => setEditForm({...editForm, userName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Login Email</label>
                                  <div className="relative">
                                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                      <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white" />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                                  <div className="relative">
                                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                      <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white" placeholder="Not set" />
                                  </div>
                              </div>
                              <div className="md:col-span-2">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Billing Address</label>
                                  <div className="relative">
                                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                      <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white" placeholder="Not set" />
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Section 2: Subscription & Billing */}
                      <section className="space-y-4">
                          <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              <CreditCard size={16} /> Subscription & Billing
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-slate-950/30 border border-gray-100 dark:border-slate-800">
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Current Plan</label>
                                  <select 
                                      value={editForm.plan}
                                      onChange={(e) => setEditForm({...editForm, plan: e.target.value as any})}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white uppercase"
                                  >
                                      <option value="basic">Basic</option>
                                      <option value="pro">Pro</option>
                                      <option value="enterprise">Enterprise</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Payment Method</label>
                                  <div className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                                      <CreditCard size={14} /> {selectedClient.paymentMethod || 'None on file'}
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Next Billing</label>
                                  <div className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                                      <Calendar size={14} /> {new Date(selectedClient.nextBillingDate).toLocaleDateString()}
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Section 3: Security & Danger Zone */}
                      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          
                          {/* Password Reset */}
                          <div className="space-y-4">
                              <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Lock size={16} /> Security
                              </h4>
                              <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                                  <div>
                                      <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                                      <div className="relative">
                                          <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                                          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white" placeholder="Min 6 chars" />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white" placeholder="Repeat password" />
                                  </div>
                                  
                                  {securitySuccess && <p className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={12}/> {securitySuccess}</p>}

                                  <button onClick={handleChangePassword} disabled={!newPassword} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                      Reset User Password
                                  </button>
                              </div>
                          </div>

                          {/* Danger Zone */}
                          <div className="space-y-4">
                              <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <AlertTriangle size={16} /> Danger Zone
                              </h4>
                              <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 space-y-4 h-full flex flex-col justify-center">
                                  <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                                      Actions here are irreversible. Deleting an account removes all contacts, emails, and history immediately.
                                  </p>
                                  <button onClick={handleDeleteAccount} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                                      <Trash2 size={16} /> Delete Account Permanently
                                  </button>
                              </div>
                          </div>
                      </section>

                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                      <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-xs uppercase tracking-widest">
                          Cancel
                      </button>
                      <button onClick={handleSaveChanges} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2">
                          <Save size={16} /> Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
