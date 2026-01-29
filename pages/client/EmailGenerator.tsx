import React, { useState, useEffect, useRef } from 'react';
import { GeminiService, SocialPosts } from '../../services/geminiService';
import { MockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Save, Send as SendIcon, AlertCircle, CheckCircle, Mail, ExternalLink, ArrowLeft, Linkedin, Twitter, Facebook, Copy, CalendarClock, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RichTextEditor } from '../../components/RichTextEditor';

export const EmailGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [existingId, setExistingId] = useState<string | null>(null);

  // New Features State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOptimizingSubject, setIsOptimizingSubject] = useState(false);
  const [socialPosts, setSocialPosts] = useState<SocialPosts | null>(null);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  // Image Upload State
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Load existing data if editing or new instruction
  useEffect(() => {
    if (location.state?.email) {
      const email = location.state.email;
      setExistingId(email.id);
      setInstruction(email.prompt || '');
      setGeneratedEmail({ subject: email.subject, body: email.content });
      if (email.status === 'scheduled' && email.scheduledAt) {
        // Format for datetime-local input (YYYY-MM-DDThh:mm)
        const dt = new Date(email.scheduledAt);
        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        setScheduleTime(dt.toISOString().slice(0, 16));
      }
    } else if (location.state?.instruction) {
        // Pre-fill instruction from other pages (e.g. Segments)
        setInstruction(location.state.instruction);
    }
  }, [location]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
      
      const validFiles = files.filter(file => {
          const isValid = validTypes.includes(file.type);
          if (!isValid) {
              alert(`File "${file.name}" is not supported. Please use PNG, JPEG, WEBP, or HEIC.`);
          }
          return isValid;
      });

      if (validFiles.length === 0) return;

      setSelectedImages(prev => [...prev, ...validFiles]);

      // Generate previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    setSuggestions([]);
    setSocialPosts(null);
    
    try {
      const client = user?.clientId ? await MockBackend.getClientById(user.clientId) : null;
      const businessName = client?.name || "Our Business";
      
      // Extract correct mime types
      const formattedImages = imagePreviews.map(img => {
        const [header, data] = img.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        return { data, mimeType };
      });

      const result = await GeminiService.generateEmail(instruction, businessName, formattedImages);
      
      // Post-process image placeholders
      let processedBody = result.body;
      imagePreviews.forEach((imgData, index) => {
         const placeholder = `{{IMAGE_${index}}}`;
         processedBody = processedBody.split(placeholder).join(imgData);
      });

      setGeneratedEmail({
        subject: result.subject,
        body: processedBody
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeSubject = async () => {
    if (!generatedEmail?.subject || !generatedEmail?.body || !user?.clientId) return;
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

  const handleGenerateSocial = async () => {
    if (!generatedEmail?.body) return;
    setIsGeneratingSocial(true);
    try {
        // Strip HTML for the prompt context
        const plainText = generatedEmail.body.replace(/<[^>]+>/g, '');
        const posts = await GeminiService.generateSocialPosts(plainText);
        setSocialPosts(posts);
    } catch (error) {
        alert("Failed to generate social posts");
    } finally {
        setIsGeneratingSocial(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedEmail || !user?.clientId) return;
    setStatus('saving');
    
    if (existingId) {
        await MockBackend.updateEmail({
            id: existingId,
            clientId: user.clientId,
            subject: generatedEmail.subject,
            content: generatedEmail.body,
            status: 'draft',
            createdAt: location.state?.email?.createdAt || new Date().toISOString(),
            prompt: instruction,
            type: 'email'
        });
    } else {
        await MockBackend.saveEmail({
            clientId: user.clientId,
            subject: generatedEmail.subject,
            content: generatedEmail.body,
            status: 'draft',
            prompt: instruction,
            type: 'email'
        });
    }

    setStatus('success');
    setTimeout(() => {
        setStatus('idle');
    }, 2000);
  };

  const handleSendCampaign = async () => {
    if (!generatedEmail || !user?.clientId) return;
    
    // Basic validation for scheduling
    if (scheduleTime) {
      const scheduledDate = new Date(scheduleTime);
      if (scheduledDate <= new Date()) {
        alert("Scheduled time must be in the future.");
        return;
      }
    }

    setStatus('saving');

    try {
        const contacts = await MockBackend.getContacts(user.clientId);
        if (contacts.length === 0) {
            alert("No contacts found in your account. Please go to Contacts and add some recipients first.");
            setStatus('idle');
            return;
        }

        const isScheduled = !!scheduleTime;
        
        const emailData = {
            clientId: user.clientId,
            subject: generatedEmail.subject,
            content: generatedEmail.body,
            status: isScheduled ? 'scheduled' as const : 'sent' as const,
            deliveryStatus: isScheduled ? 'pending' as const : 'success' as const,
            scheduledAt: isScheduled ? new Date(scheduleTime).toISOString() : undefined,
            prompt: instruction,
            type: 'email' as const
        };

        if (existingId) {
            await MockBackend.updateEmail({
                ...emailData,
                id: existingId,
                createdAt: location.state?.email?.createdAt || new Date().toISOString(),
                sentAt: !isScheduled ? new Date().toISOString() : undefined
            });
        } else {
            await MockBackend.saveEmail({
                ...emailData,
                sentAt: !isScheduled ? new Date().toISOString() : undefined
            });
        }

        if (!isScheduled) {
            // Only trigger mailto if sending immediately
            const bccList = contacts.map(c => c.email).join(',');
            const plainTextBody = generatedEmail.body
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n\n')
                .replace(/<[^>]+>/g, ''); 

            const subject = encodeURIComponent(generatedEmail.subject);
            const body = encodeURIComponent(plainTextBody);
            const bcc = encodeURIComponent(bccList);

            window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
        }

        setStatus('success');
        setTimeout(() => {
            setStatus('idle');
            // If scheduled, maybe navigate away or show specific success
            if (isScheduled) alert(`Campaign scheduled for ${new Date(scheduleTime).toLocaleString()}`);
        }, 2000);

    } catch (error) {
        console.error("Failed to send", error);
        setStatus('idle');
        alert("Failed to process campaign.");
    }
  };

  const handleOpenGmail = () => {
    if (!generatedEmail) return;
    let plainText = generatedEmail.body
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, ''); 
    const subject = encodeURIComponent(generatedEmail.subject);
    const body = encodeURIComponent(plainText);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Email Writer</h2>
            <p className="text-gray-500">Quickly generate text-based emails for your campaigns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is this email about?
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary resize-none mb-4"
              placeholder='e.g., "Write a friendly email about our 20% off weekend sale on all summer items. Mention the code SUMMER20."'
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />

            {/* Image Upload Area */}
            <div className="mb-4">
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
                    onChange={handleImageSelect}
                />
                
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {imagePreviews.map((src, i) => (
                            <div key={i} className="relative group aspect-square rounded overflow-hidden border border-gray-200">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeImage(i)}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                    <ImageIcon size={16} />
                    {imagePreviews.length > 0 ? 'Add more images' : 'Attach images for AI context'}
                </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !instruction.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {generatedEmail ? 'Regenerate Email' : 'Generate Email'}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
             <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
             <p className="text-sm text-blue-800">
               <strong>Tip:</strong> Upload images of your products, and the AI will automatically place them in the email and write descriptions for them.
             </p>
          </div>
        </div>

        {/* Preview/Edit Section */}
        <div className="space-y-4">
          {generatedEmail ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-4 bg-gray-50 border-b border-gray-200">
                 <h3 className="font-semibold text-gray-700">Preview & Edit</h3>
               </div>
               
               <div className="p-6 space-y-4 flex-1 flex flex-col">
                 <div>
                   <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject Line</label>
                        <button 
                            onClick={handleOptimizeSubject}
                            disabled={isOptimizingSubject}
                            className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                        >
                            {isOptimizingSubject ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Sparkles size={12} />}
                            Optimize with History
                        </button>
                   </div>
                   <input 
                      type="text" 
                      value={generatedEmail.subject}
                      onChange={(e) => setGeneratedEmail({...generatedEmail, subject: e.target.value})}
                      className="w-full font-medium text-gray-900 border-b border-gray-200 focus:border-primary focus:outline-none py-1"
                   />
                   
                   {/* Subject Suggestions */}
                   {suggestions.length > 0 && (
                        <div className="mt-3 bg-purple-50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-purple-800 mb-2">AI Suggestions:</p>
                            <ul className="space-y-1">
                                {suggestions.map((sub, i) => (
                                    <li 
                                        key={i} 
                                        onClick={() => {
                                            setGeneratedEmail({...generatedEmail, subject: sub});
                                            setSuggestions([]);
                                        }}
                                        className="text-sm text-purple-700 cursor-pointer hover:bg-purple-100 p-1 rounded transition-colors"
                                    >
                                        • {sub}
                                    </li>
                                ))}
                            </ul>
                        </div>
                   )}
                 </div>
                 
                 <div className="h-px bg-gray-100 my-2" />
                 
                 <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Body</label>
                    <RichTextEditor
                        value={generatedEmail.body}
                        onChange={(newHtml) => setGeneratedEmail({...generatedEmail, body: newHtml})}
                        className="h-full"
                    />
                 </div>
               </div>

               <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-3">
                 {/* Scheduling Input */}
                 <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 border border-gray-200 rounded-lg">
                    <CalendarClock size={16} />
                    <span className="whitespace-nowrap">Schedule (Optional):</span>
                    <input 
                      type="datetime-local" 
                      className="border-none focus:ring-0 text-sm p-0 text-gray-800"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                 </div>

                 <div className="flex items-center justify-between gap-2">
                    <button 
                      onClick={handleSaveDraft}
                      className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      disabled={status === 'saving'}
                    >
                      <Save size={18} />
                      Save Log
                    </button>
                    
                    <button 
                      onClick={handleOpenGmail}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      disabled={status === 'saving'}
                      title="Open draft in Gmail (Single Send)"
                    >
                      <Mail size={18} />
                      Gmail
                    </button>
                 </div>
                 
                 <button 
                  onClick={handleSendCampaign}
                  className={`w-full flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm ${scheduleTime ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={status === 'saving'}
                 >
                   {status === 'saving' ? 'Processing...' : (
                     <>
                      {scheduleTime ? <CalendarClock size={18} /> : <SendIcon size={18} />}
                      {scheduleTime ? 'Schedule Campaign' : 'Send to All Contacts'}
                     </>
                   )}
                 </button>
               </div>
            </div>
          ) : (
            <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8 text-center min-h-[400px]">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p>Your AI-generated email will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Social Media Repurposing Section */}
      {generatedEmail && (
        <div className="mt-8 pt-8 border-t border-gray-200">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Social Media Promotion</h3>
                    <p className="text-gray-500 text-sm">Repurpose this email content into social posts instantly.</p>
                </div>
                <button
                    onClick={handleGenerateSocial}
                    disabled={isGeneratingSocial}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    {isGeneratingSocial ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={16} />}
                    Generate Posts
                </button>
             </div>

             {socialPosts && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                     {/* LinkedIn */}
                     <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                        <div className="bg-[#0077b5] px-4 py-2 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2 font-semibold"><Linkedin size={18} /> LinkedIn</div>
                            <button onClick={() => copyToClipboard(socialPosts.linkedin)} className="p-1 hover:bg-white/20 rounded"><Copy size={16} /></button>
                        </div>
                        <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap">{socialPosts.linkedin}</div>
                     </div>

                     {/* Twitter */}
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-black px-4 py-2 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2 font-semibold"><Twitter size={18} /> X / Twitter</div>
                            <button onClick={() => copyToClipboard(socialPosts.twitter)} className="p-1 hover:bg-white/20 rounded"><Copy size={16} /></button>
                        </div>
                        <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap">{socialPosts.twitter}</div>
                     </div>

                     {/* Facebook */}
                     <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                        <div className="bg-[#1877F2] px-4 py-2 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2 font-semibold"><Facebook size={18} /> Facebook</div>
                            <button onClick={() => copyToClipboard(socialPosts.facebook)} className="p-1 hover:bg-white/20 rounded"><Copy size={16} /></button>
                        </div>
                        <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap">{socialPosts.facebook}</div>
                     </div>
                 </div>
             )}
        </div>
      )}
      
      {status === 'success' && (
        <div className="fixed bottom-8 right-8 bg-green-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce z-50">
          <CheckCircle />
          {existingId ? 'Changes saved!' : 'Success!'}
        </div>
      )}
    </div>
  );
};