import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { Client } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { 
  Users, 
  DollarSign, 
  Activity, 
  UserCheck, 
  UserX, 
  MoreHorizontal, 
  CreditCard, 
  Calendar, 
  X,
  CheckCircle,
  AlertTriangle,
  Plus,
  Loader2,
  Search,
  Edit2,
  Trash2,
  Save,
  Clock,
  Eye,
  Server
} from 'lucide-react';

// Pricing Configuration
const PRICING = {
  basic: 29,
  pro: 99,
  enterprise: 299
};

// Generate fake history data for the graph based on current usage
const generateClientHistory = (usage: number) => {
    return Array.from({ length: 6 }).map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
        emails: Math.floor(usage * (0.5 + Math.random() * 0.5) * (i + 1) / 6)
    }));
};

export const AdminDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Filtering & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'pro' | 'enterprise'>('all');

  // Add Client State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', plan: 'basic' as 'basic' | 'pro' | 'enterprise' });
  const [isCreating, setIsCreating] = useState(false);

  // Edit Client State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await MockBackend.getClients();
    setClients(data);
    setLoading(false);
  };

  const handleToggleStatus = async (id: string) => {
    await MockBackend.toggleClientStatus(id);
    if (selectedClient && selectedClient.id === id) {
       setSelectedClient(prev => prev ? {...prev, status: prev.status === 'active' ? 'disabled' : 'active'} : null);
    }
    loadClients();
  };

  const handleUpdatePlan = async (id: string, newPlan: 'basic' | 'pro' | 'enterprise') => {
    await MockBackend.updateClientPlan(id, newPlan);
    if (selectedClient && selectedClient.id === id) {
        setSelectedClient(prev => prev ? {...prev, plan: newPlan} : null);
    }
    loadClients();
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name || !newClientData.email) return;

    setIsCreating(true);
    try {
      await MockBackend.createClient(newClientData.name, newClientData.plan, newClientData.email);
      await loadClients();
      setIsAddModalOpen(false);
      setNewClientData({ name: '', email: '', plan: 'basic' });
      alert('Client created successfully! Login credential created: ' + newClientData.email);
    } catch (error) {
      alert('Failed to create client');
    } finally {
      setIsCreating(false);
    }
  };

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
    setEditNameValue(client.name);
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    if (!selectedClient || !editNameValue.trim()) return;
    await MockBackend.updateClient(selectedClient.id, { name: editNameValue });
    setSelectedClient(prev => prev ? { ...prev, name: editNameValue } : null);
    setIsEditingName(false);
    loadClients();
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedClient.name}? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
        await MockBackend.deleteClient(selectedClient.id);
        setSelectedClient(null);
        await loadClients();
    } catch (error) {
        alert("Failed to delete client");
    } finally {
        setIsDeleting(false);
    }
  };

  // Filter Logic
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = client.name.toLowerCase().includes(term) || client.id.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesPlan = planFilter === 'all' || client.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Computed Metrics
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const totalContacts = clients.reduce((acc, c) => acc + c.contactCount, 0);
  const totalAiUsage = clients.reduce((acc, c) => acc + c.aiUsageCount, 0);
  const totalRevenue = clients.reduce((acc, c) => acc + PRICING[c.plan], 0);

  if (loading && !clients.length) return <div className="p-8 text-center text-gray-500 flex items-center justify-center h-full"><Loader2 className="animate-spin mr-2"/> Loading admin data...</div>;

  return (
    <div className="space-y-6 relative animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
           <p className="text-gray-500">Platform performance and client management.</p>
        </div>
        <div className="bg-white/50 px-3 py-1 rounded text-xs text-gray-400 border border-gray-100">
           Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Platform Health Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-slide-up-fade">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Server className="text-primary" size={20} /> 
                Platform Health
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                All Systems Operational
            </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Clients */}
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 relative overflow-hidden group animate-zoom-in animate-delay-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <p className="text-sm font-medium text-indigo-700">Active Clients</p>
                    <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                        <Users size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-3xl font-bold text-gray-900">{activeClientsCount}</p>
                    <p className="text-xs text-indigo-600 mt-1 font-medium">out of {clients.length} total accounts</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
                    <Users size={64} className="text-indigo-600" />
                </div>
            </div>
            
            {/* Total Contacts */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 relative overflow-hidden group animate-zoom-in animate-delay-200 hover:shadow-md transition-all">
                 <div className="flex justify-between items-start mb-2 relative z-10">
                    <p className="text-sm font-medium text-emerald-700">Total Contacts</p>
                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                        <UserCheck size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-3xl font-bold text-gray-900">{totalContacts.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">across all databases</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
                    <UserCheck size={64} className="text-emerald-600" />
                </div>
            </div>

            {/* AI Usage */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 relative overflow-hidden group animate-zoom-in animate-delay-300 hover:shadow-md transition-all">
                 <div className="flex justify-between items-start mb-2 relative z-10">
                    <p className="text-sm font-medium text-purple-700">AI Executions</p>
                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                        <Activity size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-3xl font-bold text-gray-900">{totalAiUsage.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 mt-1 font-medium">generations performed</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
                    <Activity size={64} className="text-purple-600" />
                </div>
            </div>
            
            {/* Revenue */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 relative overflow-hidden group animate-zoom-in animate-delay-500 hover:shadow-md transition-all">
                 <div className="flex justify-between items-start mb-2 relative z-10">
                    <p className="text-sm font-medium text-amber-700">Est. Revenue</p>
                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                        <DollarSign size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-amber-600 mt-1 font-medium">monthly recurring</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
                    <DollarSign size={64} className="text-amber-600" />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-zoom-in animate-delay-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Usage by Client</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clients}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#6b7280'}} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                    cursor={{ fill: '#f3f4f6' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="aiUsageCount" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Emails Generated" animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Revenue Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-zoom-in animate-delay-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
            <div className="space-y-5">
                {['basic', 'pro', 'enterprise'].map((plan, idx) => {
                    const count = clients.filter(c => c.plan === plan).length;
                    const percentage = Math.round((count / clients.length) * 100) || 0;
                    return (
                        <div key={plan} className="group">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="capitalize font-medium text-gray-700">{plan}</span>
                                <span className="text-gray-500">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${plan === 'enterprise' ? 'bg-purple-500' : plan === 'pro' ? 'bg-blue-500' : 'bg-gray-400'}`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">Most revenue comes from <span className="font-semibold text-gray-900">Pro</span> plans.</p>
            </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up-fade animate-delay-500">
        <div className="px-6 py-4 border-b border-gray-200">
           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Client Accounts</h3>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap shadow-sm hover:shadow"
              >
                <Plus size={16} />
                Add Client
              </button>
           </div>

           {/* Filters */}
           <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search clients by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm transition-shadow focus:shadow-sm"
                />
              </div>
              <div className="flex gap-3">
                 <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary bg-white min-w-[120px] cursor-pointer"
                 >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                 </select>
                 <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary bg-white min-w-[120px] cursor-pointer"
                 >
                    <option value="all">All Plans</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                 </select>
              </div>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client, i) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-gray-50 transition-colors animate-slide-up-fade"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-xs text-gray-500">ID: {client.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${client.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' : 
                          client.plan === 'pro' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.contactCount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.nextBillingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                         <button
                            onClick={() => handleToggleStatus(client.id)}
                            title={client.status === 'active' ? "Disable Account" : "Enable Account"}
                            className={`p-2 rounded-lg border transition-colors ${
                                client.status === 'active' 
                                ? 'bg-white border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50' 
                                : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                            }`}
                         >
                            {client.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                         </button>
                         <button 
                            onClick={() => openClientModal(client)}
                            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-200"
                         >
                            <MoreHorizontal size={16} />
                            Details
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <Search size={32} className="text-gray-300 mb-2" />
                            <p>No clients found matching your filters.</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 scale-100">
             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Add New Client</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             
             <form onSubmit={handleCreateClient} className="p-6 space-y-4">
               <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                    placeholder="e.g. My Awesome Shop"
                  />
               </div>
               <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    id="adminEmail"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                    placeholder="admin@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">This email will be used for login.</p>
               </div>
               <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    id="plan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={newClientData.plan}
                    onChange={(e) => setNewClientData({...newClientData, plan: e.target.value as any})}
                  >
                    <option value="basic">Basic ($29/mo)</option>
                    <option value="pro">Pro ($99/mo)</option>
                    <option value="enterprise">Enterprise ($299/mo)</option>
                  </select>
               </div>

               <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Create Client
                  </button>
               </div>
             </form>
           </div>
         </div>
      )}

      {/* Comprehensive Management Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                    {isEditingName ? (
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <input 
                                type="text" 
                                value={editNameValue} 
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                            />
                            <button onClick={handleSaveName} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={16}/></button>
                            <button onClick={() => setIsEditingName(false)} className="p-1 text-gray-500 hover:bg-gray-200 rounded"><X size={16}/></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h3 className="text-xl font-bold text-gray-900">{selectedClient.name}</h3>
                            <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"><Edit2 size={14}/></button>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-500">Client ID: {selectedClient.id}</p>
              </div>
              <button 
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              
              {/* Account Status Control */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${selectedClient.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {selectedClient.status === 'active' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Account Status</p>
                        <p className="text-sm text-gray-500">
                            {selectedClient.status === 'active' 
                                ? 'Account is live and accessible.' 
                                : 'Access is restricted.'}
                        </p>
                    </div>
                </div>
                <button 
                  onClick={() => handleToggleStatus(selectedClient.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
                    ${selectedClient.status === 'active' 
                        ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' 
                        : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'}`}
                >
                  {selectedClient.status === 'active' ? 'Disable Account' : 'Enable Account'}
                </button>
              </div>

              {/* Billing & Plan */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CreditCard size={14} /> Billing & Subscription
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Plan Card */}
                    <div className="border border-gray-200 rounded-lg p-4 relative overflow-hidden bg-white">
                        <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold capitalize text-gray-900">{selectedClient.plan}</span>
                            <span className="text-gray-500 mb-1">/ ${PRICING[selectedClient.plan]} mo</span>
                        </div>
                        <div className="space-y-2">
                             <p className="text-xs font-semibold text-gray-400 uppercase">Change Plan</p>
                             <div className="flex gap-2">
                                {(['basic', 'pro', 'enterprise'] as const).map(plan => (
                                    <button
                                        key={plan}
                                        onClick={() => handleUpdatePlan(selectedClient.id, plan)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors capitalize
                                            ${selectedClient.plan === plan 
                                                ? 'bg-primary text-white border-primary' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {plan}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Billing Details Card */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <p className="text-sm text-gray-500 mb-4">Invoice Details</p>
                        <div className="space-y-3">
                             <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600"><Calendar size={14} /> Next Invoice</span>
                                <span className="font-medium">{new Date(selectedClient.nextBillingDate).toLocaleDateString()}</span>
                             </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600"><DollarSign size={14} /> Amount Due</span>
                                <span className="font-medium">${PRICING[selectedClient.plan]}.00</span>
                             </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Last Payment</span>
                                <span className={`capitalize font-medium px-2 py-0.5 rounded text-xs ${selectedClient.lastPaymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedClient.lastPaymentStatus}
                                </span>
                             </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Advanced Usage Statistics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity size={14} /> Activity & Usage
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500">Total Contacts</p>
                        <p className="text-xl font-bold text-gray-900">{selectedClient.contactCount.toLocaleString()}</p>
                    </div>
                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500">AI Emails Generated</p>
                        <p className="text-xl font-bold text-gray-900">{selectedClient.aiUsageCount.toLocaleString()}</p>
                    </div>
                </div>
                
                {/* Visual Usage Chart */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-gray-500 mb-4">Email Generation History (Last 6 Months)</p>
                    <div className="h-40">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={generateClientHistory(selectedClient.aiUsageCount)}>
                                <defs>
                                    <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="emails" stroke="#4f46e5" fillOpacity={1} fill="url(#colorEmails)" animationDuration={1000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Recent Activity Mock */}
                 <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Recent Activity</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <Clock size={14} className="text-gray-400" />
                            <span>Logged in {new Date(selectedClient.lastLogin).toLocaleDateString()}</span>
                        </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <CheckCircle size={14} className="text-green-500" />
                            <span>Subscription renewed successfully</span>
                        </div>
                    </div>
                 </div>
              </div>
              
              {/* Danger Zone */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} /> Danger Zone
                </h4>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-red-600">Permanently remove this client and all their data.</p>
                    <button 
                        onClick={handleDeleteClient}
                        disabled={isDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                       {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                       Delete Client
                    </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};