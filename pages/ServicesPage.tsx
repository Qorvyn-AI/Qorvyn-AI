
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Wifi, Users, Sparkles, TrendingUp, ArrowRight, CheckCircle2, Zap, Play, BarChart2, PieChart, Activity } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Qorvyn</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
              <Link to="/services" className="text-sm font-medium text-white transition-colors">Services</Link>
              <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Team</Link>
              <Link to="/login" 
                className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-40 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
            <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
                    <Zap size={14} className="animate-pulse" />
                    Operational Intelligence
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
                    Tools that work <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">harder than your competition.</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
                    Qorvyn isn't just software. It's a vertically integrated growth engine that handles acquisition, retention, and strategy autonomously.
                </p>
            </ScrollReveal>
        </div>
      </div>

      {/* Video Showcase Section */}
      <div className="pb-32 px-6">
          <ScrollReveal animation="scale-up" delay={200}>
              <div className="max-w-6xl mx-auto relative group cursor-pointer">
                  {/* Glowing Border */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  
                  {/* Main Container */}
                  <div className="relative bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden aspect-video shadow-2xl flex items-center justify-center">
                      
                      {/* Background "Video" Mockup */}
                      <div className="absolute inset-0 bg-slate-950">
                          {/* Animated Elements to simulate video content */}
                          <div className="absolute inset-0 flex">
                              <div className="w-1/3 h-full border-r border-slate-800/50 p-8 flex flex-col gap-4">
                                  <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse"></div>
                                  <div className="h-4 w-full bg-slate-900 rounded animate-pulse delay-100"></div>
                                  <div className="h-4 w-2/3 bg-slate-900 rounded animate-pulse delay-200"></div>
                                  <div className="mt-auto h-32 w-full bg-slate-800/50 rounded-xl border border-slate-700/50 relative overflow-hidden">
                                      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-indigo-500/20"></div>
                                  </div>
                              </div>
                              <div className="flex-1 p-8 relative">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="h-40 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                                          <div className="w-10 h-10 rounded-full bg-indigo-500 mb-2"></div>
                                          <div className="h-2 w-20 bg-slate-700 rounded mb-2"></div>
                                          <div className="h-12 w-full bg-slate-900/50 rounded"></div>
                                      </div>
                                      <div className="h-40 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                                          <div className="w-10 h-10 rounded-full bg-purple-500 mb-2"></div>
                                          <div className="h-2 w-20 bg-slate-700 rounded mb-2"></div>
                                          <div className="h-12 w-full bg-slate-900/50 rounded"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Dark Overlay */}
                          <div className="absolute inset-0 bg-slate-950/60 transition-opacity group-hover:opacity-40"></div>
                      </div>

                      {/* Play Button */}
                      <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                              <Play size={28} className="text-indigo-600 ml-1 fill-indigo-600" />
                          </div>
                      </div>

                      <div className="absolute bottom-8 left-8 text-left">
                          <p className="text-white font-bold text-lg mb-1">Platform Walkthrough</p>
                          <p className="text-slate-400 text-sm">See how Qorvyn automates your entire marketing stack.</p>
                      </div>
                  </div>
              </div>
          </ScrollReveal>
      </div>

      {/* Analytics Deep Dive Section */}
      <section className="py-24 bg-slate-900/50 border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <ScrollReveal animation="fade-in-left">
                      <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Full Spectrum Analytics</h2>
                      <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                          Most tools show you open rates. We show you the future. Our analytics engine parses user behavior, industry trends, and historical data to predict the outcome of your next campaign before you even send it.
                      </p>
                      
                      <div className="space-y-6">
                          <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
                                  <BarChart2 size={24} />
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-lg">Predictive Scoring</h4>
                                  <p className="text-slate-400 text-sm mt-1">AI scores your content's potential virality and engagement (0-100) instantly.</p>
                              </div>
                          </div>
                          <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shrink-0">
                                  <PieChart size={24} />
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-lg">Audience Segmentation</h4>
                                  <p className="text-slate-400 text-sm mt-1">Automatically group users by "High Value", "At Risk", and "New" based on Wi-Fi and purchase data.</p>
                              </div>
                          </div>
                          <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shrink-0">
                                  <Activity size={24} />
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-lg">Real-Time Pulse</h4>
                                  <p className="text-slate-400 text-sm mt-1">Watch customers connect to Wi-Fi and open emails live on your dashboard.</p>
                              </div>
                          </div>
                      </div>
                  </ScrollReveal>

                  <ScrollReveal animation="slide-in-right" delay={200}>
                      {/* Abstract Animated Chart UI */}
                      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                          <div className="flex justify-between items-center mb-8">
                              <div>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Campaign ROI</p>
                                  <h3 className="text-3xl font-black text-white">$24,500</h3>
                              </div>
                              <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                                  <TrendingUp size={12} /> +124%
                              </div>
                          </div>

                          {/* SVG Chart Animation */}
                          <div className="h-64 w-full relative">
                              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                                  {/* Grid Lines */}
                                  <line x1="0" y1="0" x2="400" y2="0" stroke="#1e293b" strokeWidth="1" />
                                  <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeWidth="1" />
                                  <line x1="0" y1="100" x2="400" y2="100" stroke="#1e293b" strokeWidth="1" />
                                  <line x1="0" y1="150" x2="400" y2="150" stroke="#1e293b" strokeWidth="1" />
                                  
                                  {/* Gradient Definition */}
                                  <defs>
                                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                      </linearGradient>
                                  </defs>

                                  {/* Area Path */}
                                  <path 
                                      d="M0,150 C50,140 100,100 150,110 C200,120 250,60 300,50 C350,40 400,10 400,10 L400,200 L0,200 Z" 
                                      fill="url(#chartGradient)" 
                                      className="animate-pulse-slow"
                                  />
                                  
                                  {/* Stroke Path */}
                                  <path 
                                      d="M0,150 C50,140 100,100 150,110 C200,120 250,60 300,50 C350,40 400,10 400,10" 
                                      fill="none" 
                                      stroke="#6366f1" 
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                  />

                                  {/* Data Points */}
                                  <circle cx="150" cy="110" r="6" fill="#1e293b" stroke="#6366f1" strokeWidth="3" />
                                  <circle cx="300" cy="50" r="6" fill="#1e293b" stroke="#6366f1" strokeWidth="3" />
                                  <circle cx="400" cy="10" r="6" fill="#fff" stroke="#6366f1" strokeWidth="3" className="animate-ping" />
                              </svg>
                          </div>
                      </div>
                  </ScrollReveal>
              </div>
          </div>
      </section>

      {/* Service 1: Wi-Fi Portal */}
      <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <ScrollReveal animation="slide-in-left">
                      <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 blur-2xl rounded-full"></div>
                          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 aspect-video flex items-center justify-center overflow-hidden group">
                                <Wifi size={80} className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute bottom-6 left-0 w-full text-center">
                                    <div className="inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-xl">
                                        <span className="text-xs font-bold text-cyan-400 font-mono">captive.portal.login</span>
                                    </div>
                                </div>
                          </div>
                      </div>
                  </ScrollReveal>
                  <ScrollReveal animation="fade-in-right" delay={200}>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Wi-Fi Captive Portals</h2>
                      <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                          Turn your free Wi-Fi into a powerful lead generation asset. When customers connect to your network, they are greeted with a branded login page that captures their contact details before granting access.
                      </p>
                      <ul className="space-y-4">
                          {[
                              "Customizable branding & logo",
                              "Email & Phone number collection",
                              "Legal compliance & terms acceptance",
                              "Seamless redirection to your website"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-slate-300">
                                  <CheckCircle2 size={18} className="text-cyan-500" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </ScrollReveal>
              </div>
          </div>
      </section>

      {/* Service 2: Contact Ledger */}
      <section className="py-24 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
                  <ScrollReveal animation="fade-in-left" className="order-2 lg:order-1">
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Smart Contact Ledger</h2>
                      <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                          Forget messy spreadsheets. Our centralized ledger automatically syncs data from your Wi-Fi portal, Shopify store, and Brevo account. AI cleans the data and scores every contact based on engagement.
                      </p>
                      <ul className="space-y-4">
                          {[
                              "Unified view of all customers",
                              "Automated duplicate removal",
                              "Engagement scoring (0-100)",
                              "Purchase history synchronization"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-slate-300">
                                  <CheckCircle2 size={18} className="text-indigo-500" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </ScrollReveal>
                  <ScrollReveal animation="slide-in-right" className="order-1 lg:order-2" delay={200}>
                      <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-2xl rounded-full"></div>
                          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 aspect-video flex flex-col justify-center gap-4 overflow-hidden">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-slate-800 rounded-xl border border-slate-700 w-full flex items-center px-4 gap-4 animate-pulse" style={{animationDelay: `${i*200}ms`}}>
                                        <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                                        <div className="h-2 bg-slate-700 w-24 rounded"></div>
                                        <div className="ml-auto h-2 bg-indigo-900 w-12 rounded"></div>
                                    </div>
                                ))}
                          </div>
                      </div>
                  </ScrollReveal>
              </div>
          </div>
      </section>

      {/* Service 3: AI Writer */}
      <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <ScrollReveal animation="slide-in-left">
                      <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-600 opacity-20 blur-2xl rounded-full"></div>
                          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 aspect-video flex items-center justify-center overflow-hidden">
                                <Sparkles size={80} className="text-purple-400 mb-4 animate-bounce-soft" />
                          </div>
                      </div>
                  </ScrollReveal>
                  <ScrollReveal animation="fade-in-right" delay={200}>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Generative AI Campaigns</h2>
                      <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                          Writer's block is obsolete. Just tell Qorvyn your goal (e.g., "Announce a weekend sale"), and our Gemini-powered engine writes a psychologically optimized newsletter in seconds, complete with subject lines and HTML structure.
                      </p>
                      <ul className="space-y-4">
                          {[
                              "Context-aware copywriting",
                              "Multi-language support (14+ languages)",
                              "Psychological trigger analysis",
                              "One-click export to HTML"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-slate-300">
                                  <CheckCircle2 size={18} className="text-purple-500" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </ScrollReveal>
              </div>
          </div>
      </section>

      {/* Service 4: Growth Strategy */}
      <section className="py-24 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
                  <ScrollReveal animation="fade-in-left" className="order-2 lg:order-1">
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Live Growth Strategy</h2>
                      <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                          Stop guessing what works. Qorvyn scans real-time Google Search data to identify trending topics, competitor strategies, and high-value keywords in your specific industry.
                      </p>
                      <ul className="space-y-4">
                          {[
                              "Real-time market trend analysis",
                              "Competitor revenue model breakdown",
                              "Actionable growth checklists",
                              "Verified data sources"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-slate-300">
                                  <CheckCircle2 size={18} className="text-amber-500" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </ScrollReveal>
                  <ScrollReveal animation="slide-in-right" className="order-1 lg:order-2" delay={200}>
                      <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-600 opacity-20 blur-2xl rounded-full"></div>
                          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 aspect-video flex items-center justify-center overflow-hidden">
                                <TrendingUp size={80} className="text-amber-400 mb-4" />
                          </div>
                      </div>
                  </ScrollReveal>
              </div>
          </div>
      </section>

      {/* CTA */}
      <div className="py-24 bg-gradient-to-b from-slate-950 to-indigo-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8">Deploy your Growth Engine</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">Join 4,500+ businesses using Qorvyn to automate their success.</p>
            <Link to="/login?flow=signup" className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-slate-950 font-black text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Start Free Trial <ArrowRight size={20} />
            </Link>
        </div>
      </div>

      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <ShieldCheck className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-white">Qorvyn</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 Qorvyn AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
