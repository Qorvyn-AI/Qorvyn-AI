
import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { Client } from '../../types';
import { 
  Users, DollarSign, Shield, Server, Activity, ArrowUp, Globe, Clock, Zap
} from 'lucide-react';

const PRICING = { basic: 29, pro: 99, enterprise: 299 };

export const AdminDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState<{action: string, time: string, details: string}[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await MockBackend.getClients();
    setClients(data);
    
    // Simulate Logs based on client activity (Mock Data)
    const logs = [
        { action: 'LOGIN', time: '2 mins ago', details: 'Client "Acme Corp" initiated session.' },
        { action: 'API_CALL', time: '5 mins ago', details: 'Gemini 3 Pro generated 12 emails.' },
        { action: 'PAYMENT', time: '12 mins ago', details: 'Subscription renewal: "Brew & Bean".' },
        { action: 'SIGNUP', time: '1 hour ago', details: 'New registration: "Urban Vogue".' },
        { action: 'SUPPORT', time: '2 hours ago', details: 'Ticket #4292 opened by "Iron Pulse Gym".' }
    ];
    setRecentLogs(logs);
    setLoading(false);
  };

  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((acc, c) => acc + PRICING[c.plan], 0);
  const totalContacts = clients.reduce((acc, c) => acc + c.contactCount, 0);

  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><Shield className="text-indigo-600 animate-pulse" size={24}/></div>
        </div>
        <span className="font-black text-gray-400 dark:text-slate-600 text-xs uppercase tracking-[0.2em] animate-pulse">Initializing System Core...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Global Status: Optimal</span>
           </div>
           <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">System Overview</h2>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 px-2">Server Load</span>
            <div className="h-2 w-24 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[35%] animate-pulse"></div>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">35%</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Accounts" value={clients.length} color="indigo" delay="animate-delay-100" />
        <StatCard icon={Activity} label="Active Sessions" value={activeClientsCount} color="emerald" delay="animate-delay-200" />
        <StatCard icon={Globe} label="Total Contacts Managed" value={totalContacts.toLocaleString()} color="purple" delay="animate-delay-300" />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} color="amber" delay="animate-delay-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Zap className="text-yellow-500" size={18} /> Live System Feed
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {recentLogs.map((log, i) => (
                      <div key={i} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/30"></div>
                              {i !== recentLogs.length - 1 && <div className="w-px h-full bg-gray-100 dark:bg-slate-800 mt-2"></div>}
                          </div>
                          <div className="pb-6">
                              <div className="flex items-center gap-3 mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">{log.action}</span>
                                  <span className="text-[10px] font-bold text-gray-400">{log.time}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {log.details}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Quick Stats / Server Health */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Server size={120} />
              </div>
              
              <div>
                  <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">System Healthy</span>
                  </div>
                  <h3 className="text-3xl font-black mb-2">99.99%</h3>
                  <p className="text-indigo-300 text-sm font-medium">Uptime this month</p>
              </div>

              <div className="space-y-4 mt-8">
                  <div>
                      <div className="flex justify-between text-xs font-bold mb-1 text-indigo-200">
                          <span>API Latency</span>
                          <span>24ms</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 w-[15%]"></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs font-bold mb-1 text-indigo-200">
                          <span>Database IOPS</span>
                          <span>1.2k/s</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 w-[45%]"></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs font-bold mb-1 text-indigo-200">
                          <span>AI Token Usage</span>
                          <span>85%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 w-[85%]"></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-${color}-200 transition-all animate-fade-in-up ${delay} hover-lift`}>
        <div className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 group-hover:rotate-6 transition-transform shadow-sm`}><Icon size={24}/></div>
        <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</h3>
        </div>
    </div>
);
