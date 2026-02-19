
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Linkedin, Twitter, Globe, ArrowRight, Target, Heart, Zap, Code, Cpu, Sparkles } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

const TEAM = [
    {
        name: "Anastasis Koutsoumparis",
        role: "Founder & CEO",
        bio: "The architect behind Qorvyn. Technologist with a decade of experience in automation and AI systems.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        icon: <Cpu size={20} className="text-indigo-400" />
    },
    {
        name: "Elena Vance",
        role: "Head of AI Research",
        bio: "Former researcher at DeepMind. She ensures our Gemini integration remains cutting-edge and ethically aligned.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        icon: <Sparkles size={20} className="text-purple-400" />
    },
    {
        name: "Marcus Thorne",
        role: "CTO",
        bio: "Full-stack wizard specializing in scalable infrastructure. He keeps Qorvyn running at 99.99% uptime.",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        icon: <Code size={20} className="text-cyan-400" />
    },
    {
        name: "Sarah Jenks",
        role: "Head of Growth",
        bio: "Marketing strategist who turned her expertise into the very algorithms Qorvyn uses today.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        icon: <Target size={20} className="text-amber-400" />
    }
];

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Qorvyn</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
              <Link to="/services" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Services</Link>
              <Link to="/about" className="text-sm font-medium text-white transition-colors">Team</Link>
              <Link to="/login" 
                className="px-4 py-2 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal animation="zoom-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                The Human Element
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-in-up" delay={100}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Architects</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={200}>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We are a collective of engineers, researchers, and strategists obsessed with solving the "blank page" problem for businesses worldwide.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Team Grid */}
      <div className="py-20 relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {TEAM.map((member, i) => (
                   <ScrollReveal key={member.name} animation="fade-in-up" delay={i * 150}>
                       <div className="group relative h-full">
                           <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                           <div className="relative h-full bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col transition-transform duration-500 group-hover:-translate-y-2">
                               <div className="relative h-64 overflow-hidden">
                                   <div className="absolute inset-0 bg-indigo-900/20 mix-blend-overlay z-10"></div>
                                   <img 
                                       src={member.image} 
                                       alt={member.name} 
                                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                   />
                                   <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-white/10 z-20">
                                       {member.icon}
                                   </div>
                               </div>
                               <div className="p-6 flex-1 flex flex-col">
                                   <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">{member.role}</p>
                                   <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                                       {member.bio}
                                   </p>
                                   <div className="flex gap-3 pt-4 border-t border-slate-800">
                                       <button className="text-slate-500 hover:text-white transition-colors"><Linkedin size={18} /></button>
                                       <button className="text-slate-500 hover:text-white transition-colors"><Twitter size={18} /></button>
                                       <button className="text-slate-500 hover:text-white transition-colors"><Globe size={18} /></button>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </ScrollReveal>
               ))}
            </div>
         </div>
      </div>

      {/* Values Section */}
      <div className="py-24 bg-slate-900/30 border-y border-white/5 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <ScrollReveal animation="fade-in-left" delay={0}>
                  <div className="flex flex-col gap-4">
                     <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                        <Target size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white">Precision Engineering</h3>
                     <p className="text-slate-400 leading-relaxed">
                        We don't rely on generic LLM wrappers. We build custom pipelines that force the AI to adhere to strict marketing principles and brand guidelines.
                     </p>
                  </div>
               </ScrollReveal>
               
               <ScrollReveal animation="fade-in-up" delay={200}>
                  <div className="flex flex-col gap-4">
                     <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 text-purple-400">
                        <Zap size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white">Velocity First</h3>
                     <p className="text-slate-400 leading-relaxed">
                        Speed is a feature. Our infrastructure is optimized to generate complex strategies and assets in milliseconds, not minutes.
                     </p>
                  </div>
               </ScrollReveal>

               <ScrollReveal animation="fade-in-right" delay={400}>
                  <div className="flex flex-col gap-4">
                     <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20 text-pink-400">
                        <Heart size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white">Human-Centric AI</h3>
                     <p className="text-slate-400 leading-relaxed">
                        We believe AI should amplify human creativity, not replace it. Our tools are designed to be a co-pilot for your vision.
                     </p>
                  </div>
               </ScrollReveal>
            </div>
         </div>
      </div>

      {/* CTA */}
      <div className="py-24">
        <ScrollReveal animation="scale-up">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8">Ready to work with us?</h2>
                <Link to="/login?flow=signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    Join the Platform <ArrowRight size={20} />
                </Link>
            </div>
        </ScrollReveal>
      </div>

      {/* Footer */}
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
