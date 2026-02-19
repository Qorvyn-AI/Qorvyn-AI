
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';
import { StrategyItem } from '../../types';
import { 
    Sparkles, TrendingUp, Search, ArrowRight, DollarSign, Target, 
    Loader2, Building2, Check, Square, Plus, Trash2, 
    MoreHorizontal, ChevronRight, X, Lightbulb, BarChart, MessageSquare, Send, Mail
} from 'lucide-react';
import { MockBackend } from '../../services/mockBackend';
import { useNavigate } from 'react-router-dom';

export const GrowthStrategy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  
  // State
  const [generatedStrategies, setGeneratedStrategies] = useState<StrategyItem[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [savedStrategies, setSavedStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  
  // Deep Dive & Chat State
  const [activeStrategy, setActiveStrategy] = useState<StrategyItem | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Saved Data
  useEffect(() => {
    const loadData = async () => {
        if (user?.clientId) {
            const client = await MockBackend.getClientById(user.clientId);
            if (client) {
                setBusinessName(client.name);
                setIndustry(client.industry || '');
                setDescription(client.businessDescription || '');
                if (client.growthChecklist) {
                    setSavedStrategies(client.growthChecklist);
                }
            }
        }
    };
    loadData();
  }, [user]);

  // Scroll chat to bottom with delay to ensure DOM update
  useEffect(() => {
      if (activeStrategy) {
          setTimeout(() => {
              chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
      }
  }, [chatHistory, activeStrategy, chatLoading]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim() || !businessName.trim()) return;

    setLoading(true);
    setGeneratedStrategies([]); 
    setExecutiveSummary('');
    setProgress(0);
    
    // Realistic steps only
    const steps = [
        "Connecting to Strategy Engine...",
        `Scanning global trends for ${industry}...`,
        "Analyzing public pricing structures...", // Changed from "competitor revenue models"
        "Identifying market gaps...",
        "Drafting strategic hypotheses...", // Changed from "tactics" to suggest analysis
        "Finalizing executive summary..."
    ];

    setStatusMessage(steps[0]);

    // Progress Simulation - Faster & Smoother
    const progressInterval = setInterval(() => {
        setProgress(old => {
            if (old >= 95) return 95; // Cap at 95% until done
            // Faster decay function to reach ~80% quickly then slow down
            const remaining = 100 - old;
            const increment = Math.max(0.2, remaining / 25); 
            return old + increment;
        });
    }, 50); // Faster update rate (50ms) for smoother visual flow

    // Message Rotation - Faster rotation
    let stepIndex = 0;
    const messageInterval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
            setStatusMessage(steps[stepIndex]);
        }
    }, 1200); // Change message every 1.2s to indicate speed

    try {
      const response = await GeminiService.generateActionableStrategies(businessName, industry, description);
      
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgress(100);
      setStatusMessage("Finalizing Report...");
      
      // Allow user to see 100% briefly
      setTimeout(() => {
          setGeneratedStrategies(response.strategies);
          setExecutiveSummary(response.executiveSummary);
          setLoading(false);
      }, 600);

    } catch (error) {
      alert("Failed to analyze trends. Please try again.");
      setLoading(false);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    }
  };

  const handleSaveStrategy = async (strategy: StrategyItem) => {
      if (!user?.clientId) return;
      setSavedStrategies(prev => [...prev, strategy]);
      await MockBackend.saveStrategy(user.clientId, strategy);
  };

  const handleRemoveStrategy = async (id: string) => {
      if (!user?.clientId) return;
      if (!window.confirm("Remove this from your roadmap?")) return;
      setSavedStrategies(prev => prev.filter(s => s.id !== id));
      await MockBackend.removeStrategy(user.clientId, id);
  };

  const handleToggleComplete = async (id: string) => {
      if (!user?.clientId) return;
      setSavedStrategies(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
      await MockBackend.toggleStrategyCompletion(user.clientId, id);
  };

  const openDeepDive = (strategy: StrategyItem) => {
      setActiveStrategy(strategy);
      if (strategy.chatHistory && strategy.chatHistory.length > 0) {
          setChatHistory(strategy.chatHistory);
      } else {
          setChatHistory([{
              role: 'model',
              text: `I've analyzed "${strategy.title}". I can help you find vendors, estimate costs, or plan the installation. What would you like to know?`
          }]);
      }
  };

  const handleDraftEmail = (strategy: StrategyItem) => {
      navigate('/client/generator', {
          state: {
              instruction: strategy.emailPrompt || `Write a marketing email about: ${strategy.title} - ${strategy.description}`
          }
      });
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !activeStrategy || !user?.clientId) return;

      const userMsg = chatInput;
      setChatInput('');
      const newHistory = [...chatHistory, { role: 'user', text: userMsg } as const];
      setChatHistory(newHistory);
      setChatLoading(true);

      // Persist user message immediately
      const updatedStrategyUser = { ...activeStrategy, chatHistory: newHistory };
      setActiveStrategy(updatedStrategyUser);
      setSavedStrategies(prev => prev.map(s => s.id === activeStrategy.id ? updatedStrategyUser : s));
      await MockBackend.saveStrategy(user.clientId, updatedStrategyUser);

      try {
          const response = await GeminiService.chatWithStrategy(
              newHistory,
              activeStrategy,
              businessName
          );
          
          const finalHistory = [...newHistory, { role: 'model', text: response } as const];
          setChatHistory(finalHistory);
          
          // Persist model response
          const updatedStrategyModel = { ...activeStrategy, chatHistory: finalHistory };
          setActiveStrategy(updatedStrategyModel);
          setSavedStrategies(prev => prev.map(s => s.id === activeStrategy.id ? updatedStrategyModel : s));
          await MockBackend.saveStrategy(user.clientId, updatedStrategyModel);

      } catch (error) {
          setChatHistory(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Please try again." }]);
      } finally {
          setChatLoading(false);
      }
  };

  const renderDifficultyColor = (diff: string) => {
      switch(diff) {
          case 'Easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
          case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
          case 'Hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart className="text-primary" />
                Growth Strategy
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2 text-lg">
                Physical and operational upgrades tailored for <strong>{businessName}</strong>.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Generator */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm sticky top-6">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">New Analysis</h3>
                <form onSubmit={handleAnalyze} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Target Industry</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-slate-800 dark:text-white text-sm font-medium"
                                placeholder="e.g. Fine Dining"
                            />
                        </div>
                    </div>
                    {description && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Context Memory</p>
                            <p className="text-xs text-indigo-900 dark:text-indigo-200 line-clamp-3 leading-relaxed">{description}</p>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !industry}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {loading ? 'Consulting AI...' : 'Generate 3 Strategies'}
                    </button>
                </form>
                
                {/* Saved List Mini View */}
                {savedStrategies.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Your Roadmap ({savedStrategies.length})</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {savedStrategies.map(s => (
                                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 group transition-all hover:border-indigo-100 dark:hover:border-slate-600">
                                    <button 
                                        onClick={() => handleToggleComplete(s.id)} 
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${s.completed ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-200 dark:shadow-none scale-110' : 'border-gray-300 dark:border-slate-600 hover:border-green-400 hover:scale-105'}`}
                                    >
                                        {s.completed && <Check size={12} className="animate-zoom-in" strokeWidth={3} />}
                                    </button>
                                    <span className={`text-xs font-medium truncate flex-1 transition-all duration-300 ${s.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-slate-300'}`}>{s.title}</span>
                                    {s.isEmailOpportunity && <Mail size={12} className="text-indigo-500 flex-shrink-0" />}
                                    <button onClick={() => handleRemoveStrategy(s.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
          </div>

          {/* RIGHT: Results */}
          <div className="lg:col-span-8 space-y-8">
              {loading && (
                  <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 relative overflow-hidden shadow-lg">
                      {/* Background Pulse */}
                      <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10 animate-pulse"></div>
                      
                      <div className="relative z-10 w-full max-w-md px-6 text-center">
                          <div className="mb-8 relative">
                             <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-indigo-100 dark:border-indigo-900/50">
                                 <Loader2 className="animate-spin text-indigo-600" size={32} />
                             </div>
                             {/* Decorators */}
                             <div className="absolute top-0 right-1/4 animate-bounce delay-100"><Search className="text-purple-400" size={20}/></div>
                             <div className="absolute bottom-0 left-1/4 animate-bounce delay-300"><Sparkles className="text-amber-400" size={20}/></div>
                          </div>

                          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight animate-fade-in-up" key={statusMessage}>{statusMessage}</h3>
                          
                          {/* Progress Bar */}
                          <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 border border-gray-200 dark:border-slate-700">
                              <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                                  style={{ width: `${progress}%` }}
                              ></div>
                          </div>
                          
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                              <span>System Active</span>
                              <span>{Math.round(progress)}%</span>
                          </div>
                      </div>
                  </div>
              )}

              {!loading && generatedStrategies.length === 0 && savedStrategies.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-96 bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-slate-800 text-gray-400">
                      <Lightbulb size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">No strategies generated yet</p>
                      <p className="text-sm">Use the panel on the left to start.</p>
                  </div>
              )}

              {!loading && generatedStrategies.length > 0 && (
                  <div className="space-y-8 animate-fade-in-up">
                      <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white">Recommended Actions</h3>
                          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                              Freshly Generated
                          </span>
                      </div>

                      {generatedStrategies.map((strategy, index) => (
                          <div key={strategy.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                              <div className="p-8">
                                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                                              {index + 1}
                                          </div>
                                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">{strategy.title}</h4>
                                      </div>
                                      <div className="flex gap-2">
                                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${renderDifficultyColor(strategy.difficulty)}`}>
                                              {strategy.difficulty}
                                          </span>
                                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${strategy.impact === 'High' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700'}`}>
                                              {strategy.impact} Impact
                                          </span>
                                      </div>
                                  </div>
                                  
                                  <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6 pl-11 border-l-2 border-indigo-100 dark:border-slate-700">
                                      {strategy.description}
                                  </p>

                                  {strategy.rationale && (
                                      <div className="mb-6 ml-11 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                                          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                              <Target size={12} /> Analyst Rationale
                                          </p>
                                          <p className="text-xs font-medium text-gray-700 dark:text-slate-300 italic">"{strategy.rationale}"</p>
                                      </div>
                                  )}

                                  <div className="flex flex-wrap justify-end gap-3 pl-11">
                                      <button 
                                        onClick={() => openDeepDive(strategy)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                                      >
                                          <MessageSquare size={16} /> Research & Chat
                                      </button>
                                      
                                      {strategy.isEmailOpportunity && (
                                          <button 
                                            onClick={() => handleDraftEmail(strategy)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                                          >
                                              <Mail size={16} /> Draft Email Campaign
                                          </button>
                                      )}

                                      <button 
                                        onClick={() => handleSaveStrategy(strategy)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                                      >
                                          <Plus size={16} /> Add to Roadmap
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}

                      {executiveSummary && (
                          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
                              <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-indigo-300">Executive Summary</h4>
                              <p className="text-base leading-relaxed opacity-90 font-medium">
                                  {executiveSummary}
                              </p>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* Interactive Chat Modal */}
      {activeStrategy && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/5 backdrop-blur-[2px] animate-fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in border border-gray-200 dark:border-slate-800 flex flex-col md:flex-row">
                  
                  {/* Left: Strategy Context (Hidden on small mobile) */}
                  <div className="hidden md:block md:w-1/3 bg-gray-50 dark:bg-slate-950/50 border-r border-gray-200 dark:border-slate-800 p-8 overflow-y-auto">
                      <div className="mb-6">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Strategy</span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-4">{activeStrategy.title}</h3>
                          <div className="space-y-4 text-sm text-gray-600 dark:text-slate-400">
                              <p>{activeStrategy.description}</p>
                              {activeStrategy.rationale && (
                                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Why this works</span>
                                      <p className="italic">{activeStrategy.rationale}</p>
                                  </div>
                              )}
                          </div>
                      </div>
                      <div className="mt-auto space-y-3">
                          {activeStrategy.isEmailOpportunity && (
                              <button 
                                onClick={() => handleDraftEmail(activeStrategy)}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700"
                              >
                                  <Mail size={16} /> Draft Email Now
                              </button>
                          )}
                          <button onClick={() => setActiveStrategy(null)} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors py-3">
                              <ArrowRight className="rotate-180" size={14} /> Back to Dashboard
                          </button>
                      </div>
                  </div>

                  {/* Right: Chat Interface */}
                  <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-900 h-full">
                      <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                          <div className="flex items-center gap-2">
                              <Sparkles size={18} className="text-indigo-500" />
                              <span className="font-bold text-gray-900 dark:text-white">Research Assistant</span>
                          </div>
                          <button onClick={() => setActiveStrategy(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><X size={20} className="text-gray-400" /></button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
                          {chatHistory.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                      msg.role === 'user' 
                                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                          : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-sm border border-gray-200 dark:border-slate-700'
                                  }`}>
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          {chatLoading && (
                              <div className="flex justify-start">
                                  <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 border border-gray-200 dark:border-slate-700">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                  </div>
                              </div>
                          )}
                          <div ref={chatEndRef} />
                      </div>

                      <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 flex-shrink-0">
                          <form onSubmit={handleChatSubmit} className="relative flex items-center gap-3">
                              <input 
                                  type="text" 
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  placeholder="Ask follow-up questions..."
                                  className="flex-1 pl-6 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-sm text-base"
                                  autoFocus
                              />
                              <button 
                                type="submit" 
                                disabled={!chatInput.trim() || chatLoading}
                                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex-shrink-0"
                              >
                                  <Send size={20} />
                              </button>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
