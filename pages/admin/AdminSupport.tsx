
import React, { useEffect, useState, useRef } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { SupportTicket } from '../../types';
import { MessageSquare, CheckCircle, AlertTriangle, Send, Loader2, Inbox, Clock } from 'lucide-react';

export const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
      if (selectedTicketId) {
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
  }, [selectedTicketId, tickets]);

  const loadTickets = async () => {
    const data = await MockBackend.getSupportTickets();
    const sorted = data.sort((a, b) => {
        // Priority to open tickets, then date
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (a.status !== 'open' && b.status === 'open') return 1;
        return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    });
    setTickets(sorted);
  };

  const handleSendReply = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTicketId || !replyText.trim()) return;
      setSendingReply(true);
      await MockBackend.replyToTicket(selectedTicketId, replyText, 'admin', 'Support Team');
      setReplyText('');
      await loadTickets();
      setSendingReply(false);
  };

  const filteredTickets = tickets.filter(t => filter === 'all' ? true : t.status === filter);
  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col pb-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Support Inbox</h2>
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800">
                {['all', 'open', 'resolved'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Ticket List */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Queue</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredTickets.map(ticket => (
                        <div 
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedTicketId === ticket.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-900 border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold truncate ${selectedTicketId === ticket.id ? 'text-indigo-100' : 'text-gray-900 dark:text-white'}`}>{ticket.clientName}</span>
                                <span className={`text-[9px] font-mono opacity-60 ${selectedTicketId === ticket.id ? 'text-white' : 'text-gray-400'}`}>{new Date(ticket.lastUpdatedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className={`text-xs truncate mb-2 ${selectedTicketId === ticket.id ? 'text-white/90' : 'text-gray-500 dark:text-slate-400'}`}>{ticket.subject}</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                                <span className={`text-[9px] font-black uppercase tracking-wider ${selectedTicketId === ticket.id ? 'text-white/80' : 'text-gray-400'}`}>{ticket.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative">
                {activeTicket ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm z-10">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare size={14} className="text-indigo-500"/> 
                                    {activeTicket.subject}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">ID: {activeTicket.id}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 ${activeTicket.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {activeTicket.status === 'open' ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                                {activeTicket.status}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/30">
                            {activeTicket.messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-tl-none'}`}>
                                            <div className="mb-1 text-[9px] font-bold uppercase tracking-wider opacity-70">{isAdmin ? 'Support Agent' : msg.senderName}</div>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                            <form onSubmit={handleSendReply} className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Reply to client..."
                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                                <button type="submit" disabled={sendingReply || !replyText.trim()} className="p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all">
                                    {sendingReply ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">Select a Ticket</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
