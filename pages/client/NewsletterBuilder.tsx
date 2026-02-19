
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Save, Send as SendIcon, CheckCircle, ArrowLeft, Image as ImageIcon, CalendarClock, X, Plus, RefreshCw, Loader2, Globe, ExternalLink, Mic, MicOff } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RichTextEditor } from '../../components/RichTextEditor';
import { EngagementScore } from '../../components/EngagementScore';

const GLOBAL_LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese (Simplified)', 'Japanese', 
    'Portuguese', 'Italian', 'Dutch', 'Russian', 'Arabic', 'Hindi', 'Korean', 'Greek'
];

export const NewsletterBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [instruction, setInstruction] = useState('');
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
    score: number;
    insight: string;
    sources?: { title: string; uri: string }[];
  }>({ 
    subject: '', 
    body: '', 
    score: 0, 
    insight: '' 
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Subject Optimization
  const [suggestions, setSuggestions] = useState<{text: string, score: number}[]>([]);
  const [isOptimizingSubject, setIsOptimizingSubject] = useState(false);

  // Image State
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

    if (location.state?.email) {
      const email = location.state.email;
      setExistingId(email.id);
      setInstruction(email.prompt || '');
      setGeneratedEmail({ 
        subject: email.subject || '', 
        body: email.content || '',
        score: email.score || 50,
        insight: email.insight || ''
      });
      if (email.status === 'scheduled' && email.scheduledAt) {
        setScheduleTime(new Date(email.scheduledAt).toISOString().slice(0, 16));
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
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInstruction(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [location, user]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported.");
        return;
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      (Array.from(e.target.files) as File[]).forEach(file => {
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
    setSuggestions([]);
    try {
      const client = user?.clientId ? await MockBackend.getClientById(user.clientId) : null;
      const businessName = client?.name || "Our Business";
      
      const formattedImages = imagePreviews.map(img => {
        const [header, data] = img.split(',');
        return { data, mimeType: header.match(/:(.*?);/)?.[1] || 'image/png' };
      });

      const result = await GeminiService.generateEmail(instruction, businessName, formattedImages, [], language);
      
      let processedBody = result.body || ''; // Ensure string
      imagePreviews.forEach((imgData, index) => {
         processedBody = processedBody.split(`{{IMAGE_${index}}}`).join(imgData);
      });

      setGeneratedEmail({ 
        subject: result.subject || '', 
        body: processedBody, 
        score: result.score || 0,
        insight: result.insight || '',
        sources: result.sources
      });
      if (result.subjectSuggestions) setSuggestions(result.subjectSuggestions);

    } catch (error) {
      alert("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualRescore = async () => {
    setIsScoring(true);
    const { score, insight } = await GeminiService.scoreEmailContent(generatedEmail.subject, generatedEmail.body);
    setGeneratedEmail({ ...generatedEmail, score, insight });
    setIsScoring(false);
  };

  const handleOptimizeSubject = async () => {
    if (!generatedEmail.subject || !generatedEmail.body || !user?.clientId) return;
    setIsOptimizingSubject(true);
    try {
        const results = await GeminiService.suggestSubjectLines(generatedEmail.subject, generatedEmail.body);
        setSuggestions(results);
    } catch (error) {
        alert("Failed to suggest subjects");
    } finally {
        setIsOptimizingSubject(false);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!user?.clientId) return;
    setStatus('saving');

    const isScheduled = !isDraft && !!scheduleTime;
    const emailData = {
        clientId: user.clientId,
        subject: generatedEmail.subject,
        content: generatedEmail.body,
        status: isDraft ? 'draft' as const : (isScheduled ? 'scheduled' as const : 'sent' as const),
        type: 'newsletter' as const,
        prompt: instruction,
        score: generatedEmail.score,
        insight: generatedEmail.insight,
        scheduledAt: isScheduled ? new Date(scheduleTime).toISOString() : undefined
    };

    try {
        if (existingId) {
            await MockBackend.updateEmail({ ...emailData, id: existingId, createdAt: new Date().toISOString() });
        } else {
            await MockBackend.saveEmail(emailData);
        }
        setStatus('success');
        setTimeout(() => navigate('/client/newsletters'), 1500);
    } catch (error) {
        setStatus('idle');
        alert("Failed to save newsletter.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
            <Link to="/client/newsletters" className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Newsletter Forge</h2>
                <p className="text-gray-500 dark:text-slate-400 font-medium text-sm md:text-base">Design professional broadcasts with AI precision.</p>
            </div>
        </div>
        {generatedEmail.score > 0 && (
            <EngagementScore score={generatedEmail.score} insight={generatedEmail.insight} className="animate-zoom-in self-start md:self-auto" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300 relative">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                   <Sparkles size={16} className="text-indigo-500" /> AI Content Engine
                </h3>
                <button 
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-indigo-600'}`}
                  title={isListening ? "Stop Listening" : "Voice Dictation"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
             </div>
             
             <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium resize-none"
                placeholder={isListening ? "Listening..." : "E.g. Monthly update for cafe regulars..."}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
             />

             <div>
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

             <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                        <img src={src} className="w-full h-full object-cover" />
                        <button onClick={() => setImagePreviews(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={16} /></button>
                    </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-gray-400 hover:border-indigo-500 transition-all">
                    <Plus size={24} />
                    <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp, image/heic, image/heif" onChange={handleImageSelect} />
                </button>
             </div>
             <button onClick={handleGenerate} disabled={isGenerating || !instruction.trim()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                {isGenerating ? 'Synthesizing...' : 'Generate Visual Draft'}
              </button>
          </div>

          {generatedEmail.sources && generatedEmail.sources.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-700/50 shadow-lg animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                  <Globe size={16} className="text-indigo-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Research Intelligence</h3>
              </div>
              <div className="space-y-2">
                  {generatedEmail.sources.map((source, i) => (
                      <a 
                          key={i} 
                          href={source.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                          <ExternalLink size={12} className="mt-1 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-xs text-slate-400 group-hover:text-white transition-colors line-clamp-2">{source.title}</span>
                      </a>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex justify-between items-center">
               <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Deployment Identity</h3>
               <button onClick={handleOptimizeSubject} disabled={isOptimizingSubject} className="text-[10px] font-black flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest">
                   {isOptimizingSubject ? '...' : <><Sparkles size={10} /> Optimize</>}
               </button>
            </div>
            <input type="text" value={generatedEmail.subject || ''} onChange={(e) => setGeneratedEmail({...generatedEmail, subject: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium" placeholder="Subject..." />
            
            {suggestions.length > 0 && (
                <div className="space-y-2 mt-4">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Scored Variants:</p>
                    {suggestions.map((sub, i) => (
                        <div key={i} onClick={() => { setGeneratedEmail({...generatedEmail, subject: sub.text, score: sub.score}); setSuggestions([]); }} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-all bg-gray-50/50 dark:bg-slate-800/30">
                            <span className="text-xs font-medium text-gray-700 dark:text-slate-300 line-clamp-1">{sub.text}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${sub.score >= 80 ? 'bg-emerald-500 text-white' : sub.score >= 50 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>{sub.score}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col h-auto lg:h-[800px] min-h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
           <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/30 dark:bg-slate-800/20">
              <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Live Visual Workbench</span>
              <button onClick={handleManualRescore} disabled={isScoring} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                {isScoring ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              </button>
           </div>
           
           <RichTextEditor
                value={generatedEmail.body || ''}
                onChange={(newHtml) => setGeneratedEmail({...generatedEmail, body: newHtml})}
                className="flex-1 border-none rounded-none shadow-none focus-within:ring-0 bg-transparent min-h-[400px]"
                placeholder="The AI draft will manifest here..."
            />

            <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-4">
                 <button onClick={() => handleSave(true)} disabled={status === 'saving'} className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                   <Save size={16} /> Save Archive
                 </button>
                 <button onClick={() => handleSave(false)} disabled={status === 'saving'} className="px-8 py-3.5 rounded-2xl text-white bg-indigo-600 font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
                   <SendIcon size={16} /> Deploy Campaign
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};
