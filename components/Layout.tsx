
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MockBackend } from '../services/mockBackend';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Mail, 
  History,
  ShieldCheck,
  Menu,
  X,
  Newspaper,
  Settings,
  TrendingUp,
  Wifi,
  ChevronRight,
  Database,
  Moon,
  Sun,
  Share2,
  LifeBuoy,
  CreditCard,
  MessageSquare,
  LayoutTemplate
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { LiveAssistant } from './LiveAssistant';

const MENU_TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    dashboard: "Pulse Dashboard",
    growth: "Growth Strategy",
    newsletters: "Newsletters",
    writer: "AI Email Writer",
    social: "Social Command",
    contacts: "Contact Ledger",
    wifi: "Wi-Fi Captive",
    history: "Audit Logs",
    settings: "Settings",
    support: "Contact Support",
    exit: "Exit",
    sec_growth: "Growth Engine",
    sec_campaigns: "Campaigns",
    sec_connections: "Connections",
    sec_oversight: "Oversight",
    // Admin Specific
    system_overview: "System Overview",
    client_registry: "Client Registry",
    billing_ops: "Billing & Plans",
    helpdesk: "Support Inbox",
    management: "Management"
  },
  // ... (Other languages would go here)
};

const getTranslation = (lang: string, key: string) => {
    const dict = MENU_TRANSLATIONS[lang] || MENU_TRANSLATIONS['English'];
    return dict?.[key] || MENU_TRANSLATIONS['English']?.[key] || key;
};

const NavItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 dark:shadow-none' 
        : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white font-medium'
    }`}
  >
    <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400 dark:text-slate-500 group-hover:text-indigo-500'} />
        <span className="text-sm tracking-tight">{label}</span>
    </div>
    {active && <ChevronRight size={14} className="opacity-60" />}
  </Link>
);

const NavSectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="px-4 mt-6 mb-2">
        <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{children}</span>
    </div>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [uiLanguage, setUiLanguage] = useState('English');
  const [clientPlan, setClientPlan] = useState<'basic' | 'pro' | 'enterprise'>('basic');

  useEffect(() => {
    const loadClientData = async () => {
      if (user?.clientId) {
        const client = await MockBackend.getClientById(user.clientId);
        if (client) {
          setClientPlan(client.plan);
          if (client.settings?.uiLanguage) {
            setUiLanguage(client.settings.uiLanguage);
          }
        }
      }
    };

    loadClientData();

    const handleSettingsUpdate = () => loadClientData();
    window.addEventListener('qorvyn_settings_updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('qorvyn_settings_updated', handleSettingsUpdate);
    };
  }, [user]);

  if (!user) return <>{children}</>;

  const isAdmin = user.role === 'admin';
  const t = (key: string) => getTranslation(uiLanguage, key);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300 overflow-x-hidden">
      {/* Fixed Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="p-6 pb-4 flex items-center justify-between shrink-0">
          <Link to={isAdmin ? "/admin" : "/client"} className="flex items-center gap-3 group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-3 ${isAdmin ? 'bg-slate-900 dark:bg-indigo-600' : 'bg-indigo-600'}`}>
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
               <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none">Qorvyn</h1>
               <span className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mt-1 block">
                {isAdmin ? 'System Control' : 'Business HQ'}
               </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2 scrollbar-hide">
          {isAdmin ? (
            <>
              <NavSectionLabel children={t('management')} />
              <NavItem to="/admin" icon={LayoutDashboard} label={t('system_overview')} active={location.pathname === '/admin'} />
              <NavItem to="/admin/clients" icon={Database} label={t('client_registry')} active={location.pathname === '/admin/clients'} />
              <NavItem to="/admin/billing" icon={CreditCard} label={t('billing_ops')} active={location.pathname === '/admin/billing'} />
              <NavItem to="/admin/support" icon={MessageSquare} label={t('helpdesk')} active={location.pathname === '/admin/support'} />
            </>
          ) : (
            <>
              <NavSectionLabel children={t('sec_growth')} />
              <NavItem to="/client" icon={LayoutDashboard} label={t('dashboard')} active={location.pathname === '/client'} />
              <NavItem to="/client/growth" icon={TrendingUp} label={t('growth')} active={location.pathname === '/client/growth'} />
              
              <NavSectionLabel children={t('sec_campaigns')} />
              <NavItem to="/client/newsletters" icon={Newspaper} label={t('newsletters')} active={location.pathname.startsWith('/client/newsletters') || location.pathname.startsWith('/client/newsletter-builder')} />
              <NavItem to="/client/templates" icon={LayoutTemplate} label="Template Library" active={location.pathname === '/client/templates'} />
              <NavItem to="/client/generator" icon={Mail} label={t('writer')} active={location.pathname === '/client/generator'} />
              <NavItem to="/client/social" icon={Share2} label={t('social')} active={location.pathname === '/client/social'} />
              
              <NavSectionLabel children={t('sec_connections')} />
              <NavItem to="/client/contacts" icon={Users} label={t('contacts')} active={location.pathname === '/client/contacts'} />
              <NavItem to="/client/wifi-portal" icon={Wifi} label={t('wifi')} active={location.pathname === '/client/wifi-portal'} />
              
              <NavSectionLabel children={t('sec_oversight')} />
              <NavItem to="/client/history" icon={History} label={t('history')} active={location.pathname === '/client/history'} />
              <NavItem to="/client/support" icon={LifeBuoy} label={t('support')} active={location.pathname === '/client/support'} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 shrink-0">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-3">
              <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isAdmin ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-gray-900 dark:text-white truncate leading-tight">{user.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 truncate uppercase tracking-wider">{isAdmin ? 'Superuser' : (user.clientId || 'Client')}</p>
                  </div>
              </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={toggleTheme}
              className="flex-none p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-slate-600 transition-all active:scale-95"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link 
              to={isAdmin ? "/admin" : "/client/settings"} 
              className="flex-none p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-slate-600 transition-all active:scale-95"
            >
              <Settings size={18} />
            </Link>
            <button 
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95"
            >
              <LogOut size={14} />
              {t('exit')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Mobile/Tablet Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-slate-900 dark:bg-indigo-600' : 'bg-indigo-600'}`}>
                <ShieldCheck className="text-white" size={18} />
             </div>
             <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Qorvyn</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 active:scale-90 transition-all"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Mobile Drawer (Fixed to prevent scroll issues) */}
        <div 
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
           <div className={`absolute top-0 right-0 h-full w-72 md:w-80 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[10px]">Command Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                 {isAdmin ? (
                  <>
                    <NavItem to="/admin" icon={LayoutDashboard} label={t('system_overview')} active={location.pathname === '/admin'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/admin/clients" icon={Database} label={t('client_registry')} active={location.pathname === '/admin/clients'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/admin/billing" icon={CreditCard} label={t('billing_ops')} active={location.pathname === '/admin/billing'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/admin/support" icon={MessageSquare} label={t('helpdesk')} active={location.pathname === '/admin/support'} onClick={() => setIsMobileMenuOpen(false)} />
                  </>
                ) : (
                  <>
                    <NavItem to="/client" icon={LayoutDashboard} label={t('dashboard')} active={location.pathname === '/client'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/growth" icon={TrendingUp} label={t('growth')} active={location.pathname === '/client/growth'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/newsletters" icon={Newspaper} label={t('newsletters')} active={location.pathname.startsWith('/client/newsletters')} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/templates" icon={LayoutTemplate} label="Template Library" active={location.pathname === '/client/templates'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/generator" icon={Mail} label={t('writer')} active={location.pathname === '/client/generator'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/social" icon={Share2} label={t('social')} active={location.pathname === '/client/social'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/contacts" icon={Users} label={t('contacts')} active={location.pathname === '/client/contacts'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/wifi-portal" icon={Wifi} label={t('wifi')} active={location.pathname === '/client/wifi-portal'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/settings" icon={Settings} label={t('settings')} active={location.pathname === '/client/settings'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/client/support" icon={LifeBuoy} label={t('support')} active={location.pathname === '/client/support'} onClick={() => setIsMobileMenuOpen(false)} />
                  </>
                )}
              </nav>
              <div className="p-4 bg-gray-50 dark:bg-slate-950/50 border-t border-gray-100 dark:border-slate-800">
                  <button 
                  onClick={logout}
                  className="w-full py-3 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm"
                >
                  {t('exit')}
                </button>
              </div>
           </div>
        </div>

        <main className="flex-1 p-4 md:p-8 lg:p-12">
          {children}
        </main>

        {!isAdmin && clientPlan === 'enterprise' && <LiveAssistant />}
      </div>
    </div>
  );
};
