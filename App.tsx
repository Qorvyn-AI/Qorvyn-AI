
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

// --- LAZY LOADED COMPONENTS ---
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const PortalPage = lazy(() => import('./pages/portal/PortalPage').then(module => ({ default: module.PortalPage })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminClients = lazy(() => import('./pages/admin/AdminClients').then(module => ({ default: module.AdminClients })));
const AdminBilling = lazy(() => import('./pages/admin/AdminBilling').then(module => ({ default: module.AdminBilling })));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport').then(module => ({ default: module.AdminSupport })));

// Client Pages
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard').then(module => ({ default: module.ClientDashboard })));
const EmailGenerator = lazy(() => import('./pages/client/EmailGenerator').then(module => ({ default: module.EmailGenerator })));
const SocialCreator = lazy(() => import('./pages/client/SocialCreator').then(module => ({ default: module.SocialCreator })));
const Contacts = lazy(() => import('./pages/client/Contacts').then(module => ({ default: module.Contacts })));
const Newsletters = lazy(() => import('./pages/client/Newsletters').then(module => ({ default: module.Newsletters })));
const NewsletterBuilder = lazy(() => import('./pages/client/NewsletterBuilder').then(module => ({ default: module.NewsletterBuilder })));
const TemplateLibrary = lazy(() => import('./pages/client/TemplateLibrary').then(module => ({ default: module.TemplateLibrary })));
const Settings = lazy(() => import('./pages/client/Settings').then(module => ({ default: module.Settings })));
const GrowthStrategy = lazy(() => import('./pages/client/GrowthStrategy').then(module => ({ default: module.GrowthStrategy })));
const WifiPortalBuilder = lazy(() => import('./pages/client/WifiPortalBuilder').then(module => ({ default: module.WifiPortalBuilder })));
const Support = lazy(() => import('./pages/client/Support').then(module => ({ default: module.Support })));

const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-indigo-600">
    <Loader2 size={48} className="animate-spin mb-4" />
    <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Initializing Qorvyn Architecture...</p>
  </div>
);

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'client';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/client'} /> : <Login />} />
        <Route path="/portal/:clientId" element={<PortalPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute role="admin"><Layout><AdminDashboard /></Layout></PrivateRoute>} />
        <Route path="/admin/clients" element={<PrivateRoute role="admin"><Layout><AdminClients /></Layout></PrivateRoute>} />
        <Route path="/admin/billing" element={<PrivateRoute role="admin"><Layout><AdminBilling /></Layout></PrivateRoute>} />
        <Route path="/admin/support" element={<PrivateRoute role="admin"><Layout><AdminSupport /></Layout></PrivateRoute>} />
        
        {/* Client Routes */}
        <Route path="/client" element={<PrivateRoute role="client"><Layout><ClientDashboard /></Layout></PrivateRoute>} />
        <Route path="/client/growth" element={<PrivateRoute role="client"><Layout><GrowthStrategy /></Layout></PrivateRoute>} />
        <Route path="/client/newsletters" element={<PrivateRoute role="client"><Layout><Newsletters /></Layout></PrivateRoute>} />
        <Route path="/client/newsletter-builder" element={<PrivateRoute role="client"><Layout><NewsletterBuilder /></Layout></PrivateRoute>} />
        <Route path="/client/templates" element={<PrivateRoute role="client"><Layout><TemplateLibrary /></Layout></PrivateRoute>} />
        <Route path="/client/generator" element={<PrivateRoute role="client"><Layout><EmailGenerator /></Layout></PrivateRoute>} />
        <Route path="/client/social" element={<PrivateRoute role="client"><Layout><SocialCreator /></Layout></PrivateRoute>} />
        <Route path="/client/contacts" element={<PrivateRoute role="client"><Layout><Contacts /></Layout></PrivateRoute>} />
        <Route path="/client/wifi-portal" element={<PrivateRoute role="client"><Layout><WifiPortalBuilder /></Layout></PrivateRoute>} />
        <Route path="/client/settings" element={<PrivateRoute role="client"><Layout><Settings /></Layout></PrivateRoute>} />
        <Route path="/client/history" element={<PrivateRoute role="client"><Layout><ClientDashboard /></Layout></PrivateRoute>} />
        <Route path="/client/support" element={<PrivateRoute role="client"><Layout><Support /></Layout></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
