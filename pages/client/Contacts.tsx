import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { GeminiService, SegmentSuggestion } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';
import { Contact } from '../../types';
import { RefreshCw, Search, Plus, X, Loader2, Download, ExternalLink, Sparkles, PieChart, AlertTriangle, ArrowRight, UserCheck, Target, BarChart2, Mail, Calendar, Hash, Activity, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Contacts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Contact Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '' });
  const [isAdding, setIsAdding] = useState(false);

  // Brevo Modal State
  const [isBrevoModalOpen, setIsBrevoModalOpen] = useState(false);
  const [brevoApiKey, setBrevoApiKey] = useState('');
  const [importStep, setImportStep] = useState<'input' | 'review'>('input');
  const [pendingContacts, setPendingContacts] = useState<any[]>([]);

  // AI Segmentation State
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segments, setSegments] = useState<SegmentSuggestion[]>([]);
  const [showSegments, setShowSegments] = useState(false);

  // Selected Contact State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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

  const closeBrevoModal = () => {
    setIsBrevoModalOpen(false);
    setBrevoApiKey('');
    setImportStep('input');
    setPendingContacts([]);
    setSyncing(false);
  };

  const fetchBrevoContacts = async (apiKey: string) => {
    const response = await fetch("https://api.brevo.com/v3/contacts?limit=50&offset=0", {
      method: "GET",
      headers: {
        "accept": "application/json",
        "api-key": apiKey
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.contacts || []; 
  };

  const handleScanBrevo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clientId || !brevoApiKey) return;
    
    setSyncing(true);
    try {
        // 1. Fetch from Brevo
        const realContacts = await fetchBrevoContacts(brevoApiKey);
        
        // 2. Filter out existing contacts
        const newOnes = realContacts.filter((c: any) => {
             // Safety check: ensure Brevo contact has an email
             if (!c || !c.email) return false;

             return !contacts.some(existing => 
                existing.email && existing.email.toLowerCase() === c.email.toLowerCase()
             );
        });

        setPendingContacts(newOnes);
        setImportStep('review');
        
    } catch (error: any) {
        console.error("Brevo Import Error:", error);
        alert(`Failed to sync with Brevo. \n\nError: ${error.message}\n\nNote: If you see a CORS error in the console, your browser is blocking the request.`);
    } finally {
        setSyncing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!user?.clientId) return;
    setSyncing(true);

    try {
        let addedCount = 0;
        for (const c of pendingContacts) {
            // Brevo attributes often contain FIRSTNAME/LASTNAME. We default to 'Brevo Contact' if missing.
            const name = (c.attributes?.FIRSTNAME && c.attributes?.LASTNAME) 
                ? `${c.attributes.FIRSTNAME} ${c.attributes.LASTNAME}` 
                : (c.attributes?.FIRSTNAME || c.attributes?.NAME || 'Brevo Contact');
            
            await MockBackend.addContact(user.clientId, name, c.email);
            addedCount++;
        }

        await loadContacts(user.clientId);
        alert(`Success! Imported ${addedCount} new contacts from Brevo.`);
        closeBrevoModal();

    } catch (error) {
        alert("An error occurred during import.");
    } finally {
        setSyncing(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clientId || !newContact.name || !newContact.email) return;
    
    setIsAdding(true);
    try {
      await MockBackend.addContact(user.clientId, newContact.name, newContact.email);
      await loadContacts(user.clientId);
      setIsAddModalOpen(false);
      setNewContact({ name: '', email: '' });
    } catch (error) {
      alert('Failed to add contact');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAnalyzeSegments = async () => {
    if (contacts.length === 0) {
        alert("Add contacts first to analyze them.");
        return;
    }
    setIsSegmenting(true);
    try {
        const results = await GeminiService.analyzeSegments(contacts);
        setSegments(results);
        setShowSegments(true);
    } catch (error) {
        alert("Failed to analyze segments.");
    } finally {
        setIsSegmenting(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
          <p className="text-gray-500">Manage your audience and data sources.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAnalyzeSegments}
              disabled={isSegmenting}
              className="inline-flex items-center px-4 py-2 border border-purple-200 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none transition-colors"
            >
              {isSegmenting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Sparkles size={16} className="mr-2" />}
              AI Segments
            </button>
            <button
              onClick={() => setIsBrevoModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Download size={16} className="mr-2" />
              Import
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus size={16} className="mr-2" />
              Add Contact
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative rounded-md shadow-sm max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading contacts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                          ${contact.source === 'manual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {contact.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className={`h-1.5 rounded-full ${contact.engagementScore > 70 ? 'bg-green-500' : contact.engagementScore > 30 ? 'bg-yellow-500' : 'bg-red-400'}`} 
                                    style={{ width: `${contact.engagementScore}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-500">{contact.engagementScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contact.lastActive ? new Date(contact.lastActive).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No contacts found. Import from Brevo or add one manually.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Add New Contact</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             
             <form onSubmit={handleAddContact} className="p-6 space-y-4">
               <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="contactName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="e.g. Jane Doe"
                  />
               </div>
               <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="contactEmail"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    placeholder="jane@example.com"
                  />
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
                    disabled={isAdding}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isAdding ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Save Contact
                  </button>
               </div>
             </form>
           </div>
         </div>
      )}

      {/* Brevo Import Modal */}
      {isBrevoModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1.5 rounded text-green-700">
                        <Download size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Import from Brevo</h3>
                </div>
                <button 
                  onClick={closeBrevoModal}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             
             {importStep === 'input' ? (
                <form onSubmit={handleScanBrevo} className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    Connect your Brevo account to automatically import your existing contacts using the official API.
                  </p>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800 flex gap-2">
                      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                      <div>
                          <p className="font-bold mb-1">Browser Restriction Warning</p>
                          <p>
                            Brevo's API may block direct browser requests (CORS). If this fails, consider using a server-side proxy or testing in a development mode with CORS disabled.
                          </p>
                      </div>
                  </div>

                  <div>
                      <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">Brevo API Key (v3)</label>
                      <input
                        type="password"
                        id="apiKey"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                        value={brevoApiKey}
                        onChange={(e) => setBrevoApiKey(e.target.value)}
                        placeholder="xkeysib-..."
                      />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={closeBrevoModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {syncing ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                        Scan for Contacts
                      </button>
                  </div>
                </form>
             ) : (
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCheck className="text-blue-600" size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Import Summary</h4>
                        <p className="text-gray-600">
                            We found <span className="font-bold text-gray-900">{pendingContacts.length}</span> new contacts to import.
                        </p>
                        {pendingContacts.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Duplicate emails were automatically skipped.
                            </p>
                        )}
                    </div>

                    {pendingContacts.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto border border-gray-200">
                             <ul className="space-y-2">
                                {pendingContacts.map((c, i) => (
                                    <li key={i} className="text-sm flex justify-between">
                                        <span className="text-gray-900 font-medium truncate max-w-[150px]">{c.email}</span>
                                        <span className="text-xs text-gray-400">Ready</span>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-500">
                            No new unique contacts found. All detected contacts already exist in your list.
                        </div>
                    )}

                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                        type="button"
                        onClick={closeBrevoModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                        Cancel
                        </button>
                        <button 
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={syncing || pendingContacts.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {syncing ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                        Confirm Import
                        </button>
                    </div>
                </div>
             )}
           </div>
         </div>
      )}

      {/* Segmentation Results Modal */}
      {showSegments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-purple-50 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-purple-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-900">AI Contact Insights</h3>
                    </div>
                    <button 
                        onClick={() => setShowSegments(false)}
                        className="p-2 hover:bg-purple-100 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8">
                    <p className="text-gray-600 mb-6">Gemini analyzed your contacts (engagement, behavior, and source) and identified these segments:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {segments.map((seg, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <div className="mb-3">
                                    <PieChart className="text-purple-500 mb-2" size={24} />
                                    <h4 className="font-bold text-gray-900 text-lg">{seg.name}</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{seg.description}</p>
                                
                                <div className="mt-auto space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                                        <span className="font-semibold block mb-1 uppercase tracking-wide text-gray-400">Criteria</span>
                                        <code className="text-gray-700">{seg.criteria}</code>
                                    </div>
                                    
                                    {seg.marketing_angle && (
                                        <div className="bg-green-50 p-3 rounded-lg text-xs text-green-800 border border-green-100">
                                            <div className="flex items-center gap-1 font-semibold mb-1 text-green-700">
                                                <Target size={12} />
                                                <span className="uppercase tracking-wide">Strategy</span>
                                            </div>
                                            {seg.marketing_angle}
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => navigate('/client/generator', { 
                                            state: { 
                                                instruction: `Write a high-converting email campaign specifically targeting the "${seg.name}" segment.\n\nTarget Audience Profile: ${seg.description}\n\nMarketing Angle to use: ${seg.marketing_angle}\n\nKey Criteria: ${seg.criteria}`
                                            } 
                                        })}
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                                    >
                                        <Sparkles size={14} />
                                        Draft Campaign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button 
                        onClick={() => setShowSegments(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Contact Details</h3>
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                        {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900">{selectedContact.name}</h4>
                        <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                            <Mail size={14} />
                            <span className="text-sm">{selectedContact.email}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase mb-1">
                            <Download size={12} />
                            Source
                        </div>
                        <p className="font-medium capitalize text-gray-900">{selectedContact.source}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase mb-1">
                            <Hash size={12} />
                            External ID
                        </div>
                        <p className="font-medium font-mono text-sm truncate text-gray-900" title={selectedContact.brevoId}>{selectedContact.brevoId}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase mb-1">
                            <Activity size={12} />
                            Engagement
                        </div>
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${selectedContact.engagementScore > 70 ? 'bg-green-500' : selectedContact.engagementScore > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                             <span className="font-medium text-gray-900">{selectedContact.engagementScore}/100</span>
                        </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase mb-1">
                            <Calendar size={12} />
                            Last Active
                        </div>
                        <p className="font-medium text-gray-900">
                            {selectedContact.lastActive ? new Date(selectedContact.lastActive).toLocaleDateString() : 'Never'}
                        </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase mb-1">
                            <MapPin size={12} />
                            Location
                        </div>
                        <p className="font-medium text-gray-900 truncate" title={selectedContact.location}>
                            {selectedContact.location || 'Unknown'}
                        </p>
                    </div>
                     <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase mb-1">
                            <Briefcase size={12} />
                            Job Title
                        </div>
                        <p className="font-medium text-gray-900 truncate" title={selectedContact.jobTitle}>
                            {selectedContact.jobTitle || 'Unknown'}
                        </p>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={() => setSelectedContact(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};