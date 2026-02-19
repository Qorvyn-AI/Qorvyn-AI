
export interface BrevoContactAttribute {
  FIRSTNAME?: string;
  LASTNAME?: string;
  SMS?: string;
  PHONE?: string;
  CITY?: string;
  [key: string]: any;
}

export interface BrevoContact {
  id: number;
  email: string;
  emailBlacklisted: boolean;
  smsBlacklisted: boolean;
  createdAt: string;
  modifiedAt: string;
  attributes: BrevoContactAttribute;
}

export const BrevoService = {
  getContacts: async (apiKey: string): Promise<BrevoContact[]> => {
    try {
      const response = await fetch('https://api.brevo.com/v3/contacts?limit=50&offset=0', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.contacts || [];
    } catch (error) {
      console.error("Brevo Fetch Error:", error);
      throw error;
    }
  },

  mapToAppContact: (brevoContact: BrevoContact): any => {
    const attrs = brevoContact.attributes || {};
    return {
      email: brevoContact.email,
      name: attrs.FIRSTNAME || attrs.NAME || '',
      surname: attrs.LASTNAME || attrs.SURNAME || '',
      phone: attrs.SMS || attrs.PHONE || '',
      city: attrs.CITY || '',
      brevoId: brevoContact.id.toString(),
      source: 'brevo',
      createdAt: brevoContact.createdAt
    };
  }
};
