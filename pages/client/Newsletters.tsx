
import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { EmailCampaign } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Search, Newspaper, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock, Send, FileText, CalendarClock, Eye, Sparkles, Target, MousePointer } from 'lucide-react';
import DOMPurify from 'dompurify';

export const Newsletters = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (user?.clientId) {
      loadEmails();
    }
  }, [user]);

  const loadEmails = async () => {
    if (!user?.clientId) return;
    setLoading(true);
    const data = await MockBackend.getEmails(user.clientId);
    // Filter specifically for newsletters
    setEmails(data.filter(e => e.type === 'newsletter'));
    setLoading(false);
  };

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (email.prompt && email.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredEmails.length / ITEMS_PER_PAGE);
  const displayedEmails = filteredEmails.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Newsletters</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Create, customize and track your visual email campaigns.</p>
        </div>
        <Link 
          to="/client/newsletter-builder"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl shadow-lg text-white bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Create Newsletter
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/20">
          <div className="relative rounded-2xl shadow-sm max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              className="focus:ring-2 focus:ring-primary focus:border-primary block w-full pl-11 text-sm border-gray-200 dark:border-slate-700 rounded-xl py-3 bg-white dark:bg-slate-800 dark:text-white outline-none transition-all"
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-gray-400 dark:text-slate-500 font-medium animate-pulse">Loading newsletters...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                <thead className="bg-gray-50/50 dark:bg-slate-900">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Subject</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Open Rate</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Click Rate</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Copy Score</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Preview</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
                  {displayedEmails.length > 0 ? (
                    displayedEmails.map((email) => (
                      <tr key={email.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group">
                        <td className="px-8 py-6">
                          <div className="text-sm font-black text-gray-900 dark:text-white">{email.subject}</div>
                          <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 max-w-[200px] truncate font-bold uppercase tracking-tight flex items-center gap-1">
                             <Sparkles size={10} className="text-indigo-400" />
                             {email.prompt || 'Generated Campaign'}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                            ${email.status === 'sent' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 
                              email.status === 'scheduled' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 
                              'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                             {email.status === 'sent' && <Send size={10} className="mr-1.5" />}
                             {email.status === 'scheduled' && <CalendarClock size={10} className="mr-1.5" />}
                             {email.status === 'draft' && <FileText size={10} className="mr-1.5" />}
                            {email.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                            {email.status === 'sent' && email.openRate ? (
                                <div className="flex items-center gap-1.5">
                                    <Eye size={12} className="text-gray-400" />
                                    <span className="font-bold text-gray-700 dark:text-slate-300 text-xs">{email.openRate}%</span>
                                </div>
                            ) : (
                                <span className="text-gray-300 dark:text-slate-600 font-mono text-[10px]">-</span>
                            )}
                        </td>
                        <td className="px-8 py-6">
                            {email.status === 'sent' && email.clickRate ? (
                                <div className="flex items-center gap-1.5">
                                    <MousePointer size={12} className="text-gray-400" />
                                    <span className="font-bold text-gray-700 dark:text-slate-300 text-xs">{email.clickRate}%</span>
                                </div>
                            ) : (
                                <span className="text-gray-300 dark:text-slate-600 font-mono text-[10px]">-</span>
                            )}
                        </td>
                        <td className="px-8 py-6">
                            {email.score ? (
                                <div className="flex items-center gap-1.5">
                                    <Target size={12} className={email.score >= 80 ? 'text-emerald-500' : email.score >= 50 ? 'text-amber-500' : 'text-rose-500'} />
                                    <span className={`text-[10px] font-black ${email.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : email.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {email.score}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-gray-300 dark:text-slate-600 font-mono text-[10px]">-</span>
                            )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-gray-500 dark:text-slate-400">
                           {email.status === 'sent' && email.sentAt 
                             ? new Date(email.sentAt).toLocaleDateString() 
                             : email.status === 'scheduled' && email.scheduledAt
                             ? <span className="text-indigo-600 dark:text-indigo-400">{new Date(email.scheduledAt).toLocaleDateString()}</span>
                             : new Date(email.createdAt).toLocaleDateString()
                           }
                        </td>
                        <td className="px-8 py-6">
                           <div className="relative w-28 h-36 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md border border-gray-200 dark:border-slate-700 group-hover:border-primary/50 transition-all group-hover:-translate-y-1">
                                {/* Mock Browser Header */}
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 w-full flex items-center px-2 space-x-1.5 border-b border-gray-300 dark:border-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                </div>
                                
                                {/* Content Area - Scaled */}
                                <div className="relative w-full h-[calc(100%-16px)] bg-white overflow-hidden">
                                    {email.content ? (
                                        <div 
                                            className="origin-top-left transform scale-[0.25] w-[400%] h-[400%] p-8 pointer-events-none text-slate-800 overflow-hidden"
                                            // Security: Sanitize HTML preview using DOMPurify
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.content) }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <FileText size={14} />
                                            </div>
                                            <span className="text-[8px] font-bold uppercase tracking-wider">Empty Draft</span>
                                        </div>
                                    )}
                                </div>

                                {/* Hover Overlay */}
                                <Link 
                                    to="/client/newsletter-builder" 
                                    state={{ email }}
                                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 z-10"
                                >
                                    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <Eye size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                    </div>
                                </Link>
                            </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-gray-300 dark:text-slate-600">
                            <Newspaper size={32} />
                          </div>
                          <p className="font-black text-gray-900 dark:text-white text-lg tracking-tight">No newsletters found</p>
                          <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">Your visual campaign registry is currently empty. Start your first draft to reach your audience.</p>
                          <Link 
                            to="/client/newsletter-builder"
                            className="mt-6 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest"
                          >
                            Get Started Now
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-8 py-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/20 dark:bg-slate-800/10">
                    <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
                        Showing <span className="text-gray-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-gray-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmails.length)}</span> of <span className="text-gray-900 dark:text-white">{filteredEmails.length}</span> Results
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                             <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 text-[10px] font-black rounded-xl border transition-all ${
                                    currentPage === page 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' 
                                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
