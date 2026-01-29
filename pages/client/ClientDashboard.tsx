import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Client, EmailCampaign } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Users, Send, TrendingUp, ChevronLeft, ChevronRight, FileText, CheckCircle, AlertCircle, Clock, CalendarClock } from 'lucide-react';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<Client | null>(null);
  const [emails, setEmails] = useState<EmailCampaign[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (user?.clientId) {
      MockBackend.getClientById(user.clientId).then(c => c && setClientData(c));
      MockBackend.getEmails(user.clientId).then(e => setEmails(e));
    }
  }, [user]);

  if (!clientData) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;

  // Pagination Logic
  const totalPages = Math.ceil(emails.length / ITEMS_PER_PAGE);
  const displayedEmails = emails.slice(
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 animate-slide-in-left">Welcome back, {clientData.name}</h2>
          <p className="text-gray-500 animate-slide-in-left animate-delay-100">Here's what's happening with your campaigns.</p>
        </div>
        <Link 
          to="/client/generator"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5 animate-zoom-in animate-delay-200"
        >
          <Plus size={16} className="mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow animate-zoom-in animate-delay-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Contacts</p>
              <h3 className="text-2xl font-bold text-gray-900">{clientData.contactCount.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>Synced from Brevo</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow animate-zoom-in animate-delay-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Send size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Emails Generated</p>
              <h3 className="text-2xl font-bold text-gray-900">{clientData.aiUsageCount.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-500">
            <span>Using Gemini AI</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow animate-zoom-in animate-delay-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Campaigns Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {emails.filter(e => e.status === 'sent').length}
              </h3>
            </div>
          </div>
           <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-500">
            <span>Lifetime performance</span>
          </div>
        </div>
      </div>

      {/* Campaign History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col animate-slide-up-fade animate-delay-500">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Campaign History</h3>
        </div>
        
        <div className="overflow-x-auto">
          {emails.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Send size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No campaigns yet</p>
              <p className="mb-4">Get started by creating your first AI-powered email.</p>
              <Link 
                to="/client/generator"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Create Campaign &rarr;
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Sent / Scheduled</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Content Preview</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedEmails.map((email, idx) => (
                  <tr 
                    key={email.id} 
                    className="hover:bg-gray-50 transition-colors animate-slide-up-fade"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{email.prompt ? `Prompt: ${email.prompt.substring(0, 50)}...` : 'No prompt data'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${email.status === 'sent' ? 'bg-green-100 text-green-800' : 
                          email.status === 'scheduled' ? 'bg-indigo-100 text-indigo-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       {email.status === 'sent' ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${email.deliveryStatus === 'success' ? 'bg-green-100 text-green-800' : 
                            email.deliveryStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {email.deliveryStatus === 'success' && <CheckCircle size={12} />}
                          {email.deliveryStatus === 'failed' && <AlertCircle size={12} />}
                          {email.deliveryStatus === 'pending' && <Clock size={12} />}
                          {email.deliveryStatus || 'Pending'}
                        </span>
                      ) : email.status === 'scheduled' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <CalendarClock size={12} /> Scheduled
                         </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {email.status === 'sent' && email.sentAt 
                        ? (
                            <div>
                                <span>{new Date(email.sentAt).toLocaleDateString()}</span>
                                <span className="text-xs text-gray-400 block">{new Date(email.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          )
                        : email.status === 'scheduled' && email.scheduledAt
                        ? (
                            <div className="text-indigo-600 font-medium">
                                <span>{new Date(email.scheduledAt).toLocaleDateString()}</span>
                                <span className="text-xs text-indigo-400 block">{new Date(email.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        )
                        : <span className="text-gray-400 italic">Draft (Created {new Date(email.createdAt).toLocaleDateString()})</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                       {email.content.substring(0, 30)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700 hidden sm:block">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, emails.length)}</span> of <span className="font-medium">{emails.length}</span> results
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                         <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                                currentPage === page 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next Page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};