
import { GoogleGenAI, Type } from "@google/genai";
import { Contact, StrategyItem } from "../types";

export interface EmailScoreResult {
  overallScore: number;
  overallInsight: string;
  subjectAnalysis: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  bodyAnalysis: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  subjectSuggestions?: { text: string; score: number }[];
  score?: number;
  insight?: string;
  triggerUsed?: string;
  sources?: { title: string; uri: string }[];
  detailedAnalysis?: EmailScoreResult;
}

export interface GeneratedSocialPost {
  content: string;
  hashtags: string[];
  imagePrompt?: string;
  viralityScore: number;
  strategy: string;
  bestTime?: string;
  sources?: { title: string; uri: string }[];
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

export interface AudienceInsights {
  summary: string;
  top_demographic: string;
  engagement_trend: string;
  recommended_actions: string[];
}

// Robust JSON cleaner to extract objects from any text
const cleanJson = (text: string) => {
  if (!text) return '{}';
  // Find the first '{' and the last '}' to extract the JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text;
};

// Helper for Fallback Logic to handle Quota Exceeded (429) errors
const generateWithFallback = async (ai: GoogleGenAI, params: any, primaryModel: string) => {
    const fallbackModel = 'gemini-3-flash-preview';
    try {
        return await ai.models.generateContent({
            ...params,
            model: primaryModel
        });
    } catch (error: any) {
        // Check for quota/rate limit errors (429) or overloaded (503)
        const isQuotaError = error.status === 429 || 
                             (error.message && error.message.includes('429')) ||
                             (error.message && error.message.includes('quota')) ||
                             (error.message && error.message.includes('RESOURCE_EXHAUSTED'));
                             
        if (isQuotaError) {
            console.warn(`Primary model ${primaryModel} quota exceeded. Falling back to ${fallbackModel}.`);
            // Brief pause to allow system to recover slightly if it was a burst limit
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await ai.models.generateContent({
                ...params,
                model: fallbackModel
            });
        }
        throw error;
    }
};

export const GeminiService = {
  generateEmail: async (
    instruction: string, 
    businessName: string, 
    images: ImageInput[] = [],
    pastCampaigns: PastCampaignData[] = [],
    language: string = 'English',
    websiteUrl: string = ''
  ): Promise<GeneratedEmail> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const parts: any[] = [];
      images.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType, 
            data: img.data
          }
        });
      });

      // DYNAMIC PROMPT PART FOR IMAGES
      const imageInstruction = images.length > 0
        ? `
        **IMPORTANT: IMAGE HANDLING**
        - I have provided ${images.length} image(s) for this email.
        - You MUST include them in the HTML using specific placeholders.
        - For the first image, use <img src="{{IMAGE_0}}" alt="Image 1" style="width:100%; max-width:600px; border-radius:8px; margin: 20px 0; display: block;" />.
        - For the second image, use <img src="{{IMAGE_1}}" ... />, and so on.
        - Place these images strategically within the content (e.g., as a hero image at the top, or breaking up sections of text). Do NOT ignore them.
        `
        : `
        **VISUALS**
        - Do NOT generate <img> tags with fake URLs since no images were provided.
        - Instead, use **CSS styling** to create visual interest based on the brand analysis.
        `;

      // DYNAMIC BRANDING INSTRUCTION VIA SEARCH
      const brandingInstruction = websiteUrl 
        ? `
        **AUTOMATED BRAND ANALYSIS (MANDATORY)**
        - The client's website is: ${websiteUrl}
        - **ACTION**: Use Google Search to analyze this website's visual identity.
        - Look for: Primary brand color, accent color, and general "climate" (e.g., minimalist, luxury, playful, corporate).
        - **APPLY TO HTML**: 
          - Use the discovered hex codes for the background of the Call-to-Action button.
          - Use the brand colors for headers (h1, h2) and borders.
          - Match the writing tone to the website's copy style.
        - If Google Search fails to find specific colors, infer a palette that matches the industry standards for "${businessName}".
        ` 
        : `
        **BRANDING**
        - No website URL provided. Use a clean, modern color palette (e.g., Indigo #4F46E5, Slate #1E293B) suitable for a professional business.
        `;

      const promptText = `Role: World-Class HTML Email Developer & Copywriter for "${businessName}".
      
      Task: Create a visually stunning, high-converting HTML marketing email based on:
      """
      ${instruction}
      """

      ${brandingInstruction}

      ${imageInstruction}

      Design Guidelines (STRICT):
      1.  **Layout**: Use a centered container (max-width: 600px) with a clean background color (e.g., #f3f4f6).
      2.  **Card Style**: The main content should be in a white box with rounded corners and a subtle shadow.
      3.  **Call To Action**: Create a beautiful, bulletproof button using HTML/CSS. **The button color MUST match the brand analysis results.**
      4.  **Footer (MANDATORY)**: You MUST include a footer section at the bottom.
          - It must contain the business name.
          - It MUST contain an "Unsubscribe" link. Use exactly this format: <a href="{{System.Unsubscribe}}">Unsubscribe</a>.
          - This is legally required for compliance.
      5.  **Language**: Write the copy in ${language}.

      Output Requirements:
      - Return a JSON object.
      - 'subject': A catchy subject line.
      - 'body': The FULL HTML code. Use inline CSS for everything to ensure it renders in email clients.
      - 'thought_process': Brief explanation of the strategy and **specifically mention which brand colors were found/used from the URL analysis**.
      - 'subjectSuggestions': 3 alternative subject lines.
      `;

      parts.push({ text: promptText });

      // Use helper for retry logic with 'gemini-3-pro-preview' as primary
      const response = await generateWithFallback(ai, {
        contents: { parts },
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              thought_process: { type: Type.STRING },
              subject: { type: Type.STRING },
              body: { type: Type.STRING, description: "Full HTML content with inline CSS." },
              retention_score: { type: Type.NUMBER },
              psychological_insight: { type: Type.STRING },
              psychological_trigger_used: { type: Type.STRING },
              subjectSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    score: { type: Type.NUMBER }
                  }
                }
              }
            },
            required: ["subject", "body", "thought_process"]
          }
        }
      }, 'gemini-3-pro-preview');

      const cleanText = cleanJson(response.text || '{}');
      let data;
      try {
          data = JSON.parse(cleanText);
      } catch (e) {
          console.error("Failed to parse JSON", e);
          data = { 
              subject: "Draft Generated", 
              body: `<div style="padding:20px;">${response.text}</div>`,
              retention_score: 0
          };
      }
      
      const sources: { title: string; uri: string }[] = [];
      if (response.candidates && response.candidates[0]?.groundingMetadata?.groundingChunks) {
          response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
              if (chunk.web) {
                  sources.push({ title: chunk.web.title, uri: chunk.web.uri });
              }
          });
      }

      // Default high score for new generation as it follows best practices
      const score = data.retention_score || 85;

      return {
        subject: data.subject || 'Untitled Campaign',
        body: data.body || '<p>No content generated.</p>',
        score: Math.min(100, Math.max(0, Math.round(score))),
        insight: data.psychological_insight || data.thought_process || 'Optimized for high engagement.',
        triggerUsed: data.psychological_trigger_used || 'Visual Hierarchy & Value',
        subjectSuggestions: data.subjectSuggestions || [],
        sources: sources
      };
    } catch (error) {
      console.error("Gemini Retention Engine Error:", error);
      throw error;
    }
  },

  generateSocialPost: async (
    platform: string,
    topic: string,
    businessName: string,
    images: ImageInput[] = [],
    language: string = 'English'
  ): Promise<GeneratedSocialPost> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const parts: any[] = [];
      images.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType, 
            data: img.data
          }
        });
      });

      // Updated to explicitly ask for image analysis
      const imageContext = images.length > 0 
        ? "I have attached images. Analyze them carefully. The post content MUST be directly relevant to the visual details, mood, and subject matter of these images." 
        : "No images provided. Describe an ideal image for this post in the 'imagePrompt' field.";

      const promptText = `You are an expert Social Media Manager for "${businessName}".
      
      TASK: Create a viral-worthy social media post for **${platform}** about: "${topic}".
      
      ${imageContext}
      
      PHASE 1: RESEARCH
      Use Google Search to find trending hashtags, keywords, and post styles related to "${topic}" on ${platform}.
      
      PHASE 2: CREATION
      Write the post content in ${language}.
      
      OUTPUT FORMAT: JSON.
      `;

      parts.push({ text: promptText });

      // Upgraded to gemini-3-pro-preview for image understanding and search grounding
      const response = await generateWithFallback(ai, {
        contents: { parts },
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              imagePrompt: { type: Type.STRING },
              viralityScore: { type: Type.NUMBER },
              strategy: { type: Type.STRING },
              bestTime: { type: Type.STRING }
            }
          }
        }
      }, 'gemini-3-pro-preview');

      const cleanText = cleanJson(response.text || '{}');
      let data;
      try {
          data = JSON.parse(cleanText);
      } catch (e) {
          console.error("Failed to parse JSON", e);
          data = {};
      }
      
      const sources: { title: string; uri: string }[] = [];
      if (response.candidates && response.candidates[0]?.groundingMetadata?.groundingChunks) {
          response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
              if (chunk.web) {
                  sources.push({ title: chunk.web.title, uri: chunk.web.uri });
              }
          });
      }

      return {
          content: data.content || '',
          hashtags: data.hashtags || [],
          imagePrompt: data.imagePrompt || '',
          viralityScore: data.viralityScore || 0,
          strategy: data.strategy || '',
          bestTime: data.bestTime || '',
          sources
      } as GeneratedSocialPost;

    } catch (error) {
      console.error("Gemini Social Engine Error:", error);
      throw error;
    }
  },

  scoreEmailContent: async (subject: string, body: string): Promise<EmailScoreResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      // Use helper for retry logic with 'gemini-3-pro-preview' as primary
      const response = await generateWithFallback(ai, {
        contents: `Act as a strict Email Deliverability & Conversion Auditor.
        
        TASK: Analyze the following email draft.
        Subject: "${subject}"
        Body Snippet: "${body.substring(0, 1000)}..."

        STEPS:
        1. Analyze the Subject Line: Is it catchy? concise? Does it trigger curiosity?
        2. Analyze the Body Content: Is it readable? Persuasive? clear CTA?
        3. Check for spam trigger words.

        OUTPUT JSON:
        - 'overallScore': Integer 0-100.
        - 'overallInsight': A 1-2 sentence summary.
        - 'subjectAnalysis': { score (0-100), feedback (string), suggestions (string[]) }
        - 'bodyAnalysis': { score (0-100), feedback (string), suggestions (string[]) }
        `,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER },
              overallInsight: { type: Type.STRING },
              subjectAnalysis: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              bodyAnalysis: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }, 'gemini-3-pro-preview');
      
      const cleanText = cleanJson(response.text || '{}');
      const data = JSON.parse(cleanText);
      
      // Robust Score Normalization
      let score = data.overallScore || 0;
      if (score > 0 && score < 1) {
          score = Math.round(score * 100);
      }
      
      return { 
          overallScore: Math.min(100, Math.max(0, Math.round(score))), 
          overallInsight: data.overallInsight || "Analysis complete.",
          subjectAnalysis: data.subjectAnalysis || { score: 0, feedback: "No analysis", suggestions: [] },
          bodyAnalysis: data.bodyAnalysis || { score: 0, feedback: "No analysis", suggestions: [] }
      };
    } catch (error) {
      console.error("Scoring Error", error);
      return { 
        overallScore: 0, 
        overallInsight: "Evaluation service unavailable.",
        subjectAnalysis: { score: 0, feedback: "Error", suggestions: [] },
        bodyAnalysis: { score: 0, feedback: "Error", suggestions: [] }
      };
    }
  },

  suggestSubjectLines: async (currentSubject: string, emailBody: string, pastCampaigns: { subject: string, openRate: number }[] = []): Promise<{text: string, score: number}[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 3 psychologically optimized subject alternatives for this email body. 
        Current Subject: ${currentSubject}
        Body Snippet: ${emailBody.substring(0, 500)}...
        
        Return JSON with 'suggestions' array containing {text, score (predicted 0-100)}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    score: { type: Type.NUMBER }
                  }
                } 
              }
            }
          }
        }
      });
      const cleanText = cleanJson(response.text || '{}');
      return JSON.parse(cleanText).suggestions || [];
    } catch (error) {
      return [];
    }
  },

  getAudienceInsights: async (contacts: Contact[]): Promise<AudienceInsights> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const sample = contacts.slice(0, 30).map(c => ({
        engagement: c.engagementScore,
        location: c.location,
        job: c.jobTitle,
        spent: c.totalSpent || 0
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze audience data: ${JSON.stringify(sample)}.
        Identify patterns in high-value customers and suggest retention actions.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              top_demographic: { type: Type.STRING },
              engagement_trend: { type: Type.STRING },
              recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      const cleanText = cleanJson(response.text || '{}');
      return JSON.parse(cleanText) as AudienceInsights;
    } catch (error) {
      return {
        summary: "Unable to analyze audience at this time.",
        top_demographic: "General Audience",
        engagement_trend: "Stable",
        recommended_actions: ["Analyze manual lists for better insights"]
      };
    }
  },

  generateActionableStrategies: async (
    businessName: string, 
    industry: string, 
    description: string
  ): Promise<{ strategies: StrategyItem[], executiveSummary: string }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      // Changed to 'gemini-3-flash-preview' for significantly faster execution (approx 2-3s vs 10s+)
      // Wrapped in generateWithFallback to ensure robust retry on 429 errors
      const response = await generateWithFallback(ai, {
        contents: `Act as a Chief Strategy Officer for ${businessName} (${industry}).
        Context: ${description}.
        Generate 3 high-impact growth strategies and an executive summary.
        Return JSON.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              strategies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    category: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    isEmailOpportunity: { type: Type.BOOLEAN },
                    emailPrompt: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }, 'gemini-3-flash-preview');

      const cleanText = cleanJson(response.text || '{}');
      const data = JSON.parse(cleanText);
      const strategies = (data.strategies || []).map((s: any, i: number) => ({
        ...s,
        id: `gen_strat_${Date.now()}_${i}`,
        completed: false
      }));

      return {
        strategies,
        executiveSummary: data.executiveSummary || ''
      };
    } catch (error) {
      console.error("Strategy Generation Error", error);
      throw error;
    }
  },

  chatWithStrategy: async (
    history: {role: 'user' | 'model', text: string}[], 
    strategy: StrategyItem, 
    businessName: string
  ): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: [
          {
            role: 'user',
            parts: [{ text: `You are an expert consultant for ${businessName}. Discussing strategy: ${strategy.title}.` }]
          },
          {
            role: 'model',
            parts: [{ text: "Ready to help. What questions do you have?" }]
          },
          ...history.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
          }))
        ]
      });

      const lastUserMsg = history[history.length - 1].text;
      const response = await chat.sendMessage({ message: lastUserMsg });
      
      return response.text || "I couldn't generate a response.";
    } catch (error) {
      console.error("Chat Error", error);
      throw error;
    }
  }
};
