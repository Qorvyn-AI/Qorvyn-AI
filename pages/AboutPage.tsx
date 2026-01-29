import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Linkedin, Twitter, Globe, ArrowRight, Target, Heart, Zap } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
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
              <Link to="/about" className="text-sm font-medium text-white transition-colors">About</Link>
              <Link to="/login" 
                className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid animate-grid-flow opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal animation="fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
              We are building the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">future of connection.</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-in-up" delay={200}>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Qorvyn isn't just an email tool. It's an intelligent engine designed to bridge the gap between businesses and their audience using the power of Generative AI.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Mission / Values */}
      <div className="py-24 bg-slate-900/50 relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <ScrollReveal animation="fade-in-up" delay={0}>
                  <div className="glass-card p-8 rounded-2xl h-full hover:border-indigo-500/30 transition-colors">
                     <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-6 text-indigo-400">
                        <Target size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
                     <p className="text-slate-400">To democratize enterprise-level marketing intelligence, making it accessible for businesses of all sizes to compete and grow.</p>
                  </div>
               </ScrollReveal>
               
               <ScrollReveal animation="fade-in-up" delay={150}>
                  <div className="glass-card p-8 rounded-2xl h-full hover:border-purple-500/30 transition-colors">
                     <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-purple-400">
                        <Zap size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Our Technology</h3>
                     <p className="text-slate-400">Powered by Gemini 2.5, we push the boundaries of what's possible in real-time content generation and data analysis.</p>
                  </div>
               </ScrollReveal>

               <ScrollReveal animation="fade-in-up" delay={300}>
                  <div className="glass-card p-8 rounded-2xl h-full hover:border-pink-500/30 transition-colors">
                     <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-6 text-pink-400">
                        <Heart size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Our Values</h3>
                     <p className="text-slate-400">Privacy first, transparency always. We believe that AI should be a tool for empowerment, not replacement.</p>
                  </div>
               </ScrollReveal>
            </div>
         </div>
      </div>

      {/* The Team Section */}
      <div className="py-24 relative overflow-hidden">
         <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Meet the Visionary</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">The driving force behind Qorvyn's innovative approach to AI marketing.</p>
                </div>
            </ScrollReveal>

            {/* Featured Profile: Anastasius Kutumparies */}
            <ScrollReveal animation="scale-up">
                <div className="max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative h-96 md:h-auto bg-slate-800">
                            {/* Placeholder for real image - using a high quality abstract professional gradient/placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                                <span className="text-9xl opacity-10 select-none">AK</span>
                            </div>
                            {/* If a real image existed, it would go here. */}
                            <img 
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                alt="Anastasius Kutumparies" 
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 to-transparent p-8">
                                <h3 className="text-2xl font-bold text-white">Anastasius Kutumparies</h3>
                                <p className="text-indigo-400 font-medium">Founder & CEO</p>
                            </div>
                        </div>
                        <div className="p-10 md:p-12 flex flex-col justify-center">
                            <h4 className="text-xl font-bold text-white mb-4">"Innovation is not just about code, it's about connection."</h4>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Anastasius is a technologist and entrepreneur with a deep-seated passion for artificial intelligence and automation. 
                                Recognizing the complexity that small businesses face in digital marketing, he founded Qorvyn to bridge the gap.
                            </p>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                His leadership focuses on ethical AI development and user-centric design, ensuring that Qorvyn remains at the forefront of the SaaS revolution while staying true to its human roots.
                            </p>
                            
                            <div className="flex gap-4">
                                <a href="#" className="p-3 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all duration-300">
                                    <Linkedin size={20} />
                                </a>
                                <a href="#" className="p-3 rounded-full bg-slate-800 hover:bg-sky-500 text-slate-400 hover:text-white transition-all duration-300">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className="p-3 rounded-full bg-slate-800 hover:bg-emerald-500 text-slate-400 hover:text-white transition-all duration-300">
                                    <Globe size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
         </div>
      </div>

      {/* CTA */}
      <div className="py-24">
        <ScrollReveal animation="fade-in-up">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Join us on this journey</h2>
                <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-slate-200 transition-colors">
                    Start Your Free Trial <ArrowRight size={20} />
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