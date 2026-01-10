
import { GoogleGenAI, Type } from "@google/genai";
import { Incident } from "../types";

// Always use const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSmsUrgency = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following SOS message from a woman in a potentially vulnerable situation and categorize it. 
      Text: "${text}"
      
      Respond in JSON format with fields: 
      urgency (1-10), 
      category (e.g., stalking, harassment, domestic_violence, general_fear),
      recommended_action (immediate_dispatch, phone_call, safety_check),
      sentiment (fear, panic, calm).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgency: { type: Type.NUMBER },
            category: { type: Type.STRING },
            recommended_action: { type: Type.STRING },
            sentiment: { type: Type.STRING }
          },
          required: ["urgency", "category", "recommended_action", "sentiment"]
        }
      }
    });
    // Use .text property directly (not a method).
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const getPredictiveInsights = async (incidents: Incident[]) => {
  try {
    const prompt = `Based on the following historical safety incidents in the Beasley neighborhood, identify patterns and suggest proactive prevention strategies for women's safety.
    
    Incidents: ${JSON.stringify(incidents)}
    
    Respond in JSON format as an array of patterns:
    [{ "pattern": string, "risk": string, "when": string, "where": string, "prevention": string }]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pattern: { type: Type.STRING },
              risk: { type: Type.STRING },
              when: { type: Type.STRING },
              where: { type: Type.STRING },
              prevention: { type: Type.STRING }
            },
            required: ["pattern", "risk", "when", "where", "prevention"]
          }
        }
      }
    });
    // Use .text property directly (not a method).
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Predictive analysis failed:", error);
    return [];
  }
};
