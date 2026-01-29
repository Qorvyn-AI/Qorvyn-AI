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
  Rocket
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
    <div className="font-mono text-xs text-indigo-300">
      <span className="text-green-400 mr-2">➜</span>
      {text}
      <span className="animate-pulse">_</span>
    </div>
  );
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-300">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">Qorvyn</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
              <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </Link>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link 
                to="/login" 
                className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg shadow-white/10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background - Living Blobs */}
        <div className="absolute inset-0 bg-slate-950">
           <div className="absolute inset-0 bg-grid animate-grid-flow opacity-10"></div>
           
           {/* Primary Blob */}
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
           {/* Secondary Blob */}
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
           {/* Tertiary Blob */}
           <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <ScrollReveal animation="zoom-in" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 mb-8 backdrop-blur-md hover:border-indigo-500 transition-all cursor-default shadow-lg hover:shadow-indigo-500/20">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </div>
                <span className="text-sm font-medium text-indigo-300">Gemini 2.5 Live Integration</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={100}>
            <h1 className="text-5xl md:text-8xl font-extrabold text-white tracking-tight leading-tight mb-8 drop-shadow-2xl">
                Marketing that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-shimmer bg-[length:200%_auto]">
                Thinks & Speaks
                </span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={300}>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
                Stop guessing. Start growing. Qorvyn uses advanced generative AI to write your campaigns, segment your audience, and analyze your results in real-time.
            </p>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={500}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-all shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-1 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                Start Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                to="/about" 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900/50 hover:bg-slate-800 text-white font-medium text-lg border border-slate-700 hover:border-slate-500 backdrop-blur-sm transition-all hover:-translate-y-1"
                >
                Meet the Team
                </Link>
            </div>
          </ScrollReveal>

          <div className="absolute bottom-10 animate-bounce-soft text-slate-500 opacity-50">
             <ChevronDown size={32} />
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="py-20 relative z-20 -mt-20">
         <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal animation="zoom-in" delay={200}>
                <div className="relative rounded-2xl border border-slate-700 bg-slate-900/80 backdrop-blur-xl p-2 shadow-2xl shadow-indigo-500/20 transform hover:scale-[1.01] transition-transform duration-700 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[16/9] flex items-center justify-center">
                        {/* Mock UI */}
                        <div className="w-full h-full relative p-4 flex flex-col">
                            {/* Mock Header */}
                            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 mb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="h-8 w-64 bg-slate-900 rounded-lg border border-slate-800 flex items-center px-3">
                                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2"></div>
                                   <div className="h-2 w-24 bg-slate-800 rounded"></div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex gap-4">
                                {/* Mock Sidebar */}
                                <div className="w-48 hidden md:block border-r border-slate-800 space-y-3 pr-4">
                                    {[1, 2, 3, 4].map(i => (
                                      <div key={i} className="h-8 w-full bg-slate-900/50 rounded-lg border border-slate-800/50 flex items-center px-2 gap-2">
                                        <div className="w-4 h-4 rounded bg-slate-800"></div>
                                        <div className="h-2 w-16 bg-slate-800 rounded"></div>
                                      </div>
                                    ))}
                                    <div className="h-24 w-full bg-indigo-500/10 rounded-xl border border-indigo-500/20 mt-8 p-3 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>
                                        <div className="h-2 w-12 bg-indigo-400/40 rounded mb-2"></div>
                                        <div className="h-2 w-20 bg-indigo-400/20 rounded"></div>
                                    </div>
                                </div>
                                {/* Mock Main */}
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div className="col-span-2 h-40 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-slate-800 p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                                           <Sparkles className="text-white" size={24} />
                                        </div>
                                        <TypingSimulation />
                                    </div>
                                    <div className="h-40 bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col justify-end relative overflow-hidden group/card">
                                       <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                       <div className="flex items-end gap-1 h-20">
                                          {[40, 60, 45, 80, 55, 90].map((h, i) => (
                                            <div key={i} className="flex-1 bg-slate-800 rounded-t-sm relative group/bar">
                                              <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-indigo-500/80 rounded-t-sm transition-all duration-1000 group-hover/card:bg-green-500"></div>
                                            </div>
                                          ))}
                                       </div>
                                       <p className="text-xs text-slate-500 mt-2">Revenue Growth</p>
                                    </div>
                                    <div className="h-40 bg-slate-900 rounded-xl border border-slate-800 p-4 relative">
                                        <div className="absolute inset-0 bg-grid opacity-5"></div>
                                        <div className="flex items-center justify-center h-full">
                                            <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card Animation */}
                            <div className="absolute top-1/4 right-10 bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-600 shadow-2xl animate-float z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400 shadow-inner shadow-green-500/10">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">AI Optimization</p>
                                        <p className="text-sm font-bold text-white">+142% Open Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
         </div>
      </div>

      {/* NEW: How It Works Section with Scroll Animations */}
      <div id="how-it-works" className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Automate your success in 3 steps</h2>
                    <p className="text-slate-400 text-lg">From data connection to revenue generation, we handle the heavy lifting.</p>
                </div>
            </ScrollReveal>

            <div className="space-y-20">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <ScrollReveal animation="slide-in-left">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative bg-slate-900 rounded-2xl border border-slate-800 p-8 h-64 flex items-center justify-center overflow-hidden">
                                     <div className="absolute inset-0 bg-grid opacity-10"></div>
                                     <Database size={80} className="text-cyan-500 opacity-80 animate-pulse" />
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                    <div className="md:w-1/2">
                        <ScrollReveal animation="fade-in-up" delay={200}>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">1</span>
                                <h3 className="text-2xl font-bold text-white">Connect Your Data</h3>
                            </div>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Sync with Brevo or upload your lists instantly. Qorvyn automatically cleans and segments your data, finding hidden opportunities in your existing audience.
                            </p>
                        </ScrollReveal>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                     <div className="md:w-1/2">
                        <ScrollReveal animation="slide-in-right">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative bg-slate-900 rounded-2xl border border-slate-800 p-8 h-64 flex items-center justify-center overflow-hidden">
                                     <div className="absolute inset-0 bg-grid opacity-10"></div>
                                     <Search size={80} className="text-purple-500 opacity-80 animate-float" />
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                    <div className="md:w-1/2">
                        <ScrollReveal animation="fade-in-up" delay={200}>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">2</span>
                                <h3 className="text-2xl font-bold text-white">AI Analysis & Strategy</h3>
                            </div>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Our Gemini 2.5 engine analyzes market trends and your specific business niche to generate a custom growth strategy and high-converting content topics.
                            </p>
                        </ScrollReveal>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                         <ScrollReveal animation="slide-in-left">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative bg-slate-900 rounded-2xl border border-slate-800 p-8 h-64 flex items-center justify-center overflow-hidden">
                                     <div className="absolute inset-0 bg-grid opacity-10"></div>
                                     <Rocket size={80} className="text-emerald-500 opacity-80 animate-bounce-soft" />
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                    <div className="md:w-1/2">
                        <ScrollReveal animation="fade-in-up" delay={200}>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">3</span>
                                <h3 className="text-2xl font-bold text-white">Launch & Grow</h3>
                            </div>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Deploy campaigns with one click. Qorvyn handles delivery, tracks performance, and even repurposes your content for social media automatically.
                            </p>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-32 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for the future of growth</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">Every feature is designed to save you time and increase your revenue through intelligent automation.</p>
                </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    {
                        icon: Sparkles,
                        title: "Generative AI Writer",
                        desc: "Create weeks worth of email content in minutes. Our Gemini-powered engine learns your brand voice.",
                        color: "from-amber-400 to-orange-500"
                    },
                    {
                        icon: Mic,
                        title: "Voice Command Center",
                        desc: "Navigate your dashboard, query analytics, and draft emails using just your voice.",
                        color: "from-red-400 to-pink-500"
                    },
                    {
                        icon: BarChart3,
                        title: "Predictive Analytics",
                        desc: "Don't just see what happened. See what will happen next with AI-driven forecasting.",
                        color: "from-blue-400 to-indigo-500"
                    },
                    {
                        icon: Globe,
                        title: "Multi-Channel Sync",
                        desc: "Seamlessly push content to social media. Turn one newsletter into 5 LinkedIn posts instantly.",
                        color: "from-green-400 to-emerald-500"
                    },
                    {
                        icon: Cpu,
                        title: "Smart Segmentation",
                        desc: "Let AI find the hidden patterns in your customer data and create hyper-targeted lists.",
                        color: "from-purple-400 to-violet-500"
                    },
                    {
                        icon: ShieldCheck,
                        title: "Enterprise Security",
                        desc: "SOC2 compliant infrastructure ensures your customer data remains safe and private.",
                        color: "from-indigo-400 to-cyan-500"
                    }
                ].map((feature, i) => (
                    <ScrollReveal key={i} delay={i * 100} animation="scale-up">
                        <div className="group relative p-0.5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 hover:from-indigo-500/50 hover:to-purple-500/50 transition-all duration-500 hover:-translate-y-2">
                            <div className="bg-slate-950 h-full w-full rounded-2xl p-8 relative overflow-hidden">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <feature.icon className="text-white" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300">{feature.desc}</p>
                                
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 relative overflow-hidden bg-slate-900/50">
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple pricing, powerful results</h2>
                    <p className="text-slate-400 text-lg">Start free, upgrade as you grow.</p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                {/* Basic */}
                <ScrollReveal delay={0} animation="slide-in-left">
                    <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
                        <h3 className="text-xl font-medium text-slate-300 mb-2">Basic</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold text-white">$29</span>
                            <span className="text-slate-500">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Up to 1,000 contacts', 'Basic AI Templates', 'Email Support', 'Monthly Newsletter'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-slate-400">
                                    <CheckCircle2 size={18} className="text-slate-600" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/login" className="block w-full py-3 rounded-xl border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors text-center">
                            Get Basic
                        </Link>
                    </div>
                </ScrollReveal>

                {/* Pro */}
                <ScrollReveal delay={150} animation="zoom-in">
                    <div className="p-8 rounded-3xl bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 relative scale-105 z-10 hover:shadow-indigo-500/40 transition-all duration-300">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                            Most Popular
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-bold text-white">$99</span>
                            <span className="text-slate-500">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Up to 10,000 contacts', 'Advanced AI Writer', 'Voice Assistant Access', 'Social Media Generator', 'Priority Support'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle2 size={18} className="text-indigo-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/login" className="block w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/40 transition-all text-center">
                            Get Pro
                        </Link>
                    </div>
                </ScrollReveal>

                {/* Enterprise */}
                <ScrollReveal delay={300} animation="slide-in-right">
                    <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
                        <h3 className="text-xl font-medium text-slate-300 mb-2">Enterprise</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold text-white">$299</span>
                            <span className="text-slate-500">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Unlimited contacts', 'Custom AI Models', 'Dedicated Manager', 'API Access', 'SSO & Advanced Security'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-slate-400">
                                    <CheckCircle2 size={18} className="text-slate-600" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/login" className="block w-full py-3 rounded-xl border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors text-center">
                            Contact Sales
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <ScrollReveal animation="zoom-in">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to transform your marketing?</h2>
                <p className="text-slate-400 mb-12 text-xl max-w-2xl mx-auto">Join thousands of businesses using Qorvyn to automate their growth and connect with customers like never before.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link to="/login" className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-slate-950 font-bold text-xl hover:bg-slate-200 transition-all hover:scale-105 shadow-2xl">
                        Get Started Now
                    </Link>
                </div>
            </ScrollReveal>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <ShieldCheck className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-white">Qorvyn</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
                <Link to="/about" className="hover:text-white transition-colors">About Team</Link>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-slate-500 text-sm">© 2024 Qorvyn AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};