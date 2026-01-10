
import { GoogleGenAI, Type } from "@google/genai";
import { Incident } from "./types";

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
    const prompt = `
You are an AI system analyzing historical women's safety incidents to support prevention and volunteer deployment.

Your goal is to identify REPEATING and DATA-SUPPORTED risk patterns.

Instructions:
- Only report patterns clearly supported by the data
- Focus on time, location, and incident-type clustering
- Highlight risks that can be acted on proactively
- Do NOT invent patterns without evidence

Incident data:
${JSON.stringify(incidents)}

Return an ARRAY of JSON objects with the following structure:

{
  "pattern": string,
  "risk_level": "low | medium | high",
  "confidence": number (0–1),
  "time_window": string,
  "location": string,
  "incident_types": string[],
  "evidence": string,
  "recommended_prevention": string,
  "system_action": string
}

Rules:
- Confidence reflects pattern strength in the data
- Risk level must align with incident frequency and severity
- System action must be operational (e.g. "deploy 2 volunteers")
- Keep explanations concise and factual

Respond ONLY with valid JSON.
`;


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
            urgency: { type: Type.NUMBER },
            category: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            recommended_action: { type: Type.STRING },
            language: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            empathetic_response: { type: Type.STRING },
            reasoning: { type: Type.STRING }
            },
            required: ["urgency",
            "category",
            "sentiment",
            "recommended_action",
            "language",
            "empathetic_response",
            "reasoning"]
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
