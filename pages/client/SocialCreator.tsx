
import React, { useState, useRef } from 'react';
import { GeminiService, GeneratedSocialPost } from '../../services/geminiService';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  Youtube, 
  Sparkles, 
  Loader2, 
  Search, 
  Hash, 
  Globe, 
  Copy, 
  Check, 
  Image as ImageIcon,
  Plus,
  X,
  Share2,
  Heart,
  MessageCircle,
  Repeat,
  ThumbsUp,
  BarChart2
} from 'lucide-react';
import { EngagementScore } from '../../components/EngagementScore';

const PLATFORMS = [
  { id: 'Twitter/X', icon: Twitter, color: 'bg-black text-white', label: 'X (Twitter)' },
  { id: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white', label: 'Instagram' },
  { id: 'Facebook', icon: Facebook, color: 'bg-blue-600 text-white', label: 'Facebook' },
  { id: 'YouTube Community', icon: Youtube, color: 'bg-red-600 text-white', label: 'YouTube' }
];

const GLOBAL_LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese (Simplified)', 'Japanese', 
    'Portuguese', 'Italian', 'Dutch', 'Russian', 'Arabic', 'Hindi', 'Korean', 'Greek'
];

export const SocialCreator = () => {
  const { user } = useAuth();
  
  // Input State
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [language, setLanguage] = useState('English');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Output State
  const [generatedPost, setGeneratedPost] = useState<GeneratedSocialPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      (Array.from(e.target.files) as File[]).forEach(file => {
        // Strict MIME type check for Gemini support
        if (!['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)) {
            alert(`Unsupported file type: ${file.type}. Please use PNG, JPEG, WEBP, HEIC, or HEIF.`);
            return;
        }

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
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const client = user?.clientId ? await MockBackend.getClientById(user.clientId) : null;
      const businessName = client?.name || "Our Brand";
      
      const formattedImages = imagePreviews.map(img => {
        const [header, data] = img.split(',');
        return { data, mimeType: header.match(/:(.*?);/)?.[1] || 'image/png' };
      });

      const result = await GeminiService.generateSocialPost(
        platform.id,
        topic,
        businessName,
        formattedImages,
        language
      );

      setGeneratedPost(result);
    } catch (error) {
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedPost) {
      const text = `${generatedPost.content}\n\n${generatedPost.hashtags.join(' ')}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                <Share2 className="text-primary" /> Social Command
            </h2>
            <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">
                Create high-engagement posts powered by real-time trend analysis.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Controls */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                {/* Platform Selector */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {PLATFORMS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPlatform(p)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all border ${
                                platform.id === p.id 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                    : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <div className={`p-2 rounded-full ${platform.id === p.id ? p.color : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                                <p.icon size={18} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${platform.id === p.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'}`}>
                                {p.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Topic or Goal</label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium resize-none"
                            placeholder={`What do you want to post about on ${platform.label}?`}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Language</label>
                        <div className="relative">
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700 dark:text-white appearance-none cursor-pointer"
                            >
                                {GLOBAL_LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                            <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Media Context (Optional)</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-500 transition-all">
                                <Plus size={20} />
                                <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp, image/heic, image/heif" onChange={handleImageSelect} />
                            </button>
                            {imagePreviews.map((src, i) => (
                                <div key={i} className="flex-shrink-0 relative group w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button onClick={() => setImagePreviews(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all ${
                            isGenerating || !topic.trim() 
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        }`}
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        {isGenerating ? 'Analyzing Trends...' : 'Generate Optimized Post'}
                    </button>
                </div>
            </div>

            {generatedPost?.sources && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm animate-fade-in-up">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Search size={14} className="text-indigo-500" /> Research Grounding
                    </h3>
                    <div className="space-y-2">
                        {generatedPost.sources.map((source, i) => (
                            <a 
                                key={i} 
                                href={source.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                            >
                                <Globe size={12} className="flex-shrink-0" />
                                <span className="truncate">{source.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT PANEL: Preview */}
        <div className="lg:col-span-7">
            {generatedPost ? (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Strategy Card */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <BarChart2 size={100} />
                        </div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="max-w-md">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    <Sparkles size={18} className="text-yellow-400" /> AI Strategy Insight
                                </h3>
                                <p className="text-sm text-indigo-100 leading-relaxed mb-4">{generatedPost.strategy}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs font-bold">
                                    <span>🕒 Recommended Time:</span>
                                    <span className="text-yellow-300">{generatedPost.bestTime || 'Anytime'}</span>
                                </div>
                            </div>
                            <EngagementScore score={generatedPost.viralityScore} className="bg-white/10 border-white/20 text-white" />
                        </div>
                    </div>

                    {/* Live Preview Container */}
                    <div className="bg-gray-100 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 flex justify-center items-center min-h-[400px]">
                        
                        {/* Twitter/X Style */}
                        {platform.id === 'Twitter/X' && (
                            <div className="bg-black text-white w-full max-w-md p-4 rounded-xl shadow-2xl border border-gray-800 font-sans">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="font-bold text-sm">Your Brand</span>
                                            <span className="text-gray-500 text-sm">@handle · 1m</span>
                                        </div>
                                        <p className="text-[15px] leading-normal whitespace-pre-wrap mb-3">{generatedPost.content}</p>
                                        <p className="text-blue-400 text-sm mb-3">{generatedPost.hashtags.join(' ')}</p>
                                        {imagePreviews.length > 0 ? (
                                            <img src={imagePreviews[0]} className="rounded-xl border border-gray-800 w-full mb-3" />
                                        ) : generatedPost.imagePrompt && (
                                            <div className="w-full h-48 bg-gray-900 rounded-xl border border-gray-800 border-dashed flex items-center justify-center text-center p-4 text-xs text-gray-500 mb-3">
                                                <ImageIcon size={20} className="mb-2 mx-auto opacity-50" />
                                                Suggestion: {generatedPost.imagePrompt}
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-500 text-sm max-w-xs">
                                            <MessageCircle size={16} />
                                            <Repeat size={16} />
                                            <Heart size={16} />
                                            <Share2 size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instagram Style */}
                        {platform.id === 'Instagram' && (
                            <div className="bg-white text-black w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden font-sans">
                                <div className="p-3 flex items-center gap-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                                        <div className="w-full h-full bg-white rounded-full border-2 border-white" />
                                    </div>
                                    <span className="text-sm font-bold">your_brand</span>
                                </div>
                                {imagePreviews.length > 0 ? (
                                    <img src={imagePreviews[0]} className="w-full aspect-square object-cover" />
                                ) : (
                                    <div className="w-full aspect-square bg-gray-100 flex flex-col items-center justify-center p-6 text-center text-xs text-gray-400">
                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                        <p>Image Placeholder</p>
                                        <p className="mt-2 text-[10px] opacity-70">Prompt: {generatedPost.imagePrompt}</p>
                                    </div>
                                )}
                                <div className="p-3">
                                    <div className="flex gap-4 mb-3">
                                        <Heart size={22} className="text-black" />
                                        <MessageCircle size={22} className="text-black" />
                                        <Share2 size={22} className="text-black" />
                                    </div>
                                    <p className="text-sm">
                                        <span className="font-bold mr-2">your_brand</span>
                                        <span className="whitespace-pre-wrap">{generatedPost.content}</span>
                                    </p>
                                    <p className="text-blue-900 text-sm mt-1">{generatedPost.hashtags.join(' ')}</p>
                                </div>
                            </div>
                        )}

                        {/* Facebook Style */}
                        {platform.id === 'Facebook' && (
                            <div className="bg-white text-black w-full max-w-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden font-sans">
                                <div className="p-4 flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600" />
                                    <div>
                                        <p className="font-bold text-sm">Your Brand</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">Just now · <Globe size={10}/></p>
                                    </div>
                                </div>
                                <div className="px-4 pb-3 text-sm whitespace-pre-wrap">
                                    {generatedPost.content}
                                    <br/><br/>
                                    <span className="text-blue-600">{generatedPost.hashtags.join(' ')}</span>
                                </div>
                                {imagePreviews.length > 0 ? (
                                    <img src={imagePreviews[0]} className="w-full h-64 object-cover" />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 flex flex-col items-center justify-center text-center p-6 text-xs text-gray-400">
                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                        Suggested Image: {generatedPost.imagePrompt}
                                    </div>
                                )}
                                <div className="px-4 py-2 border-t border-gray-100 flex justify-between text-gray-500 text-sm font-medium">
                                    <div className="flex items-center gap-2"><ThumbsUp size={18}/> Like</div>
                                    <div className="flex items-center gap-2"><MessageCircle size={18}/> Comment</div>
                                    <div className="flex items-center gap-2"><Share2 size={18}/> Share</div>
                                </div>
                            </div>
                        )}

                        {/* YouTube Style */}
                        {platform.id === 'YouTube Community' && (
                            <div className="bg-[#0f0f0f] text-white w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-4 font-sans">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-red-600 flex-shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">Your Channel</span>
                                            <span className="text-gray-400 text-xs">1 minute ago</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm mb-4 whitespace-pre-wrap">{generatedPost.content}</p>
                                <p className="text-blue-400 text-sm mb-4">{generatedPost.hashtags.join(' ')}</p>
                                {imagePreviews.length > 0 ? (
                                    <img src={imagePreviews[0]} className="w-full rounded-xl border border-gray-800 mb-2" />
                                ) : (
                                    <div className="w-full h-48 bg-gray-800 rounded-xl flex flex-col items-center justify-center text-center p-4 text-xs text-gray-400 mb-2">
                                        <ImageIcon size={24} className="mb-2" />
                                        {generatedPost.imagePrompt}
                                    </div>
                                )}
                                <div className="flex gap-4 text-gray-300">
                                    <div className="flex items-center gap-2"><ThumbsUp size={16}/> <span className="text-xs">12K</span></div>
                                    <div className="flex items-center gap-2"><MessageCircle size={16}/> <span className="text-xs">450</span></div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={handleCopy}
                            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied' : 'Copy Text'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center mb-6">
                        <Share2 size={32} className="text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Social Preview</h3>
                    <p className="max-w-xs">Select a platform and topic to generate a preview tailored to that network's algorithm.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
