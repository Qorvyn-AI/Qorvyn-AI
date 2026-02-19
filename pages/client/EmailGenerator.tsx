
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService, GeneratedEmail } from '../../services/geminiService';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Save, Send as SendIcon, CheckCircle, CalendarClock, X, Loader2, RefreshCw, ExternalLink, Globe, Mic, MicOff, BrainCircuit, Search, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RichTextEditor } from '../../components/RichTextEditor';
import { EngagementScore } from '../../components/EngagementScore';
import { ScoreAnalysis } from '../../components/ScoreAnalysis';

const GLOBAL_LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese (Simplified)', 'Japanese', 
    'Portuguese', 'Italian', 'Dutch', 'Russian', 'Arabic', 'Hindi', 'Korean', 'Greek'
];

const AUTOSAVE_KEY = 'qorvyn_draft_recovery';

const GENERATION_PHRASES = [
  "Analyzing market searching online for trends...",
  "Refreshing some different facts...",
  "Getting the best marketing techniques...",
  "Synthesizing high-impact copy..."
];

export const EmailGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [instruction, setInstruction] = useState('');
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [loadingText, setLoadingText] = useState(GENERATION_PHRASES[0]);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Subject Optimization
  const [subjectSuggestions, setSubjectSuggestions] = useState<{text: string, score: number}[]>([]);
  const [isOptimizingSubject, setIsOptimizingSubject] = useState(false);

  // Image Upload State
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Load Client Preferences
    const loadPreferences = async () => {
        if (user?.clientId) {
            const client = await MockBackend.getClientById(user.clientId);
            if (client?.settings?.preferredLanguage) {
                setLanguage(client.settings.preferredLanguage);
            }
        }
    };
    loadPreferences();

    // Check for draft recovery first
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    
    if (location.state?.email) {
      const email = location.state.email;
      setExistingId(email.id);
      setInstruction(email.prompt || '');
      setGeneratedEmail({ 
        subject: email.subject || '', 
        body: email.content || '',
        score: email.score || 0,
        insight: email.insight || '',
        triggerUsed: email.triggerUsed || ''
      });
      if (email.status === 'scheduled' && email.scheduledAt) {
        setScheduleTime(new Date(email.scheduledAt).toISOString().slice(0, 16));
      }
    } else if (location.state?.instruction) {
        setInstruction(location.state.instruction);
    } else if (savedDraft) {
        // Recover draft if no explicit state passed
        try {
            const draft = JSON.parse(savedDraft);
            // Only restore if it looks valid and we aren't loading a specific email
            if (draft.instruction || draft.generatedEmail) {
                if (window.confirm("Found an unsaved draft. Would you like to restore it?")) {
                    setInstruction(draft.instruction || '');
                    setGeneratedEmail(draft.generatedEmail || null);
                    setLanguage(draft.language || 'English');
                } else {
                    localStorage.removeItem(AUTOSAVE_KEY);
                }
            }
        } catch (e) {
            console.error("Failed to parse draft");
        }
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInstruction(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [location, user]);

  // Loading text rotation
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
        let index = 0;
        setLoadingText(GENERATION_PHRASES[0]);
        interval = setInterval(() => {
            index = (index + 1) % GENERATION_PHRASES.length;
            setLoadingText(GENERATION_PHRASES[index]);
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Auto-Save Effect
  useEffect(() => {
      const timer = setTimeout(() => {
          if (instruction || generatedEmail) {
              const draftData = {
                  instruction,
                  generatedEmail,
                  language,
                  timestamp: Date.now()
              };
              localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draftData));
              setIsAutoSaved(true);
              setTimeout(() => setIsAutoSaved(false), 2000);
          }
      }, 1000); // Debounce 1s

      return () => clearTimeout(timer);
  }, [instruction, generatedEmail, language]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
             setImagePreviews(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    setSubjectSuggestions([]);
    try {
      const client = user?.clientId ? await MockBackend.getClientById(user.clientId) : null;
      const businessName = client?.name || "Our Business";
      const websiteUrl = client?.website || "";
      
      const formattedImages = imagePreviews.map(img => {
        const [header, data] = img.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        return { data, mimeType };
      });

      const result = await GeminiService.generateEmail(
        instruction, 
        businessName, 
        formattedImages, 
        [], 
        language,
        websiteUrl // Pass website URL
      );
      
      let processedBody = result.body || ''; // Ensure string
      imagePreviews.forEach((imgData, index) => {
         processedBody = processedBody.split(`{{IMAGE_${index}}}`).join(imgData);
      });

      setGeneratedEmail({
        ...result,
        body: processedBody
      });
      if (result.subjectSuggestions) setSubjectSuggestions(result.subjectSuggestions);
    } catch (error) {
      alert("Failed to generate optimized content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualRescore = async () => {
    if (!generatedEmail) return;
    setIsScoring(true);
    const result = await GeminiService.scoreEmailContent(generatedEmail.subject, generatedEmail.body);
    setGeneratedEmail({ 
        ...generatedEmail, 
        score: result.overallScore, 
        insight: result.overallInsight,
        detailedAnalysis: result
    });
    setIsScoring(false);
  };

  const handleOptimizeSubject = async () => {
    if (!generatedEmail || !generatedEmail.body || !user?.clientId) return;
    setIsOptimizingSubject(true);
    try {
        const history = await MockBackend.getEmails(user.clientId);
        // Map past emails to required format, simulate open rate if missing for demo
        const pastData = history
            .filter(h => h.status === 'sent')
            .map(h => ({ 
                subject: h.subject || '', 
                openRate: h.openRate || (Math.floor(Math.random() * 40) + 10) 
            }));
            
        const results = await GeminiService.suggestSubjectLines(generatedEmail.subject, generatedEmail.body, pastData);
        setSubjectSuggestions(results);
    } catch (error) {
        alert("Failed to generate subject suggestions");
    } finally {
        setIsOptimizingSubject(false);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!generatedEmail || !user?.clientId) return;
    setStatus('saving');
    
    const emailData = {
      clientId: user.clientId,
      subject: generatedEmail.subject,
      content: generatedEmail.body,
      status: isDraft ? 'draft' as const : 'sent' as const,
      prompt: instruction,
      type: 'email' as const,
      score: generatedEmail.score,
      insight: generatedEmail.insight,
      triggerUsed: generatedEmail.triggerUsed
    };

    if (existingId) {
        await MockBackend.updateEmail({ ...emailData, id: existingId, createdAt: new Date().toISOString() });
    } else {
        await MockBackend.saveEmail(emailData);
    }

    // Clear auto-save on successful save
    localStorage.removeItem(AUTOSAVE_KEY);

    setStatus('success');
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="text-indigo-500" size={20} />
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Cognitive Marketing Engine</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">AI Email Writer</h2>
            <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">World-class psychological triggers for high retention.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            {generatedEmail?.score !== undefined && (
                <EngagementScore score={generatedEmail.score} insight={generatedEmail.insight} className="animate-zoom-in" />
            )}
            {isAutoSaved && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-fade-in-up">Auto-saved to device</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors relative group/sidebar">
            <div className="flex items-center justify-between mb-4">
               <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Campaign Goal</label>
               <button 
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                title={isListening ? "Stop Dictation" : "Voice Dictation"}
               >
                 {isListening ? <MicOff size={16} /> : <Mic size={16} />}
               </button>
            </div>
            
            <textarea
              rows={5}
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 outline-none transition-all text-gray-700 dark:text-white font-medium"
              placeholder={isListening ? "Listening to your vision..." : 'E.g. "Draft an email for a VIP restock event using social proof to drive immediate clicks."'}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />

            <div className="mt-4 mb-2">
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Output Language</label>
                <div className="relative">
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700 dark:text-white appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        {GLOBAL_LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                    <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="mt-6">
                <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                <div className="flex flex-wrap gap-2 mb-3">
                    {imagePreviews.map((src, i) => (
                        <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm">
                            <img src={src} className="w-full h-full object-cover" />
                            <button onClick={() => setImagePreviews(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={14}/></button>
                        </div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all">
                        <Plus size={20}/>
                    </button>
                </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !instruction.trim()}
              className="mt-6 w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50 group"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} className="group-hover:scale-110 transition-transform" />}
              {isGenerating ? loadingText : 'Forge High-Impact Email'}
            </button>
          </div>

          {generatedEmail && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm animate-fade-in-up">
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BrainCircuit size={14} className="text-indigo-500" /> Copy Analysis
                  </h3>
                  
                  {generatedEmail.detailedAnalysis ? (
                      <ScoreAnalysis analysis={generatedEmail.detailedAnalysis} />
                  ) : (
                      <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Trigger Used</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white capitalize">{generatedEmail.triggerUsed || 'Engagement Multiplier'}</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed italic">
                            "{generatedEmail.insight}"
                          </p>
                          <button 
                            onClick={handleManualRescore}
                            disabled={isScoring}
                            className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2"
                          >
                            {isScoring ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                            Get Detailed Analysis
                          </button>
                      </div>
                  )}
              </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {generatedEmail ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-auto lg:h-full min-h-[500px] animate-zoom-in transition-colors">
               <div className="p-8 space-y-6 flex-1">
                 <div className="space-y-3">
                   <div className="flex justify-between items-start">
                     <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Subject Header</label>
                     <div className="flex gap-2">
                        <button 
                            onClick={handleOptimizeSubject} 
                            disabled={isOptimizingSubject}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
                            title="Regenerate based on past performance"
                        >
                            {isOptimizingSubject ? <Loader2 className="animate-spin" size={12} /> : <><Sparkles size={12} /> Optimize</>}
                        </button>
                        <button 
                            onClick={handleManualRescore} 
                            disabled={isScoring}
                            title="Recalculate Engagement Score"
                            className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                            {isScoring ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                        </button>
                     </div>
                   </div>
                   <input 
                      type="text" 
                      value={generatedEmail.subject || ''}
                      onChange={(e) => setGeneratedEmail({...generatedEmail, subject: e.target.value})}
                      className="w-full font-black text-xl text-gray-900 dark:text-white border-none focus:ring-0 p-0 bg-transparent"
                   />
                   
                   {/* Subject Suggestions */}
                   {subjectSuggestions.length > 0 && (
                        <div className="grid gap-2 animate-fade-in-up mt-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">AI Alternatives (Based on History):</p>
                            {subjectSuggestions.map((sub, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => {
                                        setGeneratedEmail(prev => prev ? ({...prev, subject: sub.text, score: sub.score}) : null);
                                        setSubjectSuggestions([]);
                                    }}
                                    className="text-left p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-800 transition-all group"
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-xs font-medium text-gray-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 line-clamp-1">{sub.text}</span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${sub.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                            {sub.score}%
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                   )}
                 </div>
                 
                 <div className="h-px bg-gray-100 dark:bg-slate-800" />
                 
                 <div className="flex-1 min-h-[400px]">
                    <RichTextEditor
                        value={generatedEmail.body || ''}
                        onChange={(newHtml) => setGeneratedEmail({...generatedEmail, body: newHtml})}
                        className="h-full border-none shadow-none focus-within:ring-0 bg-transparent"
                    />
                 </div>
               </div>

               <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-4">
                 <div className="flex gap-3">
                    <button onClick={() => handleSave(true)} className="flex-1 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">Save to Vault</button>
                    <button onClick={() => handleSave(false)} className="flex-1 py-4 text-white bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <SendIcon size={16} /> Deploy Campaign
                    </button>
                 </div>
               </div>
            </div>
          ) : (
            <div className="h-full bg-gray-50 dark:bg-slate-900/30 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-12 text-center min-h-[400px]">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-8 animate-bounce-soft">
                  <Sparkles size={40} className="text-indigo-400" />
              </div>
              <p className="font-black text-2xl text-gray-900 dark:text-white tracking-tighter mb-2">Ready for Strategy</p>
              <p className="text-gray-500 dark:text-slate-400 max-w-sm">Enter your campaign objectives to generate a psychologically-backed marketing asset.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
