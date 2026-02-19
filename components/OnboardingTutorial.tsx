
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, ChevronRight, Check, Rocket, Zap, Users } from 'lucide-react';

const STEPS = [
    {
        title: "Welcome to Qorvyn AI",
        desc: "Your new AI-powered growth engine is ready. Let's take a quick tour of your command center.",
        icon: Rocket,
        color: "bg-indigo-600"
    },
    {
        title: "AI Writer",
        desc: "Generate high-converting emails and newsletters instantly. Just tell the AI your goal, and it handles the psychology.",
        icon: Sparkles,
        color: "bg-purple-600"
    },
    {
        title: "Growth Strategy",
        desc: "Use the Growth Strategy tab to scan real-time market trends and get actionable insights for your niche.",
        icon: Zap,
        color: "bg-amber-500"
    },
    {
        title: "Smart Contacts",
        desc: "Import your lists from Brevo or Shopify. We'll verify and organize your contact data automatically.",
        icon: Users,
        color: "bg-emerald-500"
    }
];

export const OnboardingTutorial = () => {
    const { user, markTutorialSeen } = useAuth();
    const [step, setStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only show if user is logged in, is a client, and hasn't seen it yet
        if (user && user.role === 'client' && !user.settings?.seenTutorial) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        markTutorialSeen();
    };

    if (!isOpen) return null;

    const CurrentIcon = STEPS[step].icon;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/5 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-zoom-in relative">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 dark:bg-slate-800 w-full">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-3xl ${STEPS[step].color} flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 transform transition-all duration-500`}>
                        <CurrentIcon size={40} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        {STEPS[step].title}
                    </h2>
                    
                    <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-8">
                        {STEPS[step].desc}
                    </p>

                    <div className="flex gap-2 w-full">
                        <div className="flex items-center justify-center flex-1 gap-1.5">
                            {STEPS.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-indigo-600 w-6' : 'bg-gray-200 dark:bg-slate-700'}`} 
                                />
                            ))}
                        </div>
                        <button 
                            onClick={handleNext}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
                        >
                            {step === STEPS.length - 1 ? "Let's Go" : "Next"}
                            {step === STEPS.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
