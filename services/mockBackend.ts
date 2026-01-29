import { User, Client, Contact, EmailCampaign, WiFiPortalConfig } from '../types';

// Initial Seed Data
const SEED_CLIENTS: Client[] = [
  { 
    id: 'c1', 
    name: 'Acme Corp', 
    status: 'active', 
    plan: 'pro', 
    contactCount: 150, 
    aiUsageCount: 45, 
    lastLogin: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    lastPaymentStatus: 'paid',
    wifiPortalConfig: {
      headline: "Welcome to Acme Wi-Fi",
      subheadline: "Sign in to get connected",
      buttonText: "Connect to Internet",
      backgroundColor: "#ffffff",
      accentColor: "#4f46e5",
      requirePhone: false,
      termsText: "I accept the Terms of Service and Privacy Policy."
    }
  },
  { 
    id: 'c2', 
    name: 'Bakery Delights', 
    status: 'active', 
    plan: 'basic', 
    contactCount: 45, 
    aiUsageCount: 12, 
    lastLogin: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    lastPaymentStatus: 'paid'
  },
  { 
    id: 'c3', 
    name: 'TechStart Inc', 
    status: 'disabled', 
    plan: 'enterprise', 
    contactCount: 1200, 
    aiUsageCount: 0, 
    lastLogin: new Date(Date.now() - 86400000 * 10).toISOString(),
    nextBillingDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    lastPaymentStatus: 'overdue'
  },
];

const SEED_USERS: User[] = [
  { id: 'u1', email: 'admin@qorvyn.com', name: 'Super Admin', role: 'admin', password: 'password' },
  { id: 'u2', email: 'user@acme.com', name: 'John Doe', role: 'client', clientId: 'c1', password: 'password' },
  { id: 'u3', email: 'baker@delights.com', name: 'Sarah Baker', role: 'client', clientId: 'c2', password: 'password' },
];

const SEED_CONTACTS: Contact[] = [
  { id: 'ct1', clientId: 'c1', email: 'cust1@gmail.com', name: 'Alice Smith', brevoId: 'b_1', source: 'brevo', engagementScore: 85, lastActive: new Date().toISOString(), location: 'New York, USA', jobTitle: 'Marketing Manager' },
  { id: 'ct2', clientId: 'c1', email: 'cust2@yahoo.com', name: 'Bob Jones', brevoId: 'b_2', source: 'brevo', engagementScore: 30, lastActive: new Date(Date.now() - 86400000 * 45).toISOString(), location: 'London, UK', jobTitle: 'Developer' },
  { id: 'ct3', clientId: 'c2', email: 'eater1@gmail.com', name: 'Charlie Day', brevoId: 'b_3', source: 'brevo', engagementScore: 60, lastActive: new Date(Date.now() - 86400000 * 5).toISOString(), location: 'Austin, TX', jobTitle: 'Food Critic' },
];

const SEED_EMAILS: EmailCampaign[] = [
  { 
    id: 'e1', 
    clientId: 'c1', 
    subject: 'Weekend Sale! 20% Off Everything', 
    content: 'Get 20% off...', 
    status: 'sent', 
    deliveryStatus: 'success',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), 
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'newsletter',
    openRate: 45.2,
    clickRate: 12.5
  },
  { 
    id: 'e2', 
    clientId: 'c1', 
    subject: 'Introducing Our New Product Line', 
    content: 'Introducing...', 
    status: 'sent', 
    deliveryStatus: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(), 
    sentAt: new Date().toISOString(),
    type: 'newsletter',
    openRate: 28.4,
    clickRate: 5.1
  },
  { 
    id: 'e3', 
    clientId: 'c1', 
    subject: 'Monthly Newsletter: Industry Insights', 
    content: 'Here is what happened...', 
    status: 'sent', 
    deliveryStatus: 'failed',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), 
    sentAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    type: 'newsletter',
    openRate: 15.0,
    clickRate: 1.2
  },
];

// LocalStorage Keys
const KEYS = {
  USERS: 'qorvyn_users',
  CLIENTS: 'qorvyn_clients',
  CONTACTS: 'qorvyn_contacts',
  EMAILS: 'qorvyn_emails',
};

// Helper to initialize DB
const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
  if (!localStorage.getItem(KEYS.CLIENTS)) localStorage.setItem(KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS));
  if (!localStorage.getItem(KEYS.CONTACTS)) localStorage.setItem(KEYS.CONTACTS, JSON.stringify(SEED_CONTACTS));
  if (!localStorage.getItem(KEYS.EMAILS)) localStorage.setItem(KEYS.EMAILS, JSON.stringify(SEED_EMAILS));
};

initDB();

// --- Data Access Layer ---

export const MockBackend = {
  // Auth
  login: async (email: string, password?: string): Promise<User | null> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800)); 
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    // Simple match
    return users.find(u => u.email === email && (!password || u.password === password)) || null;
  },

  register: async (name: string, email: string, businessName: string, password: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 1000));
    
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    if (users.find(u => u.email === email)) {
      throw new Error("User already exists");
    }

    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    
    // 1. Create Client (Business)
    const newClientId = `c_${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name: businessName,
      status: 'active',
      plan: 'basic',
      contactCount: 0,
      aiUsageCount: 0,
      lastLogin: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastPaymentStatus: 'pending',
      wifiPortalConfig: {
        headline: `Welcome to ${businessName}`,
        subheadline: "Sign in for free high-speed internet",
        buttonText: "Connect Now",
        backgroundColor: "#ffffff",
        accentColor: "#4f46e5",
        requirePhone: false,
        termsText: "I agree to the Terms of Service."
      }
    };

    // 2. Create User
    const newUser: User = {
      id: `u_${Date.now()}`,
      email,
      name,
      role: 'client',
      clientId: newClientId,
      password: password
    };

    // Save
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify([...clients, newClient]));
    localStorage.setItem(KEYS.USERS, JSON.stringify([...users, newUser]));

    return newUser;
  },

  // Admin: Get all clients
  getClients: async (): Promise<Client[]> => {
    return JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
  },

  // Admin: Create Client
  createClient: async (name: string, plan: 'basic' | 'pro' | 'enterprise', email: string): Promise<Client> => {
    await new Promise(r => setTimeout(r, 800)); // Simulate delay
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');

    const newClientId = `c_${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name,
      status: 'active',
      plan,
      contactCount: 0,
      aiUsageCount: 0,
      lastLogin: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastPaymentStatus: 'pending',
      wifiPortalConfig: {
        headline: `Welcome to ${name}`,
        subheadline: "Sign in for free high-speed internet",
        buttonText: "Connect Now",
        backgroundColor: "#ffffff",
        accentColor: "#4f46e5",
        requirePhone: false,
        termsText: "I agree to the Terms of Service."
      }
    };

    const newUser: User = {
      id: `u_${Date.now()}`,
      email,
      name: `Admin ${name}`,
      role: 'client',
      clientId: newClientId,
      password: 'password' // Default password for admin created accounts
    };

    localStorage.setItem(KEYS.CLIENTS, JSON.stringify([...clients, newClient]));
    localStorage.setItem(KEYS.USERS, JSON.stringify([...users, newUser]));

    return newClient;
  },

  // Admin: Toggle client status
  toggleClientStatus: async (clientId: string): Promise<void> => {
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const updated = clients.map(c => c.id === clientId ? { ...c, status: c.status === 'active' ? 'disabled' : 'active' as any } : c);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updated));
  },

  // Admin: Update Client Plan
  updateClientPlan: async (clientId: string, newPlan: 'basic' | 'pro' | 'enterprise'): Promise<void> => {
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const updated = clients.map(c => c.id === clientId ? { ...c, plan: newPlan } : c);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updated));
  },

  // Admin: Update Client Details (Name, etc.)
  updateClient: async (clientId: string, updates: Partial<Client>): Promise<void> => {
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const updated = clients.map(c => c.id === clientId ? { ...c, ...updates } : c);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updated));
  },

  // Admin: Delete Client
  deleteClient: async (clientId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 500));
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const newClients = clients.filter(c => c.id !== clientId);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(newClients));

    // Cleanup users
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const newUsers = users.filter(u => u.clientId !== clientId);
    localStorage.setItem(KEYS.USERS, JSON.stringify(newUsers));
  },

  // Client: Get own data
  getClientById: async (clientId: string): Promise<Client | undefined> => {
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    return clients.find(c => c.id === clientId);
  },

  // WIFI PORTAL METHODS
  getWifiSettings: async (clientId: string): Promise<WiFiPortalConfig | undefined> => {
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const client = clients.find(c => c.id === clientId);
    return client?.wifiPortalConfig;
  },

  updateWifiSettings: async (clientId: string, config: WiFiPortalConfig): Promise<void> => {
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const updatedClients = clients.map(c => c.id === clientId ? { ...c, wifiPortalConfig: config } : c);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updatedClients));
  },

  getContacts: async (clientId: string): Promise<Contact[]> => {
    const contacts: Contact[] = JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]');
    return contacts.filter(c => c.clientId === clientId);
  },

  // Client: Add manual contact (Updated to support phone and source)
  addContact: async (clientId: string, name: string, email: string, phone?: string, source: 'manual' | 'wifi_portal' = 'manual'): Promise<Contact> => {
    await new Promise(r => setTimeout(r, 500));
    const contacts: Contact[] = JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]');
    
    // Check if exists
    const existing = contacts.find(c => c.email.toLowerCase() === email.toLowerCase() && c.clientId === clientId);
    if (existing) {
        // Update existing contact lastActive
        const updatedContacts = contacts.map(c => 
            c.id === existing.id ? { ...c, lastActive: new Date().toISOString(), phone: phone || c.phone } : c
        );
        localStorage.setItem(KEYS.CONTACTS, JSON.stringify(updatedContacts));
        return existing;
    }

    const newContact: Contact = {
      id: `ct_${Date.now()}`,
      clientId,
      email,
      name,
      phone,
      brevoId: `local_${Date.now()}`,
      source,
      engagementScore: 50, // Default start score
      lastActive: new Date().toISOString(),
      location: 'Unknown',
      jobTitle: 'Unknown'
    };

    localStorage.setItem(KEYS.CONTACTS, JSON.stringify([...contacts, newContact]));
    
    // Update client count
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const updatedClients = clients.map(c => c.id === clientId ? {...c, contactCount: c.contactCount + 1} : c);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updatedClients));

    return newContact;
  },

  // Simulate Brevo Sync
  syncBrevoContacts: async (clientId: string, apiKey?: string): Promise<number> => {
    await new Promise(r => setTimeout(r, 1500)); // Longer delay for "API call"
    
    if (apiKey && apiKey.length < 10) {
        throw new Error("Invalid API Key format");
    }

    const locations = ['New York, USA', 'London, UK', 'Toronto, CA', 'Berlin, DE', 'San Francisco, USA'];
    const jobs = ['CEO', 'Manager', 'Developer', 'Designer', 'Consultant'];

    const newContacts: Contact[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `new_${Date.now()}_${i}`,
      clientId,
      email: `brevo_user_${Math.floor(Math.random() * 1000)}@example.com`,
      name: `Brevo Customer ${Math.floor(Math.random() * 100)}`,
      brevoId: `brevo_${Date.now()}_${i}`,
      source: 'brevo',
      engagementScore: Math.floor(Math.random() * 100),
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)],
      jobTitle: jobs[Math.floor(Math.random() * jobs.length)]
    }));
    
    const contacts: Contact[] = JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]');
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify([...contacts, ...newContacts]));
    
    // Update client count
    const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
    const updatedClients = clients.map(c => c.id === clientId ? {...c, contactCount: c.contactCount + 5} : c);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updatedClients));

    return 5;
  },

  getEmails: async (clientId: string): Promise<EmailCampaign[]> => {
    const emails: EmailCampaign[] = JSON.parse(localStorage.getItem(KEYS.EMAILS) || '[]');
    
    // Simulate background job: Check for scheduled emails that should be sent
    const now = new Date();
    let hasUpdates = false;
    const updatedEmails = emails.map(email => {
        if (email.status === 'scheduled' && email.scheduledAt && new Date(email.scheduledAt) <= now) {
            hasUpdates = true;
            return { 
                ...email, 
                status: 'sent' as const, 
                deliveryStatus: 'success' as const,
                sentAt: email.scheduledAt,
                // Simulate stats generation on send
                openRate: parseFloat((Math.random() * 60).toFixed(1)),
                clickRate: parseFloat((Math.random() * 20).toFixed(1))
            };
        }
        return email;
    });

    if (hasUpdates) {
        localStorage.setItem(KEYS.EMAILS, JSON.stringify(updatedEmails));
    }

    return updatedEmails.filter(e => e.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  saveEmail: async (email: Omit<EmailCampaign, 'id' | 'createdAt'>): Promise<EmailCampaign> => {
    const emails: EmailCampaign[] = JSON.parse(localStorage.getItem(KEYS.EMAILS) || '[]');
    const isSent = email.status === 'sent';
    const newEmail: EmailCampaign = {
      ...email,
      id: `e_${Date.now()}`,
      createdAt: new Date().toISOString(),
      // Simulate stats if sent immediately
      openRate: isSent ? parseFloat((Math.random() * 60).toFixed(1)) : undefined,
      clickRate: isSent ? parseFloat((Math.random() * 20).toFixed(1)) : undefined
    };
    localStorage.setItem(KEYS.EMAILS, JSON.stringify([...emails, newEmail]));

    // Update AI usage if it was generated
    if (email.prompt) {
        const clients: Client[] = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
        const updatedClients = clients.map(c => c.id === email.clientId ? {...c, aiUsageCount: c.aiUsageCount + 1} : c);
        localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updatedClients));
    }

    return newEmail;
  },

  updateEmail: async (email: Partial<EmailCampaign> & { id: string }): Promise<EmailCampaign> => {
    const emails: EmailCampaign[] = JSON.parse(localStorage.getItem(KEYS.EMAILS) || '[]');
    const index = emails.findIndex(e => e.id === email.id);
    
    if (index === -1) {
       throw new Error("Email not found");
    }

    const isNowSent = email.status === 'sent' && emails[index].status !== 'sent';
    const updatedEmail = { 
        ...emails[index], 
        ...email,
        // Add stats if status changed to sent
        openRate: isNowSent ? parseFloat((Math.random() * 60).toFixed(1)) : emails[index].openRate,
        clickRate: isNowSent ? parseFloat((Math.random() * 20).toFixed(1)) : emails[index].clickRate
    };
    emails[index] = updatedEmail;
    localStorage.setItem(KEYS.EMAILS, JSON.stringify(emails));

    return updatedEmail;
  }
};