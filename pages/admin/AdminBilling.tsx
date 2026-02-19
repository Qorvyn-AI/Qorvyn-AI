
import React, { useEffect, useState } from 'react';
import { MockBackend } from '../../services/mockBackend';
import { Client } from '../../types';
import { CreditCard, TrendingUp, DollarSign, Calendar, Download, CheckCircle } from 'lucide-react';

const PRICING = { basic: 29, pro: 99, enterprise: 299 };

export const AdminBilling = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        setLoading(true);
        const data = await MockBackend.getClients();
        setClients(data);
        setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = clients.reduce((acc, c) => acc + PRICING[c.plan], 0);
  const planDistribution = {
      basic: clients.filter(c => c.plan === 'basic').length,
      pro: clients.filter(c => c.plan === 'pro').length,
      enterprise: clients.filter(c => c.plan === 'enterprise').length
  };

  // Mock Invoice Generator
  const mockInvoices = clients.slice(0, 10).map((client, i) => ({
      id: `inv_${1000 + i}`,
      clientName: client.name,
      amount: PRICING[client.plan],
      date: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString(),
      status: 'Paid'
  }));

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Billing & Revenue</h2>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20"><DollarSign size={80} /></div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Monthly Recurring Revenue</p>
                <h3 className="text-4xl font-black">${totalRevenue.toLocaleString()}</h3>
                <div className="mt-4 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                    <TrendingUp size={12} /> +12% vs last month
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <p className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Plan Distribution</p>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Basic ($29)</span>
                        <span className="text-sm font-black text-indigo-600">{planDistribution.basic}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gray-400 h-full" style={{width: `${(planDistribution.basic / clients.length) * 100}%`}}></div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Pro ($99)</span>
                        <span className="text-sm font-black text-indigo-600">{planDistribution.pro}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{width: `${(planDistribution.pro / clients.length) * 100}%`}}></div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Enterprise ($299)</span>
                        <span className="text-sm font-black text-indigo-600">{planDistribution.enterprise}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full" style={{width: `${(planDistribution.enterprise / clients.length) * 100}%`}}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">All Systems Go</h3>
                <p className="text-sm text-gray-500 mt-2">No overdue payments detected in the current billing cycle.</p>
            </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent Transactions</h3>
                <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                    <Download size={14} /> Export CSV
                </button>
            </div>
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-950/30">
                    <tr>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice ID</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                    {mockInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-8 py-5 text-sm font-mono text-gray-500">{inv.id}</td>
                            <td className="px-8 py-5 text-sm font-bold text-gray-900 dark:text-white">{inv.clientName}</td>
                            <td className="px-8 py-5 text-sm text-gray-500">{inv.date}</td>
                            <td className="px-8 py-5 text-sm font-bold text-gray-900 dark:text-white">${inv.amount}.00</td>
                            <td className="px-8 py-5 text-right">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                                    <CheckCircle size={10} /> Paid
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
