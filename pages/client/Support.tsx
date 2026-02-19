
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MockBackend } from '../../services/mockBackend';
import { SupportTicket } from '../../types';
import { Send, Mic, MicOff, MessageSquare, Loader2, Clock, CheckCircle, Plus, Search, ChevronRight, User } from 'lucide-react';

export const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // New Message State
  const [newMessageText, setNewMessageText] = useState('');
  const [newSubject, setNewSubject] = useState(''); // Only for new tickets
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isNewTicketMode, setIsNewTicketMode] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
    
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setNewMessageText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [user]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (selectedTicketId && !loading) {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }
  }, [selectedTicketId, tickets]);

  const loadTickets = async () => {
    if (!user?.clientId) return;
    setLoading(true);
    const data = await MockBackend.getSupportTickets(user.clientId);
    // Sort by last updated (newest first)
    setTickets(data.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()));
    setLoading(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !user?.clientId) return;
    
    setSending(true);

    if (isNewTicketMode) {
        // Create new ticket
        const subject = newSubject.trim() || newMessageText.substring(0, 30) + "...";
        await MockBackend.sendSupportMessage(user.clientId, user.name, newMessageText, subject);
        setIsNewTicketMode(false);
        setNewSubject('');
    } else if (selectedTicketId) {
        // Reply to existing ticket
        await MockBackend.replyToTicket(selectedTicketId, newMessageText, 'user', user.name);
    }

    setNewMessageText('');
    await loadTickets();
    
    // If we just created a new ticket, select it (it will be the first one after sort)
    if (isNewTicketMode) {
        // We re-fetch tickets, so we grab the first one assuming it's the newest
        // Alternatively, sendSupportMessage could return the ID
        const updatedTickets = await MockBackend.getSupportTickets(user.clientId);
        const newest = updatedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (newest) setSelectedTicketId(newest.id);
    }

    setSending(false);
  };

  const handleSelectTicket = (id: string) => {
      setSelectedTicketId(id);
      setIsNewTicketMode(false);
      setNewMessageText('');
  };

  const handleCreateNew = () => {
      setIsNewTicketMode(true);
      setSelectedTicketId(null);
      setNewMessageText('');
      setNewSubject('');
  };

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100dvh-120px)] md:h-[calc(100vh-140px)] min-h-[500px] flex flex-col animate-fade-in-up">
      <div className="mb-4 md:mb-6 flex-shrink-0">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="text-primary" /> Support Center
        </h2>
        <p className="text-gray-500 dark:text-slate-400 font-medium mt-1 text-sm md:text-base">
            Direct line to the admin team.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Sidebar: List of Threads (Hidden on mobile when chat is active) */}
        <div className={`lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden ${selectedTicketId || isNewTicketMode ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Your Tickets</h3>
                <button 
                    onClick={handleCreateNew}
                    className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors"
                    title="New Request"
                >
                    <Plus size={18} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : tickets.length === 0 ? (
                    <div className="text-center p-8 text-gray-400 text-sm">No tickets found. Start a new conversation.</div>
                ) : (
                    tickets.map(ticket => (
                        <div 
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket.id)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                selectedTicketId === ticket.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' 
                                    : 'bg-white dark:bg-slate-900 border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {ticket.status}
                                </span>
                                <span className="text-[10px] text-gray-400">{new Date(ticket.lastUpdatedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className={`text-sm font-bold truncate mb-1 ${selectedTicketId === ticket.id ? 'text-indigo-900 dark:text-white' : 'text-gray-900 dark:text-slate-200'}`}>
                                {ticket.subject || "No Subject"}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                {ticket.messages[ticket.messages.length - 1]?.text || "No messages"}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Main Chat Area */}
        <div className={`lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative ${!selectedTicketId && !isNewTicketMode ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/30">
                <div className="flex items-center gap-2">
                    {/* Back Button for Mobile */}
                    <button 
                        onClick={() => { setSelectedTicketId(null); setIsNewTicketMode(false); }}
                        className="lg:hidden p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800"
                    >
                        <ChevronRight className="rotate-180" size={20} />
                    </button>

                    {isNewTicketMode ? (
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">New Request</h3>
                            <p className="text-xs text-gray-500">Describe your issue to start a thread.</p>
                        </div>
                    ) : activeTicket ? (
                        <div>
                            <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md">{activeTicket.subject}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-xs font-medium text-gray-500">Ticket ID: {activeTicket.id}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <MessageSquare className="text-gray-400" />
                            <span className="font-bold text-gray-400">Select a conversation</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-950/20">
                {!activeTicket && !isNewTicketMode ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Select a ticket from the left or create a new one.</p>
                        <button onClick={handleCreateNew} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Start New Ticket</button>
                    </div>
                ) : isNewTicketMode ? (
                    <div className="text-center p-10 text-gray-500">
                        <p>Start typing below to create your new support request.</p>
                    </div>
                ) : (
                    <>
                        {activeTicket?.messages.map((msg, idx) => {
                            const isMe = msg.sender === 'user';
                            return (
                                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isMe ? 'You' : msg.senderName}</span>
                                            <span className="text-[10px] text-gray-300">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            isMe 
                                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                                : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-tl-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            {(isNewTicketMode || activeTicket) && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                    {isNewTicketMode && (
                        <div className="mb-3">
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                                placeholder="Subject (Optional)"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                            />
                        </div>
                    )}
                    <form onSubmit={handleSend} className="relative flex items-end gap-2">
                        <div className="relative flex-1">
                            <textarea
                                rows={1} // Auto-grow logic could be added here
                                className="w-full pl-4 pr-12 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium resize-none"
                                placeholder={isListening ? "Listening..." : "Type your message..."}
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                            <button 
                                type="button"
                                onClick={toggleListening}
                                className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-indigo-600'}`}
                            >
                                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={sending || !newMessageText.trim()}
                            className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex-shrink-0"
                        >
                            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
