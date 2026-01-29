
export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // If role is client, this links to their business data
  password?: string; // For mock auth
}

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'disabled';
  plan: 'basic' | 'pro' | 'enterprise';
  contactCount: number;
  aiUsageCount: number;
  lastLogin: string;
  nextBillingDate: string;
  lastPaymentStatus: 'paid' | 'overdue' | 'pending';
  wifiPortalConfig?: WiFiPortalConfig;
}

export interface WiFiPortalConfig {
  headline: string;
  subheadline: string;
  buttonText: string;
  backgroundColor: string;
  accentColor: string;
  requirePhone: boolean;
  termsText: string;
  backgroundImage?: string; // URL or base64
  logoImage?: string; // URL or base64
}

export interface Contact {
  id: string;
  clientId: string;
  email: string;
  name: string;
  phone?: string;
  brevoId: string; // Simulating external ID
  source: 'brevo' | 'manual' | 'wifi_portal';
  engagementScore: number; // 0-100 score based on opens/clicks
  lastActive?: string; // ISO date string
  location?: string;
  jobTitle?: string;
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
  openRate?: number;
  clickRate?: number;
}

export interface UsageMetric {
  date: string;
  emailsGenerated: number;
  emailsSent: number;
}