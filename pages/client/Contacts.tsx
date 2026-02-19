
import React, { useEffect, useState, useMemo } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { BrevoService } from '../../services/brevoService';
import { ShopifyService } from '../../services/shopifyService';
import { useAuth } from '../../context/AuthContext';
import { Contact } from '../../types';
import { 
  Search, Plus, X, Loader2, User, Mail, Phone, MapPin, 
  Trash2, Filter, Download, MoreVertical, Building2, Home, Hash,
  ChevronUp, ChevronDown, ChevronsUpDown, CloudDownload, Key, CheckCircle, ShoppingBag, Store, ExternalLink, Check
} from 'lucide-react';

type SortConfig = {
  key: 'name' | 'email' | 'phone';
  direction: 'asc' | 'desc';
} | null;

export const Contacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  
  // Process States
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Import Credentials
  const [importApiKey, setImportApiKey] = useState('');
  const [shopifyConfig, setShopifyConfig] = useState({ domain: '', token: '' });
  
  const [importStatus, setImportStatus] = useState('');

  // Form State for new contact
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    if (user?.clientId) {
      loadContacts(user.clientId);
    }
  }, [user]);

  const loadContacts = async (clientId: string) => {
    setLoading(true);
    const data = await MockBackend.getContacts(clientId);
    setContacts(data);
    setLoading(false);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clientId || !newContact.name || !newContact.email) return;
    setIsAdding(true);
    try {
      await MockBackend.addContact(user.clientId, newContact);
      await loadContacts(user.clientId);
      setIsAddModalOpen(false);
      setNewContact({ name: '', surname: '', email: '', phone: '', address: '', apartment: '', city: '', state: '', postalCode: '' });
    } catch (error) {
      alert('Failed to add contact');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
      if (!user?.clientId) return;
      if (window.confirm("Are you sure you want to delete this contact?")) {
          await MockBackend.deleteContact(user.clientId, id);
          // Remove locally to avoid full reload flicker
          setContacts(prev => prev.filter(c => c.id !== id));
          setSelectedIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
          });
      }
  };

  const handleBulkDelete = async () => {
      if (!user?.clientId) return;
      if (window.confirm(`Are you sure you want to delete ${selectedIds.size} contacts? This cannot be undone.`)) {
          // Process deletes sequentially for mock purposes
          for (const id of selectedIds) {
              await MockBackend.deleteContact(user.clientId, id);
          }
          await loadContacts(user.clientId);
          setSelectedIds(new Set());
      }
  };

  const handleSelectAll = () => {
      if (selectedIds.size === sortedAndFilteredContacts.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(sortedAndFilteredContacts.map(c => c.id)));
      }
  };

  const toggleSelection = (id: string) => {
      const next = new Set(selectedIds);
      if (next.has(id)) {
          next.delete(id);
      } else {
          next.add(id);
      }
      setSelectedIds(next);
  };

  const handleBrevoImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clientId || !importApiKey) return;
    
    setIsImporting(true);
    setImportStatus('Connecting to Brevo API...');

    try {
      // 1. Fetch from Brevo
      const brevoContacts = await BrevoService.getContacts(importApiKey);
      
      if (brevoContacts.length === 0) {
        setImportStatus('No contacts found in Brevo.');
        setIsImporting(false);
        return;
      }

      setImportStatus(`Syncing ${brevoContacts.length} contacts...`);

      // 2. Map and Save to MockBackend
      let count = 0;
      for (const bContact of brevoContacts) {
        const mappedData = BrevoService.mapToAppContact(bContact);
        const newEmail = mappedData.email ? mappedData.email.toLowerCase() : '';

        // Skip if no email is present
        if (!newEmail) continue;

        const exists = contacts.find(c => c.email && c.email.toLowerCase() === newEmail);
        
        if (!exists) {
            await MockBackend.addContact(user.clientId, mappedData);
            count++;
        }
      }

      setImportStatus(`Successfully imported ${count} new contacts!`);
      setTimeout(async () => {
         await loadContacts(user.clientId);
         setIsImportModalOpen(false);
         setImportApiKey('');
         setImportStatus('');
         setIsImporting(false);
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setImportStatus(`Error: ${error.message}`);
      setIsImporting(false);
    }
  };

  const handleShopifyImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clientId || !shopifyConfig.domain || !shopifyConfig.token) return;

    setIsImporting(true);
    setImportStatus('Connecting to Shopify Store...');

    try {
      const shopifyCustomers = await ShopifyService.getCustomers(shopifyConfig.domain, shopifyConfig.token);
      
      if (shopifyCustomers.length === 0) {
        setImportStatus('No customers found in Shopify.');
        setIsImporting(false);
        return;
      }

      setImportStatus(`Syncing ${shopifyCustomers.length} customers...`);

      let count = 0;
      for (const customer of shopifyCustomers) {
        const mappedData = ShopifyService.mapToAppContact(customer);
        const newEmail = mappedData.email ? mappedData.email.toLowerCase() : '';

        if (!newEmail) continue;

        const exists = contacts.find(c => c.email && c.email.toLowerCase() === newEmail);
        
        if (!exists) {
            await MockBackend.addContact(user.clientId, mappedData);
            count++;
        }
      }

      setImportStatus(`Successfully imported ${count} Shopify customers!`);
      setTimeout(async () => {
         await loadContacts(user.clientId);
         setIsShopifyModalOpen(false);
         setShopifyConfig({ domain: '', token: '' });
         setImportStatus('');
         setIsImporting(false);
      }, 1500);
    } catch (error: any) {
       console.error(error);
       setImportStatus(`Error: ${error.message}`);
       setIsImporting(false);
    }
  };

  const handleSort = (key: 'name' | 'email' | 'phone') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredContacts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    
    let result = contacts.filter(c => {
      const name = (c.name || '').toLowerCase();
      const surname = (c.surname || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const fullName = `${name} ${surname}`;

      return (
        name.includes(lowerSearch) || 
        surname.includes(lowerSearch) || 
        fullName.includes(lowerSearch) || 
        email.includes(lowerSearch) ||
        phone.includes(lowerSearch)
      );
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aVal = '';
        let bVal = '';

        if (sortConfig.key === 'name') {
          aVal = `${a.name} ${a.surname}`.toLowerCase();
          bVal = `${b.name} ${b.surname}`.toLowerCase();
        } else {
          aVal = (a[sortConfig.key] || '').toLowerCase();
          bVal = (b[sortConfig.key] || '').toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [contacts, searchTerm, sortConfig]);

  const SortIndicator = ({ column }: { column: 'name' | 'email' | 'phone' }) => {
    if (sortConfig?.key !== column) return <ChevronsUpDown size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-indigo-500" /> : <ChevronDown size={12} className="text-indigo-500" />;
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white";

  const HeaderCell = ({ label, sortKey }: { label: string, sortKey: 'name' | 'email' | 'phone' }) => (
    <th 
      onClick={() => handleSort(sortKey)}
      className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIndicator column={sortKey} />
      </div>
    </th>
  );

  return (
    <div className="space-y-8 pb-20 animate-fade-in-up relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Contact Ledger</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium text-sm md:text-lg">Manage your mailing list and customer database.</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-black rounded-2xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm">
              <Download size={18} /> Export
            </button>
            <button onClick={() => setIsShopifyModalOpen(true)} className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all">
              <ShoppingBag size={18} /> Shopify Import
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
              <CloudDownload size={18} /> Brevo Import
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
              <Plus size={18} /> Add Contact
            </button>
        </div>
      </div>

      {/* Main Registry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up">
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/40 dark:bg-slate-800/20">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 outline-none transition-all font-bold text-xs uppercase tracking-widest shadow-sm bg-white dark:bg-slate-800 dark:text-white" 
              placeholder="Search by name, surname or email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{sortedAndFilteredContacts.length} Total Contacts</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
            <thead className="bg-white dark:bg-slate-900">
              <tr>
                <th className="px-8 py-5 text-left w-12">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                        checked={sortedAndFilteredContacts.length > 0 && selectedIds.size === sortedAndFilteredContacts.length}
                        onChange={handleSelectAll}
                    />
                </th>
                <HeaderCell label="Full Name" sortKey="name" />
                <HeaderCell label="Email Address" sortKey="email" />
                <HeaderCell label="Phone" sortKey="phone" />
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Source</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-slate-800">
                    <td className="px-8 py-6">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-800"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded"></div>
                          <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800/50 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded-md"></div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-slate-800 rounded-lg ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : sortedAndFilteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 dark:text-slate-500 italic">No contacts found in ledger.</td>
                </tr>
              ) : (
                sortedAndFilteredContacts.map((contact) => (
                  <tr key={contact.id} className={`group transition-all ${selectedIds.has(contact.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}>
                    <td className="px-8 py-6">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            checked={selectedIds.has(contact.id)}
                            onChange={() => toggleSelection(contact.id)}
                        />
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-black transition-all">
                                {contact.name.charAt(0)}
                            </div>
                            <div className="text-sm font-black text-gray-900 dark:text-white">{contact.name} {contact.surname}</div>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600 dark:text-slate-400">{contact.email}</td>
                    <td className="px-8 py-6 text-sm text-gray-600 dark:text-slate-400">{contact.phone || '—'}</td>
                    <td className="px-8 py-6">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            contact.source === 'brevo' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 
                            contact.source === 'shopify' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                           {contact.source || 'Manual'}
                        </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button onClick={() => handleDeleteContact(contact.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-800 rounded-2xl px-6 py-3 flex items-center gap-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none">
                    {selectedIds.size}
                </div>
                <span className="text-xs font-black text-gray-700 dark:text-white uppercase tracking-wider">Selected</span>
            </div>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700" />
            
            <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-bold text-xs uppercase tracking-widest transition-colors"
            >
                <Trash2 size={16} /> Delete
            </button>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700" />

            <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
            >
                <X size={18} />
            </button>
          </div>
      )}

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/5 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-zoom-in">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">New Contact Record</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24}/></button>
                </div>
                <form onSubmit={handleAddContact} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                            <input type="text" required value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className={inputClasses} placeholder="John" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Surname</label>
                            <input type="text" required value={newContact.surname} onChange={e => setNewContact({...newContact, surname: e.target.value})} className={inputClasses} placeholder="Doe" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input type="email" required value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className={inputClasses} placeholder="john@example.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input type="tel" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className={inputClasses} placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Location Details</p>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                        <input type="text" value={newContact.address} onChange={e => setNewContact({...newContact, address: e.target.value})} className={inputClasses} placeholder="123 Business Way" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                            <input type="text" value={newContact.city} onChange={e => setNewContact({...newContact, city: e.target.value})} className={inputClasses} placeholder="City" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State / Prov</label>
                            <input type="text" value={newContact.state} onChange={e => setNewContact({...newContact, state: e.target.value})} className={inputClasses} placeholder="State" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal Code</label>
                            <input type="text" value={newContact.postalCode} onChange={e => setNewContact({...newContact, postalCode: e.target.value})} className={inputClasses} placeholder="00000" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3.5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                        <button type="submit" disabled={isAdding} className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
                            {isAdding ? <Loader2 className="animate-spin mx-auto" /> : 'Create Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Brevo Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/5 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <CloudDownload className="text-emerald-500" size={24} />
                      Brevo Import
                    </h3>
                    <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24}/></button>
                </div>
                <form onSubmit={handleBrevoImport} className="p-8 space-y-6">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Enter your Brevo v3 API Key to sync contacts directly.
                    </p>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">API Key</label>
                        <div className="relative">
                           <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                           <input 
                              type="password" 
                              required 
                              value={importApiKey} 
                              onChange={e => setImportApiKey(e.target.value)} 
                              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white" 
                              placeholder="xkeysib-..." 
                           />
                        </div>
                    </div>

                    {importStatus && (
                      <div className={`p-4 rounded-xl text-xs font-bold ${importStatus.includes('Error') ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                        {importStatus.includes('Success') && <CheckCircle size={14} className="inline mr-2 -mt-0.5" />}
                        {importStatus}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsImportModalOpen(false)} className="flex-1 py-3.5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                        <button type="submit" disabled={isImporting || !importApiKey} className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50">
                            {isImporting ? <Loader2 className="animate-spin mx-auto" /> : 'Start Sync'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Shopify Import Modal */}
      {isShopifyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/5 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <ShoppingBag className="text-green-500" size={24} />
                      Shopify Import
                    </h3>
                    <button onClick={() => setIsShopifyModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24}/></button>
                </div>
                <form onSubmit={handleShopifyImport} className="p-8 space-y-6">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Sync customers from your Shopify store securely.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shop Domain</label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    required 
                                    value={shopifyConfig.domain} 
                                    onChange={e => setShopifyConfig({...shopifyConfig, domain: e.target.value})} 
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white" 
                                    placeholder="your-shop.myshopify.com" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Access Token</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="password" 
                                    required 
                                    value={shopifyConfig.token} 
                                    onChange={e => setShopifyConfig({...shopifyConfig, token: e.target.value})} 
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white" 
                                    placeholder="shpat_..." 
                                />
                            </div>
                            <p className="text-[9px] text-gray-400 ml-1">
                                Requires <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">read_customers</code> scope in Admin API.
                            </p>
                        </div>
                    </div>

                    {importStatus && (
                      <div className={`p-4 rounded-xl text-xs font-bold ${importStatus.includes('Error') ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20'}`}>
                        {importStatus.includes('Success') && <CheckCircle size={14} className="inline mr-2 -mt-0.5" />}
                        {importStatus}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsShopifyModalOpen(false)} className="flex-1 py-3.5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                        <button type="submit" disabled={isImporting || !shopifyConfig.token} className="flex-[2] py-3.5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all disabled:opacity-50">
                            {isImporting ? <Loader2 className="animate-spin mx-auto" /> : 'Sync Customers'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
