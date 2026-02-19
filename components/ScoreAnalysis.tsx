
import React from 'react';
import { EmailScoreResult } from '../services/geminiService';
import { Lightbulb } from 'lucide-react';

interface ScoreAnalysisProps {
  analysis: EmailScoreResult;
  className?: string;
}

const ScoreItem = ({ label, score, feedback, suggestions }: { label: string, score: number, feedback: string, suggestions: string[] }) => {
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-emerald-500';
        if (s >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">{label}</h4>
                <span className={`font-black text-lg ${getScoreColor(score)}`}>{score}/100</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{feedback}</p>
            
            {suggestions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Lightbulb size={12} className="text-indigo-500" /> Suggestions
                    </p>
                    <ul className="space-y-1">
                        {suggestions.map((s, i) => (
                            <li key={i} className="text-xs text-gray-500 dark:text-slate-500 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const ScoreAnalysis: React.FC<ScoreAnalysisProps> = ({ analysis, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className={`text-4xl font-black ${analysis.overallScore >= 80 ? 'text-emerald-500' : analysis.overallScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                {analysis.overallScore}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Overall Quality</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">{analysis.overallInsight}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <ScoreItem 
                label="Subject Line" 
                score={analysis.subjectAnalysis.score} 
                feedback={analysis.subjectAnalysis.feedback} 
                suggestions={analysis.subjectAnalysis.suggestions} 
            />
            <ScoreItem 
                label="Body Content" 
                score={analysis.bodyAnalysis.score} 
                feedback={analysis.bodyAnalysis.feedback} 
                suggestions={analysis.bodyAnalysis.suggestions} 
            />
        </div>
    </div>
  );
};
