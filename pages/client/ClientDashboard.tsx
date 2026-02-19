
import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Client, EmailCampaign } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Users, Send, TrendingUp, ChevronLeft, ChevronRight, FileText, CheckCircle, Clock, Sparkles, Mail, Target } from 'lucide-react';
import { OnboardingTutorial } from '../../components/OnboardingTutorial';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<Client | null>(null);
  const [emails, setEmails] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchData = async () => {
      if (user?.clientId) {
        setIsLoading(true);
        try {
          const [client, campaignList] = await Promise.all([
            MockBackend.getClientById(user.clientId),
            MockBackend.getEmails(user.clientId)
          ]);
          if (client) setClientData(client);
          setEmails(campaignList);
        } catch (error) {
          console.error("Failed to load dashboard data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const totalPages = Math.ceil(emails.length / ITEMS_PER_PAGE);
  const displayedEmails = emails.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in-up pb-10">
      <OnboardingTutorial />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 md:gap-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <Sparkles className="text-indigo-500" size={14} />
            <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Status: Systems Online</span>
          </div>
          <h2 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
            {isLoading ? (
                <div className="h-10 w-64 bg-gray-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            ) : (
                `Welcome back, ${clientData?.name.split(' ')[0]}!`
            )}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium text-sm md:text-lg mt-1 md:mt-2 opacity-80">
            Keep track of your audience and email campaigns here.
          </p>
        </div>
        <Link 
          to="/client/generator"
          className="inline-flex items-center justify-center w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 text-sm font-black rounded-xl md:rounded-[1.5rem] shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          icon={Users} 
          label="Total Contacts" 
          value={clientData?.contactCount.toLocaleString()} 
          loading={isLoading}
          detail="Real-time Database" 
          color="indigo" 
        />
        <StatCard 
          icon={Mail} 
          label="Total Campaigns" 
          value={emails.length.toLocaleString()} 
          loading={isLoading}
          detail="Active drafts & history" 
          color="emerald" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Delivery Success" 
          value={`${emails.length ? Math.round((emails.filter(e => e.deliveryStatus === 'success').length / emails.length) * 100) : 0}%`} 
          loading={isLoading}
          detail="Across all sent emails" 
          color="amber" 
        />
      </div>

      {/* History Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/40 dark:bg-slate-800/20">
          <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Campaign Activity</h3>
        </div>
        
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
              <thead className="bg-white dark:bg-slate-900">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Campaign Subject</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Copy Score</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6">
                      <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded w-24"></div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-slate-800"></div>
                        <div className="h-4 w-8 bg-gray-200 dark:bg-slate-800 rounded"></div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="h-4 w-12 bg-gray-200 dark:bg-slate-800 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : emails.length === 0 ? (
            <div className="p-20 text-center text-gray-400 dark:text-slate-500 italic flex flex-col items-center justify-center h-full">
                <Mail size={48} className="mb-4 opacity-20" />
                <p>No campaign data available yet.</p>
                <Link to="/client/generator" className="mt-4 text-xs font-bold text-indigo-500 hover:underline">Draft your first email</Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
              <thead className="bg-white dark:bg-slate-900">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Campaign Subject</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Copy Score</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
                {displayedEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                    <td className="px-8 py-6 text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs">{email.subject}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${email.status === 'sent' ? 'bg-green-50 dark:bg-green-950 text-green-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                        {email.status}
                      </span>
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
                    <td className="px-8 py-6 text-xs text-gray-500">{new Date(email.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right">
                       <Link to="/client/generator" state={{ email }} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, detail, color, loading }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col group hover-lift transition-all">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-50 dark:bg-${color}-950 text-${color}-600 dark:text-${color}-400 mb-6`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
    {loading ? (
        <div className="h-9 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg animate-pulse mb-4"></div>
    ) : (
        <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-4">{value}</h3>
    )}
    <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800/50 text-[10px] font-bold text-gray-400">{detail}</div>
  </div>
);
