import React, { useState, useEffect } from 'react';
import { useLiveAssistant } from '../hooks/useLiveAssistant';
import { Mic, MicOff, X, Sparkles, Activity, Volume2 } from 'lucide-react';

export const LiveAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // In a real app, you'd get this from env or a secure endpoint. 
  // For this architecture, we use process.env.API_KEY as per instructions.
  const apiKey = process.env.API_KEY || '';
  
  const systemInstruction = `You are Qorvyn's AI voice assistant. 
  You are helpful, concise, and friendly. 
  You help users with email marketing strategies, drafting ideas, and navigating the Qorvyn platform.
  If the user asks about their account, ask for their business name to look it up (simulate this).`;

  // Fix: useLiveAssistant now correctly references process.env.API_KEY internally
  const { connect, disconnect, isConnected, isSpeaking, volume, error } = useLiveAssistant({
    systemInstruction
  });

  // Handle opening/closing
  const toggleOpen = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      connect();
    }
  };

  const handleClose = () => {
    disconnect();
    setIsOpen(false);
  };

  // Helper for visualizer bars
  const renderVisualizer = () => {
    // If speaking, use a pre-defined animation or random values
    // If listening (volume > 0), use volume
    const bars = 5;
    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {Array.from({ length: bars }).map((_, i) => {
                let height = 4;
                if (isConnected) {
                    if (isSpeaking) {
                        height = 10 + Math.random() * 30; // Randomize when model speaks
                    } else {
                        // React to mic volume
                        const sensitivity = 2;
                        const v = Math.min(100, volume * sensitivity);
                        // Add some variation based on index
                        height = Math.max(4, (v * (i % 2 === 0 ? 0.8 : 1.2)) / 2.5); 
                    }
                }
                
                return (
                    <div 
                        key={i} 
                        className={`w-2 bg-primary rounded-full transition-all duration-100 ease-in-out ${isConnected ? 'opacity-100' : 'opacity-30'}`}
                        style={{ height: `${height}px` }}
                    />
                );
            })}
        </div>
    );
  };

  if (!apiKey) return null; // Don't show if no key configured

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2
            ${isOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'}
        `}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && <span className="font-medium pr-1">AI Assistant</span>}
      </button>

      {/* Main Interface Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-primary px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
                <Sparkles size={18} />
                <span className="font-semibold">Qorvyn Live</span>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'}`}>
                {isConnected ? 'Live' : 'Connecting'}
            </div>
          </div>

          {/* Visualizer Area */}
          <div className="h-48 bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
             
             {error ? (
                 <div className="text-red-500 text-sm mb-2 px-4">{error}</div>
             ) : (
                <>
                    <div className="mb-6">
                        {renderVisualizer()}
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 animate-pulse">
                        {isSpeaking ? "Qorvyn is speaking..." : isConnected ? "Listening..." : "Connecting..."}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {isSpeaking ? "Tap mute to interrupt" : "Go ahead, I'm listening"}
                    </p>
                </>
             )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-6">
             {/* Note: In a real implementation of disconnect/mic-mute, we would handle the stream tracks. 
                 For this demo, we just rely on visual feedback or disconnect entirely. */}
             <button 
                className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                onClick={handleClose}
                title="End Session"
             >
                <MicOff size={20} />
             </button>
             
             <div className="text-xs text-gray-400 font-mono">
                Gemini 2.5 Native Audio
             </div>
          </div>
        </div>
      )}
    </>
  );
};
