import React, { useState, useEffect, useRef } from 'react';
import { GeminiService, PastCampaignData } from '../../services/geminiService';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Save, Send as SendIcon, AlertCircle, CheckCircle, Mail, ArrowLeft, Image as ImageIcon, User, CalendarClock, Upload, X } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RichTextEditor } from '../../components/RichTextEditor';

export const NewsletterBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string }>({ subject: '', body: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Subject Optimization
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOptimizingSubject, setIsOptimizingSubject] = useState(false);

  // Image State
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Base64 strings with data URI prefix

  useEffect(() => {
    if (location.state?.email) {
      const email = location.state.email;
      setExistingId(email.id);
      setInstruction(email.prompt || '');
      setGeneratedEmail({ subject: email.subject, body: email.content });
      if (email.status === 'scheduled' && email.scheduledAt) {
        // Format for datetime-local input
        const dt = new Date(email.scheduledAt);
        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        setScheduleTime(dt.toISOString().slice(0, 16));
      }
    }
  }, [location]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
      
      const validFiles: File[] = [];
      let invalidCount = 0;

      files.forEach(file => {
          if (validTypes.includes(file.type)) {
              validFiles.push(file);
          } else {
              invalidCount++;
          }
      });

      if (invalidCount > 0) {
          alert(`${invalidCount} file(s) skipped. Supported formats: PNG, JPEG, WEBP, HEIC.`);
      }

      if (validFiles.length === 0) return;

      setSelectedImages(prev => [...prev, ...validFiles]);

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImagePreviews(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset value to allow re-uploading same file if deleted
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const client = user?.clientId ? await MockBackend.getClientById(user.clientId) : null;
      const businessName = client?.name || "Our Business";
      
      // 1. Prepare Images for API (Extract MimeType and Strip Prefix)
      const formattedImages = imagePreviews.map(img => {
        const [header, data] = img.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        return { data, mimeType };
      });

      // 2. Prepare Past Campaigns Data
      let pastCampaigns: PastCampaignData[] = [];
      if (user?.clientId) {
          const emails = await MockBackend.getEmails(user.clientId);
          pastCampaigns = emails
              .filter(e => e.status === 'sent' && e.openRate !== undefined)
              .sort((a, b) => (b.openRate || 0) - (a.openRate || 0))
              .slice(0, 3) // Top 3
              .map(e => ({ subject: e.subject, content: e.content, openRate: e.openRate || 0 }));
      }

      // 3. Call AI
      const result = await GeminiService.generateEmail(instruction, businessName, formattedImages, pastCampaigns);
      
      // 4. Post-process: Replace placeholders with actual image data
      let processedBody = result.body;
      imagePreviews.forEach((imgData, index) => {
         // Replace {{IMAGE_0}}, {{IMAGE_1}} etc with actual base64 data src
         const placeholder = `{{IMAGE_${index}}}`;
         // We use global replace just in case AI repeated it, though unlikely
         processedBody = processedBody.split(placeholder).join(imgData);
      });

      setGeneratedEmail({
        subject: result.subject,
        body: processedBody
      });

      if (result.subjectSuggestions) {
          setSuggestions(result.subjectSuggestions);
      }

    } catch (error) {
      console.error(error);
      alert("Failed to generate email content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeSubject = async () => {
    if (!generatedEmail.subject || !generatedEmail.body || !user?.clientId) return;
    setIsOptimizingSubject(true);
    try {
        // Fetch past successful campaigns with stats
        const allEmails = await MockBackend.getEmails(user.clientId);
        const successfulCampaigns = allEmails
            .filter(e => e.status === 'sent')
            .map(e => ({ subject: e.subject, openRate: e.openRate || 0 }));

        const results = await GeminiService.suggestSubjectLines(
            generatedEmail.subject, 
            generatedEmail.body,
            successfulCampaigns
        );
        setSuggestions(results);
    } catch (error) {
        alert("Failed to suggest subjects");
    } finally {
        setIsOptimizingSubject(false);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!user?.clientId) return;
    
    // Schedule Validation
    if (!isDraft && scheduleTime) {
      const scheduledDate = new Date(scheduleTime);
      if (scheduledDate <= new Date()) {
        alert("Scheduled time must be in the future.");
        return;
      }
    }

    setStatus('saving');

    const isScheduled = !isDraft && !!scheduleTime;

    const emailData = {
        clientId: user.clientId,
        subject: generatedEmail.subject,
        content: generatedEmail.body,
        status: isDraft ? 'draft' as const : (isScheduled ? 'scheduled' as const : 'sent' as const),
        deliveryStatus: isScheduled ? 'pending' as const : undefined,
        scheduledAt: isScheduled ? new Date(scheduleTime).toISOString() : undefined,
        type: 'newsletter' as const,
        prompt: instruction
    };

    try {
        if (existingId) {
            await MockBackend.updateEmail({
                ...emailData,
                id: existingId,
                createdAt: location.state?.email?.createdAt || new Date().toISOString(),
                sentAt: !isDraft && !isScheduled ? new Date().toISOString() : undefined
            });
        } else {
            await MockBackend.saveEmail({
                ...emailData,
                sentAt: !isDraft && !isScheduled ? new Date().toISOString() : undefined
            });
        }
        
        setStatus('success');
        setTimeout(() => {
            navigate('/client/newsletters');
        }, 1500);

    } catch (error) {
        setStatus('idle');
        alert("Failed to save newsletter.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/client/newsletters" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h2 className="text-2xl font-bold text-gray-900">{existingId ? 'Edit Newsletter' : 'Newsletter Builder'}</h2>
            <p className="text-gray-500">Design beautiful emails with images and personalization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Controls */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
             <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                AI Assistant
             </h3>
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">What should this newsletter say?</label>
                <textarea
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary resize-none text-sm"
                    placeholder="Describe your announcement, offer, or news..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                />
             </div>
             
             {/* Image Upload Area */}
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Reference Images (Optional)</label>
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
                    onChange={handleImageSelect}
                />
                
                {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {imagePreviews.map((src, i) => (
                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary hover:text-primary transition-colors"
                        >
                            <PlusIcon size={20} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary hover:bg-gray-50 transition-all gap-1"
                    >
                        <ImageIcon size={20} />
                        <span className="text-xs">Add photos</span>
                    </button>
                )}
                <p className="text-[10px] text-gray-500 mt-1">
                    AI will analyze these images and place them in the email content automatically.
                </p>
             </div>

             <button
                onClick={handleGenerate}
                disabled={isGenerating || !instruction.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 text-sm"
              >
                {isGenerating ? 'Analyzing & Writing...' : 'Generate Draft'}
              </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Settings</h3>
            <div>
               <div className="flex justify-between items-center mb-1">
                   <label className="block text-xs font-medium text-gray-700">Subject Line</label>
                   <button 
                      onClick={handleOptimizeSubject}
                      disabled={isOptimizingSubject}
                      className="text-[10px] flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                   >
                       {isOptimizingSubject ? <div className="w-2 h-2 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Sparkles size={10} />}
                       Optimize
                   </button>
               </div>
               <input 
                  type="text" 
                  value={generatedEmail.subject}
                  onChange={(e) => setGeneratedEmail({...generatedEmail, subject: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Enter subject..."
               />
               {/* Suggestions List */}
               {suggestions.length > 0 && (
                    <div className="mt-2 bg-purple-50 rounded-lg p-2 animate-in fade-in slide-in-from-top-1">
                        <p className="text-[10px] font-bold text-purple-800 mb-1">AI Suggestions (History-Based):</p>
                        <ul className="space-y-1">
                            {suggestions.map((sub, i) => (
                                <li 
                                    key={i} 
                                    onClick={() => {
                                        setGeneratedEmail({...generatedEmail, subject: sub});
                                        setSuggestions([]);
                                    }}
                                    className="text-xs text-purple-700 cursor-pointer hover:bg-purple-100 p-1 rounded transition-colors"
                                >
                                    • {sub}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CalendarClock size={18} className="text-gray-500" />
                Schedule
            </h3>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Send Date (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to send immediately when clicking "Send Campaign".</p>
            </div>
          </div>
          
           <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <div className="flex gap-2 mb-2">
                 <ImageIcon size={16} className="text-blue-600" />
                 <h4 className="font-medium text-blue-900 text-sm">Rich Media</h4>
             </div>
             <p className="text-xs text-blue-800">
               Use the toolbar in the editor to upload more images manually if needed.
             </p>
          </div>

           <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
             <div className="flex gap-2 mb-2">
                 <User size={16} className="text-purple-600" />
                 <h4 className="font-medium text-purple-900 text-sm">Personalization</h4>
             </div>
             <p className="text-xs text-purple-800">
               Click the 'User' icon in the toolbar to insert dynamic tags like Contact Name.
             </p>
          </div>
        </div>

        {/* Right Area: Editor */}
        <div className="lg:col-span-2 flex flex-col h-[700px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Visual Editor</span>
           </div>
           
           <RichTextEditor
                value={generatedEmail.body}
                onChange={(newHtml) => setGeneratedEmail({...generatedEmail, body: newHtml})}
                className="flex-1 border-none rounded-none"
                placeholder="Start designing your newsletter..."
            />

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                 <button 
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm flex items-center gap-2"
                  disabled={status === 'saving'}
                 >
                   <Save size={16} /> Save Draft
                 </button>
                 <button 
                  onClick={() => handleSave(false)}
                  className={`px-4 py-2 rounded-lg text-white font-medium text-sm flex items-center gap-2 ${scheduleTime ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={status === 'saving'}
                 >
                   {scheduleTime ? <CalendarClock size={16} /> : <SendIcon size={16} />}
                   {scheduleTime ? 'Schedule Campaign' : 'Send Campaign'}
                 </button>
            </div>
        </div>
      </div>

       {status === 'success' && (
        <div className="fixed bottom-8 right-8 bg-green-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce z-50">
          <CheckCircle />
          <span>Newsletter saved successfully!</span>
        </div>
      )}
    </div>
  );
};

// Helper component for the plus icon
const PlusIcon = ({ size }: { size: number }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);