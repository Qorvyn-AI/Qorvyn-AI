import React from 'react';
import { useAuth } from '../context/AuthContext';
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
  Wifi
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { LiveAssistant } from './LiveAssistant';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user) return <>{children}</>;

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-slate-800' : 'bg-primary'}`}>
              <ShieldCheck className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Qorvyn</h1>
          </div>
          <span className="text-xs font-medium text-gray-500 mt-1 block px-1 uppercase tracking-wider">
            {isAdmin ? 'Admin Portal' : 'Client Portal'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {isAdmin ? (
            <>
              <NavItem to="/admin" icon={LayoutDashboard} label="Overview" active={location.pathname === '/admin'} />
              <NavItem to="/admin/clients" icon={Users} label="Clients" active={location.pathname === '/admin/clients'} />
            </>
          ) : (
            <>
              <NavItem to="/client" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/client'} />
              <NavItem to="/client/growth" icon={TrendingUp} label="Growth Strategy" active={location.pathname === '/client/growth'} />
              <NavItem to="/client/newsletters" icon={Newspaper} label="Newsletters" active={location.pathname.startsWith('/client/newsletters') || location.pathname.startsWith('/client/newsletter-builder')} />
              <NavItem to="/client/generator" icon={Mail} label="Email Writer" active={location.pathname === '/client/generator'} />
              <NavItem to="/client/contacts" icon={Users} label="Contacts (Brevo)" active={location.pathname === '/client/contacts'} />
              <NavItem to="/client/wifi-portal" icon={Wifi} label="Wi-Fi Portal" active={location.pathname === '/client/wifi-portal'} />
              <NavItem to="/client/history" icon={History} label="History" active={location.pathname === '/client/history'} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2 px-2 py-3 mb-2 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-600">
                {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
            </div>
            <Link 
                to={isAdmin ? "/admin" : "/client/settings"} 
                className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                title="Account Settings"
            >
                <Settings size={18} />
            </Link>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-slate-800' : 'bg-primary'}`}>
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="font-bold text-gray-900">Qorvyn</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-50 bg-white flex flex-col">
            <div className="p-4 flex justify-end">
              <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
            </div>
            <nav className="p-4 space-y-2 flex-1">
               {isAdmin ? (
                <>
                  <NavItem to="/admin" icon={LayoutDashboard} label="Overview" active={location.pathname === '/admin'} />
                  <NavItem to="/admin/clients" icon={Users} label="Clients" active={location.pathname === '/admin/clients'} />
                </>
              ) : (
                <>
                  <NavItem to="/client" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/client'} />
                  <NavItem to="/client/growth" icon={TrendingUp} label="Growth Strategy" active={location.pathname === '/client/growth'} />
                  <NavItem to="/client/newsletters" icon={Newspaper} label="Newsletters" active={location.pathname.startsWith('/client/newsletters')} />
                  <NavItem to="/client/generator" icon={Mail} label="Email Writer" active={location.pathname === '/client/generator'} />
                  <NavItem to="/client/contacts" icon={Users} label="Contacts (Brevo)" active={location.pathname === '/client/contacts'} />
                  <NavItem to="/client/wifi-portal" icon={Wifi} label="Wi-Fi Portal" active={location.pathname === '/client/wifi-portal'} />
                  <NavItem to="/client/history" icon={History} label="History" active={location.pathname === '/client/history'} />
                </>
              )}
            </nav>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
               <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                      {user.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                  </div>
                   <Link 
                      to={isAdmin ? "/admin" : "/client/settings"} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-500 bg-white p-2 rounded-lg border border-gray-200"
                    >
                      <Settings size={20} />
                  </Link>
               </div>
               <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>

        {/* Voice Assistant - Only available for Client role */}
        {!isAdmin && <LiveAssistant />}
      </div>
    </div>
  );
};