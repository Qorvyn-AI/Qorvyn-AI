
import React from 'react';

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string;
  password?: string;
  settings?: {
    seenTutorial?: boolean;
    [key: string]: any;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface StrategyItem {
  id: string;
  title: string;
  description: string; // "Big paragraph"
  rationale?: string; // "Review of what it says" (per item)
  category: 'Trend' | 'Marketing' | 'Operations' | 'Product' | 'Experience';
  impact: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  notes?: string;
  sourceUrl?: string; // From Google Grounding
  isEmailOpportunity?: boolean; // New: determines if this strategy can be turned into an email
  emailPrompt?: string; // New: the specific instruction to send to the EmailGenerator
  chatHistory?: { role: 'user' | 'model'; text: string }[]; // New: Persist chat memory
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  website?: string; // New: Website URL for brand analysis
  businessDescription?: string; // New field for AI Context
  status: 'active' | 'disabled';
  plan: 'basic' | 'pro' | 'enterprise';
  contactCount: number;
  aiUsageCount: number;
  lastLogin: string;
  nextBillingDate: string;
  lastPaymentStatus: 'paid' | 'overdue' | 'pending';
  // Admin / IT Support Fields
  phone?: string;
  address?: string;
  paymentMethod?: string;
  // End Admin Fields
  wifiPortalConfig?: WiFiPortalConfig;
  growthChecklist?: StrategyItem[]; // New field for saved strategies
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    autoSave?: boolean;
    preferredLanguage?: string;
    uiLanguage?: string;
    googleIntegration?: {
        connected: boolean;
        email?: string;
        connectedAt?: string;
        scope?: string[];
    };
  };
  activityHistory?: ActivityLog[];
}

export interface WiFiPortalConfig {
  headline: string;
  subheadline: string;
  buttonText: string;
  backgroundColor: string;
  accentColor: string;
  requirePhone: boolean;
  termsText: string;
  backgroundImage?: string;
  logoImage?: string;
}

export interface Contact {
  id: string;
  clientId: string;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  brevoId: string;
  source: 'brevo' | 'manual' | 'wifi_portal' | 'shopify';
  createdAt: string;
  // Added missing fields for AI analysis and segmentation
  engagementScore?: number;
  location?: string;
  jobTitle?: string;
  totalSpent?: number;
  lastActive?: string;
}

export interface EmailCampaign {
  id: string;
  clientId: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  deliveryStatus?: 'pending' | 'success' | 'failed';
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
  prompt?: string;
  type: 'newsletter' | 'email';
  // Added missing openRate field for campaign optimization
  openRate?: number;
  clickRate?: number;
  // Added AI scoring fields
  score?: number;
  insight?: string;
  triggerUsed?: string;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  subject: string; 
  status: 'open' | 'resolved';
  createdAt: string;
  lastUpdatedAt: string;
  messages: SupportMessage[];
  // Legacy fields kept for migration type safety
  message?: string;
  reply?: string;
  repliedAt?: string;
}

// @ts-ignore
declare module 'react-router-dom' {
  export type To = string | { pathname?: string; search?: string; hash?: string; state?: any };
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: To;
    replace?: boolean;
    state?: any;
    className?: string;
  }
  export interface RouteProps {
    path?: string;
    element?: React.ReactNode;
    index?: boolean;
    children?: React.ReactNode;
  }
  export interface NavigateProps {
    to: To;
    replace?: boolean;
    state?: any;
  }
  export function useNavigate(): (to: To, options?: { replace?: boolean; state?: any }) => void;
  export function useLocation(): {
    pathname: string;
    search: string;
    hash: string;
    state: any;
    key: string;
  };
  export function useParams<K extends string = string>(): Readonly<Record<K, string | undefined>>;
  export function useSearchParams(defaultInit?: any): [URLSearchParams, (nextInit?: any, navigateOpts?: any) => void];
  export function Link(props: LinkProps): React.ReactElement;
  export function Route(props: RouteProps): React.ReactElement;
  export function Routes(props: { children: React.ReactNode }): React.ReactElement;
  export function HashRouter(props: { children: React.ReactNode }): React.ReactElement;
  export function Navigate(props: NavigateProps): React.ReactElement;
}
