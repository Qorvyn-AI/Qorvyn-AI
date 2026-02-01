import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { EmailGenerator } from './pages/client/EmailGenerator';
import { Contacts } from './pages/client/Contacts';
import { Newsletters } from './pages/client/Newsletters';
import { NewsletterBuilder } from './pages/client/NewsletterBuilder';
import { Settings } from './pages/client/Settings';
import { GrowthStrategy } from './pages/client/GrowthStrategy';
import { WifiPortalBuilder } from './pages/client/WifiPortalBuilder';
import { PortalPage } from './pages/portal/PortalPage';

// Route Guards
interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'client';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    // Redirect to correct dashboard based on actual role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/client'} /> : <Login />} />
      
      {/* Public Captive Portal Route - No Auth Required */}
      <Route path="/portal/:clientId" element={<PortalPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute role="admin"><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin/clients" element={<PrivateRoute role="admin"><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      
      {/* Client Routes */}
      <Route path="/client" element={<PrivateRoute role="client"><Layout><ClientDashboard /></Layout></PrivateRoute>} />
      <Route path="/client/growth" element={<PrivateRoute role="client"><Layout><GrowthStrategy /></Layout></PrivateRoute>} />
      <Route path="/client/newsletters" element={<PrivateRoute role="client"><Layout><Newsletters /></Layout></PrivateRoute>} />
      <Route path="/client/newsletter-builder" element={<PrivateRoute role="client"><Layout><NewsletterBuilder /></Layout></PrivateRoute>} />
      <Route path="/client/generator" element={<PrivateRoute role="client"><Layout><EmailGenerator /></Layout></PrivateRoute>} />
      <Route path="/client/contacts" element={<PrivateRoute role="client"><Layout><Contacts /></Layout></PrivateRoute>} />
      <Route path="/client/wifi-portal" element={<PrivateRoute role="client"><Layout><WifiPortalBuilder /></Layout></PrivateRoute>} />
      <Route path="/client/settings" element={<PrivateRoute role="client"><Layout><Settings /></Layout></PrivateRoute>} />
      <Route path="/client/history" element={<PrivateRoute role="client"><Layout><ClientDashboard /></Layout></PrivateRoute>} />

      {/* Catch all - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;