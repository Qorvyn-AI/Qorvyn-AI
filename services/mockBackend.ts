import { User, Client, Contact, EmailCampaign, WiFiPortalConfig, StrategyItem, SupportTicket } from '../types';

const KEYS = {
  USERS: 'qorvyn_users',
  CLIENTS: 'qorvyn_clients',
  CONTACTS: 'qorvyn_contacts',
  EMAILS: 'qorvyn_emails',
  SUPPORT: 'qorvyn_support'
};

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed initial data if empty
const seedData = () => {
    // Check if we need to seed
    if (!localStorage.getItem(KEYS.USERS)) {
        // Create Admin User
        const adminUser: User = {
            id: 'u_admin',
            email: 'admin@qorvyn.com',
            name: 'System Admin',
            role: 'admin',
            password: 'password'
        };
        
        // Create Client Users & Clients
        const client1: Client = {
            id: 'c_acme',
            name: 'Acme Corp',
            industry: 'SaaS',
            status: 'active',
            plan: 'pro',
            contactCount: 1250,
            aiUsageCount: 45,
            lastLogin: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 86400000 * 15).toISOString(),
            lastPaymentStatus: 'paid',
            wifiPortalConfig: {
                headline: 'Welcome to Acme HQ',
                subheadline: 'Secure Guest Network',
                buttonText: 'Connect Now',
                backgroundColor: '#ffffff',
                accentColor: '#4f46e5',
                requirePhone: false,
                termsText: 'By connecting, you agree to our Acceptable Use Policy.'
            }
        };
        const user1: User = {
            id: 'u_jane',
            email: 'jane@acme.com',
            name: 'Jane Doe',
            role: 'client',
            clientId: 'c_acme',
            password: 'password'
        };

        const client2: Client = {
            id: 'c_urban',
            name: 'Urban Vogue',
            industry: 'Retail',
            status: 'active',
            plan: 'basic',
            contactCount: 300,
            aiUsageCount: 12,
            lastLogin: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            lastPaymentStatus: 'paid'
        };
        const user2: User = {
            id: 'u_sarah',
            email: 'sarah@urbanvogue.com',
            name: 'Sarah Smith',
            role: 'client',
            clientId: 'c_urban',
            password: 'password'
        };

        const client3: Client = {
            id: 'c_iron',
            name: 'Iron Pulse Gym',
            industry: 'Fitness',
            status: 'active',
            plan: 'enterprise',
            contactCount: 2100,
            aiUsageCount: 112,
            lastLogin: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 86400000 * 25).toISOString(),
            lastPaymentStatus: 'paid'
        };
        const user3: User = {
            id: 'u_mike',
            email: 'mike@ironpulse.com',
            name: 'Mike Strong',
            role: 'client',
            clientId: 'c_iron',
            password: 'password'
        };

        const client4: Client = {
            id: 'c_skyline',
            name: 'Skyline Architects',
            industry: 'Real Estate',
            status: 'active',
            plan: 'pro',
            contactCount: 850,
            aiUsageCount: 22,
            lastLogin: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            lastPaymentStatus: 'paid'
        };
        const user4: User = {
            id: 'u_david',
            email: 'david@skyline.com',
            name: 'David Sky',
            role: 'client',
            clientId: 'c_skyline',
            password: 'password'
        };

        const client5: Client = {
            id: 'c_lumina',
            name: 'Lumina Bistro',
            industry: 'Restaurant & Food',
            status: 'active',
            plan: 'basic',
            contactCount: 450,
            aiUsageCount: 5,
            lastLogin: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() - 86400000 * 1).toISOString(),
            lastPaymentStatus: 'pending'
        };
        const user5: User = {
            id: 'u_chef',
            email: 'chef@lumina.com',
            name: 'Head Chef',
            role: 'client',
            clientId: 'c_lumina',
            password: 'password'
        };

        setToStorage(KEYS.USERS, [adminUser, user1, user2, user3, user4, user5]);
        setToStorage(KEYS.CLIENTS, [client1, client2, client3, client4, client5]);
    }
};

seedData();

export const MockBackend = {
  // Auth
  login: async (email: string, password?: string): Promise<User | null> => {
    const users = getFromStorage<User[]>(KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        // In a real app, verify password hash. Here just mock check if provided.
        if (password && user.password && password !== user.password) return null;
        return user;
    }
    return null;
  },
  
  loginWithGoogle: async (): Promise<User | null> => {
      // Simulate Google Login success for demo
      // In a real app, this would verify token
      const users = getFromStorage<User[]>(KEYS.USERS, []);
      // Just return the first client user found or create a dummy one
      const existing = users.find(u => u.email === 'jane@acme.com');
      return existing || null;
  },

  register: async (name: string, email: string, businessName: string, password: string, plan: any, language: string, industry: string, description: string, website: string): Promise<User> => {
      const users = getFromStorage<User[]>(KEYS.USERS, []);
      if (users.find(u => u.email === email)) throw new Error("Email already exists");

      const clientId = `c_${Date.now()}`;
      const newClient: Client = {
          id: clientId,
          name: businessName,
          industry,
          website,
          businessDescription: description,
          status: 'active',
          plan,
          contactCount: 0,
          aiUsageCount: 0,
          lastLogin: new Date().toISOString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastPaymentStatus: 'paid',
          settings: {
              preferredLanguage: language,
              uiLanguage: 'English'
          }
      };

      const newUser: User = {
          id: `u_${Date.now()}`,
          email,
          name,
          role: 'client',
          clientId,
          password
      };

      const clients = getFromStorage<Client[]>(KEYS.CLIENTS, []);
      setToStorage(KEYS.CLIENTS, [...clients, newClient]);
      setToStorage(KEYS.USERS, [...users, newUser]);

      return newUser;
  },

  markTutorialSeen: async (userId: string) => {
      const users = getFromStorage<User[]>(KEYS.USERS, []);
      const updated = users.map(u => u.id === userId ? { ...u, settings: { ...u.settings, seenTutorial: true } } : u);
      setToStorage(KEYS.USERS, updated);
  },

  // Clients
  getClients: async (): Promise<Client[]> => getFromStorage<Client[]>(KEYS.CLIENTS, []),
  
  getClientById: async (id: string): Promise<Client | undefined> => {
      const clients = getFromStorage<Client[]>(KEYS.CLIENTS, []);
      return clients.find(c => c.id === id);
  },

  updateClient: async (clientId: string, data: Partial<Client>) => {
      const clients = getFromStorage<Client[]>(KEYS.CLIENTS, []);
      const updated = clients.map(c => c.id === clientId ? { ...c, ...data } : c);
      setToStorage(KEYS.CLIENTS, updated);
  },

  deleteClient: async (clientId: string) => {
      const clients = getFromStorage<Client[]>(KEYS.CLIENTS, []);
      setToStorage(KEYS.CLIENTS, clients.filter(c => c.id !== clientId));
      
      // Also delete associated users
      const users = getFromStorage<User[]>(KEYS.USERS, []);
      setToStorage(KEYS.USERS, users.filter(u => u.clientId !== clientId));
  },

  // Users
  getPrimaryUserForClient: async (clientId: string): Promise<User | undefined> => {
      const users = getFromStorage<User[]>(KEYS.USERS, []);
      return users.find(u => u.clientId === clientId); // Assuming first user is primary
  },

  adminUpdateUser: async (userId: string, data: Partial<User>) => {
      const users = getFromStorage<User[]>(KEYS.USERS, []);
      const updated = users.map(u => u.id === userId ? { ...u, ...data } : u);
      setToStorage(KEYS.USERS, updated);
  },

  // Contacts
  getContacts: async (clientId: string): Promise<Contact[]> => {
      const contacts = getFromStorage<Contact[]>(KEYS.CONTACTS, []);
      return contacts.filter(c => c.clientId === clientId);
  },

  addContact: async (clientId: string, contactData: Partial<Contact>) => {
      const contacts = getFromStorage<Contact[]>(KEYS.CONTACTS, []);
      const newContact = { 
          ...contactData, 
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
          clientId, 
          createdAt: new Date().toISOString(), 
          source: contactData.source || 'manual' 
      } as Contact;
      
      setToStorage(KEYS.CONTACTS, [...contacts, newContact]);
      
      // Update client contact count
      const clients = getFromStorage<Client[]>(KEYS.CLIENTS, []);
      const updatedClients = clients.map(c => c.id === clientId ? { ...c, contactCount: (c.contactCount || 0) + 1 } : c);
      setToStorage(KEYS.CLIENTS, updatedClients);

      return newContact;
  },

  deleteContact: async (clientId: string, contactId: string) => {
      const contacts = getFromStorage<Contact[]>(KEYS.CONTACTS, []);
      setToStorage(KEYS.CONTACTS, contacts.filter(c => c.id !== contactId));
      
      // Update client contact count
      const clients = getFromStorage<Client[]>(KEYS.CLIENTS, []);
      const updatedClients = clients.map(c => c.id === clientId ? { ...c, contactCount: Math.max(0, (c.contactCount || 0) - 1) } : c);
      setToStorage(KEYS.CLIENTS, updatedClients);
  },

  // Emails
  getEmails: async (clientId: string): Promise<EmailCampaign[]> => {
      const emails = getFromStorage<EmailCampaign[]>(KEYS.EMAILS, []);
      return emails.filter(e => e.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  saveEmail: async (emailData: Partial<EmailCampaign>) => {
      const emails = getFromStorage<EmailCampaign[]>(KEYS.EMAILS, []);
      const newEmail = { 
          ...emailData, 
          id: `em_${Date.now()}`, 
          createdAt: new Date().toISOString() 
      } as EmailCampaign;
      setToStorage(KEYS.EMAILS, [...emails, newEmail]);
      return newEmail;
  },

  updateEmail: async (emailData: EmailCampaign) => {
      const emails = getFromStorage<EmailCampaign[]>(KEYS.EMAILS, []);
      const updated = emails.map(e => e.id === emailData.id ? emailData : e);
      setToStorage(KEYS.EMAILS, updated);
  },

  // Wifi
  getWifiSettings: async (clientId: string): Promise<WiFiPortalConfig | undefined> => {
      const client = await MockBackend.getClientById(clientId);
      return client?.wifiPortalConfig;
  },

  updateWifiSettings: async (clientId: string, config: WiFiPortalConfig) => {
      await MockBackend.updateClient(clientId, { wifiPortalConfig: config });
  },

  // Strategies (Stored on Client for now)
  saveStrategy: async (clientId: string, strategy: StrategyItem) => {
      const client = await MockBackend.getClientById(clientId);
      if (client) {
          const currentStrategies = client.growthChecklist || [];
          // Check if update or new
          const exists = currentStrategies.find(s => s.id === strategy.id);
          let newStrategies;
          if (exists) {
              newStrategies = currentStrategies.map(s => s.id === strategy.id ? strategy : s);
          } else {
              newStrategies = [...currentStrategies, strategy];
          }
          await MockBackend.updateClient(clientId, { growthChecklist: newStrategies });
      }
  },

  removeStrategy: async (clientId: string, strategyId: string) => {
      const client = await MockBackend.getClientById(clientId);
      if (client && client.growthChecklist) {
          const newStrategies = client.growthChecklist.filter(s => s.id !== strategyId);
          await MockBackend.updateClient(clientId, { growthChecklist: newStrategies });
      }
  },

  toggleStrategyCompletion: async (clientId: string, strategyId: string) => {
      const client = await MockBackend.getClientById(clientId);
      if (client && client.growthChecklist) {
          const newStrategies = client.growthChecklist.map(s => s.id === strategyId ? { ...s, completed: !s.completed } : s);
          await MockBackend.updateClient(clientId, { growthChecklist: newStrategies });
      }
  },

  // Support
  getSupportTickets: async (clientId?: string): Promise<SupportTicket[]> => {
      const tickets = getFromStorage<SupportTicket[]>(KEYS.SUPPORT, []);
      if (clientId) {
          return tickets.filter(t => t.clientId === clientId);
      }
      return tickets;
  },

  sendSupportMessage: async (clientId: string, clientName: string, text: string, subject: string) => {
      const tickets = getFromStorage<SupportTicket[]>(KEYS.SUPPORT, []);
      // Create new ticket for each message in this simple mock, or find active open ticket
      // Let's create new if no subject provided, or assume new thread for simplicity in the UI context usually
      
      const newTicket: SupportTicket = {
          id: `tk_${Date.now()}`,
          clientId,
          clientName,
          subject,
          status: 'open',
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          messages: [{
              id: `msg_${Date.now()}`,
              sender: 'user',
              senderName: clientName,
              text,
              timestamp: new Date().toISOString()
          }]
      };
      
      setToStorage(KEYS.SUPPORT, [...tickets, newTicket]);
      return newTicket;
  },

  replyToTicket: async (ticketId: string, text: string, sender: 'user' | 'admin', senderName: string) => {
      const tickets = getFromStorage<SupportTicket[]>(KEYS.SUPPORT, []);
      const updated = tickets.map(t => {
          if (t.id === ticketId) {
              return {
                  ...t,
                  lastUpdatedAt: new Date().toISOString(),
                  messages: [...t.messages, {
                      id: `msg_${Date.now()}`,
                      sender,
                      senderName,
                      text,
                      timestamp: new Date().toISOString()
                  }]
              };
          }
          return t;
      });
      setToStorage(KEYS.SUPPORT, updated);
  },

  // Integrations
  connectGmail: async (clientId: string) => {
      // Mock connection
      await MockBackend.updateClient(clientId, { 
          settings: { googleIntegration: { connected: true, email: 'connected@gmail.com', connectedAt: new Date().toISOString() } } 
      } as any); // Type casting for nested partial update simulation (logic needs to handle full object in real app)
      
      // In real implementation we'd merge deeply. Here we'll re-fetch to update properly
      const client = await MockBackend.getClientById(clientId);
      if (client && client.settings) {
          const newSettings = { 
              ...client.settings, 
              googleIntegration: { connected: true, email: 'connected@gmail.com', connectedAt: new Date().toISOString() } 
          };
          await MockBackend.updateClient(clientId, { settings: newSettings });
      }
      return { email: 'connected@gmail.com' };
  },

  disconnectGmail: async (clientId: string) => {
      const client = await MockBackend.getClientById(clientId);
      if (client && client.settings) {
          const newSettings = { ...client.settings, googleIntegration: { connected: false } };
          await MockBackend.updateClient(clientId, { settings: newSettings });
      }
  }
};