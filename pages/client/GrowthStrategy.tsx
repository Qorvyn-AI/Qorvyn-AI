import React, { useState } from 'react';
import { GeminiService, GrowthReport } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, TrendingUp, Search, ExternalLink, ArrowRight, DollarSign, Target, Loader2 } from 'lucide-react';
import { MockBackend } from '../../services/mockBackend';

export const GrowthStrategy = () => {
  const { user } = useAuth();
  const [industry, setIndustry] = useState('');
  const [report, setReport] = useState<GrowthReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize with business name if available
  React.useEffect(() => {
    if (user?.clientId && !industry) {
      MockBackend.getClientById(user.clientId).then(client => {
        if (client) setIndustry(client.name);
      });
    }
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim()) return;

    setLoading(true);
    try {
      const data = await GeminiService.generateGrowthReport(industry);
      setReport(data);
    } catch (error) {
      alert("Failed to analyze trends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render markdown-like content safely
  const renderContent = (content: string) => {
    // Basic formatting for the demo
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ') || line.startsWith('**')) {
        return <h3 key={index} className="text-lg font-bold text-gray-900 mt-6 mb-3">{line.replace(/##|\*\*/g, '')}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={index} className="ml-4 text-gray-700 mb-1">{line.replace(/[\*\-]\s/, '')}</li>;
      }
      if (line.startsWith('1. ')) {
         return <li key={index} className="ml-4 text-gray-700 mb-1 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      return <p key={index} className="text-gray-700 mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-primary" />
            Growth Strategy & Trends
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
            Find out what makes money in your industry right now. Powered by live Google Search data.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <form onSubmit={handleAnalyze} className="max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your Business Niche or Industry?
            </label>
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary text-lg"
                        placeholder="e.g. Artisan Bakery in New York, SaaS for Dentists..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !industry}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Analyze Market
                </button>
            </div>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-in fade-in">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Search size={24} className="text-primary" />
                </div>
            </div>
            <p className="mt-6 text-lg font-medium">Researching latest trends for "{industry}"...</p>
            <p className="text-sm">Scanning competitors, revenue models, and market news.</p>
        </div>
      )}

      {report && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
            {/* Main Report */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
                    <div className="prose prose-lg max-w-none">
                        {renderContent(report.content)}
                    </div>
                </div>
            </div>

            {/* Sidebar: Sources & Highlights */}
            <div className="space-y-6">
                
                {/* Highlights Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <DollarSign /> Money Makers
                    </h3>
                    <p className="opacity-90 mb-4 text-sm">
                        Focus on high-margin activities identified in the report to maximize your ROI this quarter.
                    </p>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="text-yellow-300" size={20} />
                            <span className="font-semibold">Customer Acquisition</span>
                        </div>
                        <p className="text-xs opacity-80">Use the checklist provided to streamline your funnel.</p>
                    </div>
                </div>

                {/* Sources Card (Grounding) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Search size={18} className="text-gray-500" />
                        Sources Verified
                    </h3>
                    {report.sources.length > 0 ? (
                        <ul className="space-y-3">
                            {report.sources.map((source, idx) => (
                                <li key={idx} className="group">
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                                    >
                                        <ExternalLink size={14} className="mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                        <span className="line-clamp-2">{source.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 italic">AI generated analysis based on general knowledge.</p>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                        Information provided by Google Search Grounding
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};