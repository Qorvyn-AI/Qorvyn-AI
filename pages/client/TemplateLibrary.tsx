
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMAIL_TEMPLATES, EmailTemplate } from '../../data/emailTemplates';
import { Search, Filter, LayoutTemplate, ArrowRight, Eye } from 'lucide-react';

const CATEGORIES = ['all', 'newsletter', 'promotion', 'announcement', 'welcome', 'event'];

export const TemplateLibrary = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const filteredTemplates = EMAIL_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: EmailTemplate) => {
    navigate('/client/generator', { 
      state: { 
        email: { 
          id: null, 
          subject: template.subject, 
          content: template.body,
          prompt: `Using template: ${template.name}`,
          status: 'draft'
        } 
      } 
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutTemplate className="text-indigo-500" size={20} />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Design System</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Template Library</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">Professionally crafted layouts for every campaign type.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="group bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Thumbnail */}
            <div className={`h-48 w-full ${template.thumbnail} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button 
                  onClick={() => setPreviewTemplate(template)}
                  className="p-3 bg-white/90 text-gray-900 rounded-xl hover:scale-110 transition-transform shadow-lg"
                  title="Preview"
                >
                  <Eye size={20} />
                </button>
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                  title="Use Template"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
              {/* Category Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white shadow-sm">
                {template.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{template.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">{template.description}</p>
              
              <button 
                onClick={() => handleUseTemplate(template)}
                className="w-full py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                Use Template <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Subject: {previewTemplate.subject}</p>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-slate-950/50">
              <div className="bg-white max-w-2xl mx-auto shadow-sm min-h-[400px] rounded-lg overflow-hidden">
                 <div dangerouslySetInnerHTML={{ __html: previewTemplate.body }} />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUseTemplate(previewTemplate)}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
