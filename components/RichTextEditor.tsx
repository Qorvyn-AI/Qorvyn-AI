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
  User
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  className = '',
  placeholder = 'Start writing...'
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && value !== contentRef.current.innerHTML) {
      if (!isFocused || contentRef.current.innerHTML === '<br>' || contentRef.current.innerHTML === '') {
        contentRef.current.innerHTML = value;
      }
    }
  }, [value, isFocused]);

  // Handle click outside to close dropdown
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
      contentRef.current.focus();
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
    // Ensure editor has focus before inserting
    if (contentRef.current) {
      contentRef.current.focus();
    }
    execCommand('insertText', tag);
    setShowPersonalize(false);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    arg, 
    onClick, 
    title,
    active = false
  }: { 
    icon: any; 
    command?: string; 
    arg?: string; 
    onClick?: () => void; 
    title: string;
    active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); 
        if (onClick) onClick();
        else if (command) execCommand(command, arg);
      }}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className={`flex flex-col border border-gray-300 rounded-lg overflow-hidden bg-white ${className} ${isFocused ? 'ring-2 ring-primary border-primary' : ''}`}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap relative">
        <ToolbarButton icon={Bold} command="bold" title="Bold (Ctrl+B)" />
        <ToolbarButton icon={Italic} command="italic" title="Italic (Ctrl+I)" />
        <ToolbarButton icon={Underline} command="underline" title="Underline (Ctrl+U)" />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton icon={LinkIcon} onClick={handleLink} title="Insert Link" />
        <ToolbarButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} title="Insert Image" />
        
        <div className="relative" ref={dropdownRef}>
             <ToolbarButton 
                icon={User} 
                onClick={() => setShowPersonalize(!showPersonalize)} 
                title="Personalize" 
                active={showPersonalize}
             />
             {showPersonalize && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Insert Variable</div>
                    <button onClick={() => insertPersonalization('{{Contact.Name}}')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Contact Name
                    </button>
                    <button onClick={() => insertPersonalization('{{Contact.Email}}')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Contact Email
                    </button>
                    <button onClick={() => insertPersonalization('{{Business.Name}}')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Business Name
                    </button>
                </div>
             )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton icon={RemoveFormatting} command="removeFormat" title="Clear Formatting" />
      </div>

      {/* Editor Area */}
      <div
        ref={contentRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 p-4 overflow-y-auto outline-none min-h-[300px] text-gray-700 font-sans prose prose-sm max-w-none"
        style={{ whiteSpace: 'pre-wrap' }} 
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
      />
      
      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
         <span>Rich Text + Images</span>
         <span>{value.length} chars</span>
      </div>
    </div>
  );
};