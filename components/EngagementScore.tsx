
import React from 'react';
import { Target, Info, FileText } from 'lucide-react';

interface EngagementScoreProps {
  score: number;
  insight?: string;
  className?: string;
}

export const EngagementScore: React.FC<EngagementScoreProps> = ({ score, insight, className = '' }) => {
  const getColors = () => {
    if (score >= 80) return { 
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', 
        text: 'text-emerald-600 dark:text-emerald-400', 
        border: 'border-emerald-200 dark:border-emerald-800/50',
        label: 'Strong',
        dot: 'bg-emerald-500'
    };
    if (score >= 50) return { 
        bg: 'bg-amber-500/10 dark:bg-amber-500/20', 
        text: 'text-amber-600 dark:text-amber-400', 
        border: 'border-amber-200 dark:border-amber-800/50',
        label: 'Average',
        dot: 'bg-amber-500'
    };
    return { 
        bg: 'bg-rose-500/10 dark:bg-rose-500/20', 
        text: 'text-rose-600 dark:text-rose-400', 
        border: 'border-rose-200 dark:border-rose-800/50',
        label: 'Weak',
        dot: 'bg-rose-500'
    };
  };

  const colors = getColors();

  return (
    <div className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-300 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse shadow-[0_0_8px_rgba(var(--color-rgb),0.5)]`} />
      <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>{score}/100 Copy Strength</span>
            <FileText size={12} className={colors.text} />
          </div>
      </div>

      {/* Insight Tooltip */}
      {insight && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
            <div className="flex items-start gap-3">
                <Info size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Critique</p>
                    <p className="text-xs font-medium leading-relaxed">{insight}</p>
                </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
};
