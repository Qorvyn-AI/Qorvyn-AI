
import React, { useEffect, useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Type,
  RemoveFormatting,
  Image as ImageIcon,
  User,
  Calendar,
  ExternalLink,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value = '', 
  onChange, 
  className = '',
  placeholder = 'Start writing...'
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure safe value string to prevent .length crashes
  const safeValue = value || '';

  useEffect(() => {
    if (contentRef.current && safeValue !== contentRef.current.innerHTML) {
      if (!isFocused || contentRef.current.innerHTML === '<br>' || contentRef.current.innerHTML === '') {
        // Security: Sanitize HTML before setting it to prevent XSS
        contentRef.current.innerHTML = DOMPurify.sanitize(safeValue);
      }
    }
  }, [safeValue, isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPersonalize(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          execCommand('insertImage', e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const insertPersonalization = (tag: string) => {
    // Focus first to ensure insertion happens at cursor
    contentRef.current?.focus();
    execCommand('insertText', tag);
    setShowPersonalize(false);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    arg, 
    onClick, 
    title,
    active = false,
    label
  }: { 
    icon: any; 
    command?: string; 
    arg?: string; 
    onClick?: () => void; 
    title: string;
    active?: boolean;
    label?: string;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent focus loss
        if (onClick) onClick();
        else if (command) execCommand(command, arg);
      }}
      className={`p-1.5 rounded transition-colors flex items-center gap-1 ${active ? 'bg-primary/10 text-primary dark:bg-indigo-900/40 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'}`}
    >
      <Icon size={18} />
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );

  const PersonalizeItem = ({ label, tag, icon: Icon }: { label: string; tag: string; icon?: any }) => (
    <button 
      onMouseDown={(e) => {
        e.preventDefault();
        insertPersonalization(tag);
      }}
      className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
    >
      {Icon ? <Icon size={14} className="text-gray-400 dark:text-slate-500" /> : <span className="w-3.5" />}
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 ${className} ${isFocused ? 'ring-2 ring-primary border-primary dark:ring-indigo-500/50' : ''}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex-wrap relative">
        <ToolbarButton icon={Bold} command="bold" title="Bold (Ctrl+B)" />
        <ToolbarButton icon={Italic} command="italic" title="Italic (Ctrl+I)" />
        <ToolbarButton icon={Underline} command="underline" title="Underline (Ctrl+U)" />
        
        <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-1" />
        
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        
        <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-1" />
        
        <ToolbarButton icon={LinkIcon} onClick={handleLink} title="Insert Link" />
        <ToolbarButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} title="Insert Image" />
        
        <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-1" />

        <div className="relative" ref={dropdownRef}>
             <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setShowPersonalize(!showPersonalize); }}
                className={`p-1.5 rounded transition-colors flex items-center gap-1 ${showPersonalize ? 'bg-primary/10 text-primary dark:bg-indigo-900/40 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                title="Personalization Tags"
             >
                <User size={18} />
                <span className="text-xs font-medium hidden sm:inline">Personalize</span>
                <ChevronDown size={12} className={`transition-transform ${showPersonalize ? 'rotate-180' : ''}`} />
             </button>

             {showPersonalize && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-800 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 mb-1">Contact Variables</div>
                    <PersonalizeItem label="First Name" tag="{{Contact.Name}}" icon={User} />
                    <PersonalizeItem label="Full Email" tag="{{Contact.Email}}" icon={Type} />
                    <PersonalizeItem label="Phone Number" tag="{{Contact.Phone}}" icon={Type} />
                    
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 mt-2 mb-1">System & Links</div>
                    <PersonalizeItem label="Business Name" tag="{{Business.Name}}" icon={Sparkles} />
                    <PersonalizeItem label="Current Date" tag="{{System.Date}}" icon={Calendar} />
                    <PersonalizeItem label="Unsubscribe URL" tag="{{System.Unsubscribe}}" icon={ExternalLink} />
                </div>
             )}
        </div>

        <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-1" />
        
        <ToolbarButton icon={RemoveFormatting} command="removeFormat" title="Clear Formatting" />
      </div>

      {/* Editor Area */}
      <div
        ref={contentRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 p-4 overflow-y-auto outline-none min-h-[200px] text-gray-700 dark:text-slate-200 font-sans prose prose-sm max-w-none dark:prose-invert"
        style={{ whiteSpace: 'pre-wrap' }} 
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
      />
      
      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500 flex justify-between items-center">
         <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-primary dark:text-indigo-400" />
            <span>Rich Text & HTML Supported</span>
         </span>
         <span className="font-mono">{safeValue.length} chars</span>
      </div>
    </div>
  );
};
