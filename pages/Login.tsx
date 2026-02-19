
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, CheckCircle2, CreditCard, Loader2, User as UserIcon, Building2, Briefcase, ArrowLeft, Coffee, Cpu, Wine, Gamepad2, Globe, Rocket, MessageSquareText, ShoppingBag, Activity, Home, Utensils } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const GLOBAL_LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese (Simplified)', 'Japanese', 
    'Portuguese', 'Italian', 'Dutch', 'Russian', 'Arabic', 'Hindi', 'Korean', 'Greek'
];

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957273V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
        <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
        <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957273 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
);

export const Login = () => {
  const { login, loginWithGoogle, register, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [regStep, setRegStep] = useState<'plan' | 'payment' | 'account' | 'personalize'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (user) {
        // Redirect logic based on role
        const target = user.role === 'admin' ? '/admin' : '/client';
        navigate(target, { replace: true });
    }
    // Check if redirect from landing page
    if (searchParams.get('flow') === 'signup') {
        setIsLogin(false);
        setRegStep('plan');
    }
  }, [user, navigate, searchParams]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleRegisterFinalize = async () => {
      await register(name, email, businessName, password, selectedPlan, language, industry, description, website);
  };

  const handleGoogleLogin = async () => {
      setIsGoogleLoading(true);
      await loginWithGoogle();
      setIsGoogleLoading(false);
  };

  const handleDemoLogin = (email: string) => {
    login(email, 'password');
  };

  const simulatePayment = (provider: string) => {
      setPaymentProcessing(true);
      setTimeout(() => {
          setPaymentProcessing(false);
          setRegStep('account');
      }, 2000);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-indigo-50/30 dark:focus:bg-indigo-900/20 focus:-translate-y-0.5 focus:animate-glow outline-none transition-all duration-300 text-sm font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm";

  // Auto-login loading state to prevent form flash
  if (isLoading || user) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 animate-bounce-soft shadow-lg">
                <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={32} />
            </div>
            <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={20} />
                <p className="text-gray-500 dark:text-slate-400 font-medium text-sm animate-pulse">Restoring Session...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <ShieldCheck className="text-white" size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          {isLogin ? 'Welcome back to Qorvyn' : 'Establish your HQ'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-2xl rounded-[2rem] border border-gray-100 dark:border-slate-800">
          
          {/* Toggle between Sign In / Sign Up */}
          {regStep === 'plan' && (
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
                <button
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setIsLogin(true)}
                >
                  SIGN IN
                </button>
                <button
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => {setIsLogin(false); setRegStep('plan')}}
                >
                  SIGN UP
                </button>
              </div>
          )}

          <div className="space-y-5">
            {isLogin ? (
              // --- LOGIN VIEW ---
              <>
                <button 
                  onClick={handleGoogleLogin} 
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
                  {isGoogleLoading ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
                  Continue with Google
                </button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-slate-800"></div></div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white dark:bg-slate-900 px-4 text-gray-400 dark:text-slate-500 font-black">OR</span></div>
                </div>

                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    <div className="group/field">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within/field:text-indigo-500">Email address</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="name@company.com" />
                    </div>
                    <div className="group/field">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within/field:text-indigo-500">Password</label>
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="••••••••" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={16} /></>}
                        </button>
                    </div>
                </form>
                    
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 text-center">Quick Demo Login</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleDemoLogin('admin@qorvyn.com')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-slate-600 dark:text-slate-400 group h-20">
                            <ShieldCheck size={20} className="mb-1 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase">Super Admin</span>
                        </button>
                        <button onClick={() => handleDemoLogin('jane@acme.com')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-slate-600 dark:text-slate-400 group h-20">
                            <Building2 size={20} className="mb-1 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase">Acme Corp</span>
                        </button>
                        
                        {/* New Demos */}
                        <button onClick={() => handleDemoLogin('sarah@urbanvogue.com')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-slate-600 dark:text-slate-400 group h-20">
                            <ShoppingBag size={20} className="mb-1 text-pink-500" />
                            <span className="text-[10px] font-black uppercase">Urban Vogue</span>
                        </button>
                        <button onClick={() => handleDemoLogin('mike@ironpulse.com')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-slate-600 dark:text-slate-400 group h-20">
                            <Activity size={20} className="mb-1 text-orange-500" />
                            <span className="text-[10px] font-black uppercase">Iron Pulse</span>
                        </button>
                        <button onClick={() => handleDemoLogin('david@skyline.com')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-slate-600 dark:text-slate-400 group h-20">
                            <Home size={20} className="mb-1 text-blue-500" />
                            <span className="text-[10px] font-black uppercase">Skyline</span>
                        </button>
                        <button onClick={() => handleDemoLogin('chef@lumina.com')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-slate-600 dark:text-slate-400 group h-20">
                            <Utensils size={20} className="mb-1 text-amber-500" />
                            <span className="text-[10px] font-black uppercase">Lumina</span>
                        </button>
                    </div>
                </div>
              </>
            ) : (
              // --- REGISTRATION FLOW ---
              <div className="animate-fade-in-right">
                  {/* Step 1: PLAN SELECTION */}
                  {regStep === 'plan' && (
                      <div className="space-y-4">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white text-center mb-4">Choose Your Firepower</h3>
                          {[
                              { id: 'basic', name: 'Starter', price: '$29', features: ['1 User', '1,000 AI Credits'] },
                              { id: 'pro', name: 'Professional', price: '$99', features: ['5 Users', 'Unlimited AI'], highlight: true },
                              { id: 'enterprise', name: 'Enterprise', price: '$299', features: ['Unlimited', 'Dedicated Support'] }
                          ].map((plan) => (
                              <button
                                key={plan.id}
                                onClick={() => { setSelectedPlan(plan.id as any); setRegStep('payment'); }}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] ${plan.highlight ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'}`}
                              >
                                  <div className="text-left">
                                      <p className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wider">{plan.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-slate-400">{plan.features.join(' • ')}</p>
                                  </div>
                                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{plan.price}</div>
                              </button>
                          ))}
                      </div>
                  )}

                  {/* Step 2: PAYMENT */}
                  {regStep === 'payment' && (
                      <div className="space-y-6 text-center">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">Secure Checkout</h3>
                          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4">
                              <p className="text-xs text-gray-500 uppercase font-bold">Total Due Now</p>
                              <p className="text-3xl font-black text-gray-900 dark:text-white">
                                  {selectedPlan === 'basic' ? '$29.00' : selectedPlan === 'pro' ? '$99.00' : '$299.00'}
                              </p>
                          </div>
                          
                          {paymentProcessing ? (
                              <div className="py-8 flex flex-col items-center">
                                  <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                                  <p className="text-xs font-bold text-gray-500">Syncing Payment Provider...</p>
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  <button onClick={() => simulatePayment('apple')} className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                      <span className="text-lg"></span> Pay
                                  </button>
                                  <button onClick={() => simulatePayment('google')} className="w-full py-3 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                      <GoogleIcon /> Pay
                                  </button>
                                  <button onClick={() => simulatePayment('paypal')} className="w-full py-3 bg-[#0070BA] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                      <span className="italic font-serif">PayPal</span>
                                  </button>
                              </div>
                          )}

                          <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                              <button onClick={() => setRegStep('account')} className="text-xs text-indigo-500 hover:underline font-bold">
                                  Skip Payment (Demo Mode)
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Step 3: ACCOUNT DETAILS */}
                  {regStep === 'account' && (
                      <form onSubmit={(e) => { e.preventDefault(); setRegStep('personalize'); }} className="space-y-4">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white text-center mb-4">Create Credentials</h3>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="John Doe" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="john@company.com" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="••••••••" />
                          </div>
                          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl mt-4 hover:bg-indigo-700 transition-all">
                              Next Step <ArrowRight size={16} className="inline ml-1" />
                          </button>
                      </form>
                  )}

                  {/* Step 4: PERSONALIZATION */}
                  {regStep === 'personalize' && (
                      <form onSubmit={(e) => { e.preventDefault(); handleRegisterFinalize(); }} className="space-y-4">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white text-center mb-4">Customize Your HQ</h3>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                              <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClasses} placeholder="Acme Inc." />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Industry / Business Type</label>
                              <input type="text" required value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClasses} placeholder="e.g. Coffee Shop, SaaS, Agency" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Website URL (Optional)</label>
                              <p className="text-[10px] text-gray-500 dark:text-slate-500 mb-1">AI will analyze this to match your brand style.</p>
                              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClasses} placeholder="https://yourbusiness.com" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Description</label>
                              <p className="text-[10px] text-gray-500 dark:text-slate-500 mb-1">Tell us what you do. The AI will use this to personalize strategies.</p>
                              <textarea 
                                required 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                className={`${inputClasses} resize-none`} 
                                rows={3}
                                placeholder="e.g. We are a boutique coffee roaster specializing in fair-trade beans and sustainable practices..." 
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default Content Language</label>
                              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClasses}>
                                  {GLOBAL_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                          </div>
                          
                          <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl mt-6 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                              {isLoading ? <Loader2 className="animate-spin" /> : <Rocket size={18} />}
                              Launch Dashboard
                          </button>
                      </form>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
