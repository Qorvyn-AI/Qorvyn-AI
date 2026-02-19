
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  Mic, 
  Globe, 
  Cpu,
  ChevronDown,
  Database,
  Search,
  Rocket,
  Layers,
  Activity,
  Wifi,
  Users,
  Code
} from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

// Component to simulate AI Typing in the mock dashboard
const TypingSimulation = () => {
  const [text, setText] = useState('');
  const fullText = "Analyzing customer engagement metrics... generating optimization strategy...";
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, index));
      index++;
      if (index > fullText.length) index = 0;
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-xs md:text-sm text-indigo-300">
      <span className="text-green-400 mr-1.5">➜</span>
      {text}
      <span className="animate-pulse">_</span>
    </div>
  );
};

// Subtle background icons floating
const FloatingIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
    {/* Top Left Area */}
    <div className="absolute top-[15%] left-[5%] text-indigo-500/10 animate-float" style={{ animationDuration: '8s' }}>
      <Mail size={48} />
    </div>
    
    {/* Top Right Area */}
    <div className="absolute top-[10%] right-[10%] text-purple-500/10 animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }}>
      <Database size={64} />
    </div>
    
    {/* Middle Left */}
    <div className="absolute top-[40%] left-[15%] text-cyan-500/10 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}>
      <Wifi size={56} />
    </div>

    {/* Middle Right */}
    <div className="absolute top-[50%] right-[5%] text-pink-500/10 animate-float" style={{ animationDuration: '9s', animationDelay: '3s' }}>
      <Zap size={40} />
    </div>

    {/* Bottom Left */}
    <div className="absolute bottom-[20%] left-[8%] text-emerald-500/10 animate-float" style={{ animationDuration: '11s', animationDelay: '0.5s' }}>
      <BarChart3 size={72} />
    </div>

    {/* Bottom Right */}
    <div className="absolute bottom-[15%] right-[15%] text-amber-500/10 animate-float" style={{ animationDuration: '13s', animationDelay: '1.5s' }}>
      <Cpu size={60} />
    </div>
  </div>
);

// Digital Circuit Lines Background
const CircuitBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M10 10h80v80h-80z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M50 10v30 M10 50h30 M90 50h-30 M50 90v-30" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="2" fill="currentColor"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" className="text-indigo-200" />
    </svg>
  </div>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-300">
                <ShieldCheck className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">Qorvyn</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
              <Link to="/services" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </Link>
              <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link 
                to="/login?flow=signup" 
                className="px-4 py-2 rounded-lg bg-white text-slate-950 font-bold text-sm hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg shadow-white/10"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <Link to="/login" className="text-xs font-black text-white bg-indigo-600 px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/20">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-slate-950">
           <div className="absolute inset-0 bg-grid animate-grid-flow opacity-[0.07]"></div>
           <FloatingIcons />
           {/* Enhanced Ambient Glows */}
           <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-[120px] opacity-40 animate-blob"></div>
           <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
           <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full filter blur-[100px] opacity-30 animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          <ScrollReveal animation="zoom-in" delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 mb-8 backdrop-blur-md hover:border-indigo-500 transition-all shadow-xl animate-bounce-soft">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-indigo-500"></span>
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-300">Gemini 3 Pro Integration Live</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={200}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-8 drop-shadow-2xl">
                Marketing that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-shimmer bg-[length:200%_auto]">
                Thinks & Speaks
                </span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={400}>
            <p className="max-w-2xl mx-auto text-lg md:text-2xl text-slate-400 mb-10 leading-relaxed font-medium opacity-90">
                Stop guessing. Start growing. Qorvyn uses advanced generative AI to write your campaigns, segment your audience, and analyze your results in real-time.
            </p>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={600}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-lg">
                <Link 
                to="/login?flow=signup" 
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-3 group relative overflow-hidden active:scale-95"
                >
                Start Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <Link 
                to="/about" 
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-white font-bold text-lg border border-slate-700 backdrop-blur-sm transition-all flex items-center justify-center active:scale-95"
                >
                Meet the Team
                </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="py-20 relative z-20 -mt-24 md:-mt-32 overflow-hidden px-4">
         <ScrollReveal animation="zoom-in" delay={300} className="perspective-1000">
            <div className="max-w-6xl mx-auto">
                <div className="relative rounded-[2.5rem] border border-slate-800 bg-slate-900/80 backdrop-blur-2xl p-2 md:p-3 shadow-[0_0_80px_-20px_rgba(79,70,229,0.4)] transition-all duration-1000 transform hover:rotate-x-1 hover:rotate-y-1 group">
                    {/* Glowing border effect */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse"></div>
                    <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 aspect-[16/10] flex items-center justify-center shadow-inner">
                        <div className="w-full h-full relative p-4 md:p-8 flex flex-col">
                            {/* Mock UI Elements with better details */}
                            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 mb-8">
                                <div className="flex gap-2.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-inner"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-inner"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-inner"></div>
                                </div>
                                <div className="h-9 w-48 md:w-80 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-4">
                                   <Search size={14} className="text-slate-500 mr-2" />
                                   <div className="h-1.5 w-32 md:w-56 bg-slate-800 rounded-full"></div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex gap-8">
                                <div className="w-56 hidden lg:block border-r border-slate-800 space-y-6 pr-8">
                                    {[1, 2, 3, 4, 5].map(i => (
                                      <div key={i} className="h-12 w-full bg-slate-900/50 rounded-xl border border-slate-800/50 flex items-center px-4 gap-3 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                                        <div className="w-6 h-6 rounded-lg bg-slate-800"></div>
                                        <div className="h-2 w-28 bg-slate-800 rounded-full"></div>
                                      </div>
                                    ))}
                                </div>
                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="col-span-2 lg:col-span-3 h-32 md:h-40 bg-gradient-to-br from-indigo-950/40 to-slate-900/40 rounded-3xl border border-slate-800 p-6 relative overflow-hidden group">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-2xl group-hover:scale-110 transition-transform">
                                           <Sparkles className="text-white" size={24} />
                                        </div>
                                        <TypingSimulation />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
                                    </div>
                                    
                                    <div className="h-32 md:h-40 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-end relative overflow-hidden animate-fade-in-up animate-delay-300">
                                       <div className="flex items-end gap-2 h-20">
                                          {[30, 70, 40, 90, 50, 80, 60].map((h, i) => (
                                            <div key={i} className="flex-1 bg-slate-800 rounded-t-lg relative">
                                              <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                            </div>
                                          ))}
                                       </div>
                                       <p className="text-[10px] font-black text-slate-500 mt-4 uppercase tracking-[0.2em]">Growth Velocity</p>
                                    </div>

                                    <div className="h-32 md:h-40 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex items-center justify-center animate-fade-in-up animate-delay-500">
                                        <div className="relative">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[8px] border-slate-800 border-t-indigo-500 animate-spin-slow shadow-xl"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Activity size={24} className="text-indigo-400 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-32 md:h-40 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-center animate-fade-in-up animate-delay-700">
                                        <div className="flex -space-x-3 mb-4">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 shadow-xl"></div>
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-black">+12k</div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </ScrollReveal>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-slate-950 relative overflow-hidden">
        <CircuitBackground />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
            {[
                { label: "AI Emails Sent", val: "1.2M+" },
                { label: "Average Open Rate", val: "42%" },
                { label: "ROI Average", val: "12x" },
                { label: "Active Nodes", val: "4,500+" }
            ].map((stat, i) => (
                <ScrollReveal key={i} delay={i * 100} animation="scale-up">
                    <h3 className="text-4xl md:text-5xl font-black text-white mb-2">{stat.val}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                </ScrollReveal>
            ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        {/* Subtle data stream effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <ScrollReveal>
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">A Complete Ecosystem</h2>
                    <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-80">
                        Qorvyn isn't just a newsletter tool. It's an end-to-end growth operating system that handles everything from data capture to campaign execution.
                    </p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Feature 1: Wi-Fi Capture */}
                <ScrollReveal delay={0} animation="fade-in-up">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-800 h-full hover:border-cyan-500/50 transition-all hover:-translate-y-2 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                                <Wifi size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">1. Wi-Fi Capture</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Convert physical foot traffic into digital leads. Our <strong>custom captive portals</strong> collect emails and phone numbers securely when guests connect to your Wi-Fi network.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Feature 2: Contact Ledger */}
                <ScrollReveal delay={150} animation="fade-in-up">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-800 h-full hover:border-indigo-500/50 transition-all hover:-translate-y-2 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">2. Smart CRM</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Centralize your audience. Syncs automatically with <strong>Brevo, Shopify, and Wi-Fi data</strong>. Our system cleans duplicates and scores every contact based on their potential value.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Feature 3: AI Writer */}
                <ScrollReveal delay={300} animation="fade-in-up">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-800 h-full hover:border-purple-500/50 transition-all hover:-translate-y-2 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                <Sparkles size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">3. AI Newsletters</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Never stare at a blank page. The <strong>Gemini-powered writer</strong> crafts high-converting, psychologically optimized emails and newsletters in seconds, tailored to your brand voice.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Feature 4: Growth Strategy */}
                <ScrollReveal delay={450} animation="fade-in-up">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-800 h-full hover:border-amber-500/50 transition-all hover:-translate-y-2 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">4. Growth Strategy</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Stay ahead of the curve. Access real-time <strong>market trends</strong> and actionable insights for your specific industry to maximize ROI on every campaign you send.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-32 bg-slate-950 relative overflow-hidden">
        {/* Subtle rotating gradient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-[100px] animate-spin-slow opacity-50"></div>
        
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <ScrollReveal>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Simple pricing</h2>
                <p className="text-slate-400 text-xl font-medium mb-24 max-w-xl mx-auto opacity-80">Choose the plan that matches your velocity. No hidden fees.</p>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                {[
                    { name: 'Starter', price: '29', color: 'slate-800', accent: 'indigo-500' },
                    { name: 'Professional', price: '99', color: 'indigo-600', accent: 'white', highlight: true },
                    { name: 'Enterprise', price: '299', color: 'slate-800', accent: 'purple-500' }
                ].map((plan, i) => (
                   <ScrollReveal key={plan.name} delay={i * 150} animation="fade-in-up">
                      <div className={`p-12 rounded-[3rem] h-full flex flex-col bg-slate-950/80 backdrop-blur-md border relative transition-all duration-500 hover:scale-[1.02] ${plan.highlight ? 'border-indigo-500 ring-8 ring-indigo-500/5 shadow-2xl' : 'border-slate-800'}`}>
                         {plan.highlight && (
                             <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-indigo-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl">Most Popular</div>
                         )}
                         <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">{plan.name}</h3>
                         <div className="text-6xl font-black text-white mb-12 leading-none">${plan.price}<span className="text-xl text-slate-500 font-bold tracking-normal ml-2">/mo</span></div>
                         
                         <ul className="space-y-5 mb-14 text-left flex-1">
                            {[
                                "10,000 AI Credits",
                                "Gemini 3 Integration",
                                "Global Captive Portals",
                                "Smart Segmentation",
                                "API Direct Access"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-4 text-slate-300 font-bold text-sm">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                        <CheckCircle2 size={14} className="text-indigo-500" />
                                    </div>
                                    <span className="opacity-80">{item}</span>
                                </li>
                            ))}
                         </ul>

                         <Link 
                            to="/login?flow=signup" 
                            className={`block w-full py-5 rounded-2xl font-black text-center transition-all shadow-xl active:scale-95 ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-700'}`}
                         >
                            Select Plan
                         </Link>
                      </div>
                   </ScrollReveal>
                ))}
            </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-24 px-6 text-center text-slate-500 bg-slate-950">
        <ScrollReveal animation="zoom-in">
            <div className="flex items-center justify-center gap-3 mb-10 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-2xl transition-all group-hover:rotate-6">
                <ShieldCheck className="text-white" size={28} />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">Qorvyn</span>
            </div>
        </ScrollReveal>
        <p className="text-lg font-medium opacity-60 max-w-2xl mx-auto leading-relaxed mb-12">© 2024 Qorvyn AI Inc. Distributed Intelligence for the Modern Enterprise. Built with Gemini.</p>
        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Developer API</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
};
