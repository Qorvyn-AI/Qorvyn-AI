import { GoogleGenAI, Type } from "@google/genai";
import { Contact } from "../types";

export interface GeneratedEmail {
  subject: string;
  body: string;
  subjectSuggestions?: string[];
}

export interface SocialPosts {
  linkedin: string;
  twitter: string;
  facebook: string;
}

export interface SegmentSuggestion {
  name: string;
  description: string;
  criteria: string;
  marketing_angle: string;
}

export interface GrowthReport {
  content: string;
  sources: { title: string; uri: string }[];
}

export interface ImageInput {
  data: string;
  mimeType: string;
}

export interface PastCampaignData {
  subject: string;
  content: string;
  openRate: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  generateEmail: async (
    instruction: string, 
    businessName: string, 
    images: ImageInput[] = [],
    pastCampaigns: PastCampaignData[] = []
  ): Promise<GeneratedEmail> => {
    try {
      // Prepare content parts
      const parts: any[] = [];
      
      // Add images first (multimodal input)
      images.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType, 
            data: img.data
          }
        });
      });

      // Add text prompt
      let promptText = `You are an expert email marketing copywriter for a business named "${businessName}". 
        Write a professional, engaging marketing email based on the following instruction: "${instruction}".
        The tone should be persuasive but polite.`;

      if (images.length > 0) {
        promptText += `
        \nI have provided ${images.length} images to include in this email.
        CRITICAL INSTRUCTION:
        1. Analyze the content of each image to write relevant copy around it.
        2. You MUST include these images in your HTML output using specific placeholders.
        3. Use the placeholder "{{IMAGE_0}}" for the first image, "{{IMAGE_1}}" for the second, and so on.
        4. Place the <img> tags where they make the most sense contextually (e.g., after a paragraph describing the item in the image).
        5. Use standard HTML structure (e.g., <img src="{{IMAGE_0}}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" />).
        `;
      }

      if (pastCampaigns.length > 0) {
        promptText += `\n\n### HISTORICAL PERFORMANCE DATA
        Use the following data from our top-performing past campaigns to guide your writing style and subject line generation.
        
        Top Campaigns (Subject & Open Rate):
        ${JSON.stringify(pastCampaigns.map(c => ({ subject: c.subject, openRate: `${c.openRate}%`, snippet: c.content.substring(0, 100) + "..." })))}
        
        **Instructions for History:**
        1. Adopt a similar tone/voice to these successful emails in the 'body'.
        2. In the 'subjectSuggestions' array, generate 5 alternative subject lines that use similar psychological triggers (urgency, curiosity, benefit) as the high-performing past subjects.
        `;
      } else {
        promptText += `\n\nIn the 'subjectSuggestions' array, generate 5 alternative catchy subject lines suitable for this email.`;
      }

      promptText += `\nReturn the result as a JSON object with 'subject', 'body', and 'subjectSuggestions' fields.
        The 'body' should be formatted with basic HTML tags like <p>, <br>, <strong>, and the <img> tags as requested. Do not include <html> or <body> wrapper tags.`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts }, // Pass the array of parts
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              subjectSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['subject', 'body', 'subjectSuggestions']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      return JSON.parse(text) as GeneratedEmail;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  },

  suggestSubjectLines: async (currentSubject: string, emailBody: string, pastCampaigns: { subject: string, openRate: number }[] = []): Promise<string[]> => {
    try {
      let prompt = `Based on the following email body: "${emailBody.substring(0, 500)}..." 
        and the current subject line: "${currentSubject}", 
        generate 5 alternative, high-performing subject lines. 
        They should vary in tone (curiosity, urgency, benefit-driven).`;

      if (pastCampaigns.length > 0) {
        const topCampaigns = [...pastCampaigns]
            .filter(c => c.openRate !== undefined)
            .sort((a, b) => b.openRate - a.openRate)
            .slice(0, 5);

        prompt += `\n\nHere are the top performing subject lines from previous campaigns (with their open rates). 
        Analyze the patterns in these successful subjects and apply similar psychological triggers to the new suggestions:
        ${JSON.stringify(topCampaigns)}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      const json = JSON.parse(text);
      return json.suggestions || [];
    } catch (error) {
      console.error("Subject Line Error:", error);
      return [];
    }
  },

  generateSocialPosts: async (emailContent: string): Promise<SocialPosts> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Repurpose the following email marketing content into social media posts for LinkedIn, Twitter (X), and Facebook.
        
        Email Content: "${emailContent.substring(0, 1000)}..."
        
        Rules:
        - LinkedIn: Professional, business-focused, includes hashtags.
        - Twitter: Short, punchy, under 280 chars, includes hashtags.
        - Facebook: Casual, engaging, encourages sharing.
        `,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              linkedin: { type: Type.STRING },
              twitter: { type: Type.STRING },
              facebook: { type: Type.STRING }
            },
            required: ['linkedin', 'twitter', 'facebook']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as SocialPosts;
    } catch (error) {
      console.error("Social Media Error:", error);
      throw error;
    }
  },

  analyzeSegments: async (contacts: Contact[]): Promise<SegmentSuggestion[]> => {
    try {
      // Send a rich sample to help AI understand demographics and engagement
      const sample = contacts.slice(0, 50).map(c => ({ 
        source: c.source, 
        email_domain: c.email.split('@')[1],
        engagement: c.engagementScore > 70 ? 'High' : c.engagementScore > 30 ? 'Medium' : 'Low',
        location: c.location || 'Unknown',
        job: c.jobTitle || 'Unknown'
      }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this sample of contact data: ${JSON.stringify(sample)}.
        Suggest 3 strategic market segments for this audience based on engagement level (High/Medium/Low), demographics (Location, Job Title), or email behavior.
        
        For each segment provide:
        1. A catchy Name
        2. Description of the persona
        3. Technical Criteria (e.g. "Engagement > 70 AND Location contains 'USA'")
        4. Marketing Angle (specific hook or value proposition for this group)
        `,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    criteria: { type: Type.STRING },
                    marketing_angle: { type: Type.STRING }
                  },
                  required: ['name', 'description', 'criteria', 'marketing_angle']
                }
              }
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      const json = JSON.parse(text);
      return json.segments || [];
    } catch (error) {
      console.error("Segmentation Error:", error);
      throw error;
    }
  },

  generateGrowthReport: async (businessDescription: string): Promise<GrowthReport> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research the latest market trends (2024-2025) for: "${businessDescription}".
        
        Provide a strategic growth report in Markdown format with the following sections:
        1. **Trending Now**: What is currently popular in this industry?
        2. **Customer Acquisition**: What specific actions must businesses do to gain customers right now?
        3. **Revenue Drivers**: Analyze what specifically makes money for successful businesses in this niche.
        4. **Actionable Checklist**: 3-5 concrete steps the user can take today.
        
        Use the Google Search tool to find up-to-date information.
        Do not output JSON. Output clear, professional Markdown.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      // Extract Grounding Metadata (Sources)
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({ title: web.title, uri: web.uri }));

      return {
        content: response.text || "No report generated.",
        sources: sources
      };
    } catch (error) {
      console.error("Growth Report Error:", error);
      throw error;
    }
  }
};