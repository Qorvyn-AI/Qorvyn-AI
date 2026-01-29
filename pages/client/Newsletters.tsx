import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { EmailCampaign } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Search, Newspaper, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock, Send, FileText, CalendarClock } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Newsletters</h2>
          <p className="text-gray-500">Create, customize and track your visual email campaigns.</p>
        </div>
        <Link 
          to="/client/newsletter-builder"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Create Newsletter
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative rounded-md shadow-sm max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
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
          <div className="p-12 text-center text-gray-500">Loading newsletters...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visual Preview</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedEmails.length > 0 ? (
                    displayedEmails.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                          <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{email.prompt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${email.status === 'sent' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              email.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 
                              'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                             {email.status === 'sent' && <Send size={10} className="mr-1" />}
                             {email.status === 'scheduled' && <CalendarClock size={10} className="mr-1" />}
                             {email.status === 'draft' && <FileText size={10} className="mr-1" />}
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
                                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                    Scheduled
                                </span>
                            ) : (
                                <span className="text-gray-400 text-xs">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {email.status === 'sent' && email.sentAt 
                             ? new Date(email.sentAt).toLocaleDateString() 
                             : email.status === 'scheduled' && email.scheduledAt
                             ? <span className="text-indigo-600">{new Date(email.scheduledAt).toLocaleDateString()}</span>
                             : new Date(email.createdAt).toLocaleDateString()
                           }
                        </td>
                        <td className="px-6 py-4">
                          {/* Visual Preview Container */}
                          <div className="relative w-24 h-32 bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm group-hover:shadow-md transition-shadow group-hover:border-primary/30">
                             <div 
                                className="origin-top-left transform scale-[0.20] w-[500%] h-[500%] overflow-hidden bg-white text-black p-4 pointer-events-none"
                                dangerouslySetInnerHTML={{ __html: email.content }}
                             />
                             {/* Glossy Overlay */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                             
                             {/* Edit/View Overlay on Hover */}
                             <Link 
                                to="/client/newsletter-builder" 
                                state={{ email }}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                             >
                                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-900 shadow-lg">Edit</span>
                             </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Newspaper size={32} className="text-gray-300 mb-2" />
                          <p className="font-medium text-gray-900">No newsletters found</p>
                          <p>Start a new campaign to reach your audience.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700 hidden sm:block">
                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmails.length)}</span> of <span className="font-medium">{filteredEmails.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        >
                            <ChevronRight size={16} />
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