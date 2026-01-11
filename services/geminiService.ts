// Frontend-safe stubs
// Gemini runs ONLY on backend
import { Incident,Urgency,PredictiveInsight } from "./types";
export async function getPredictiveInsights(incidents: Incident[]): Promise<PredictiveInsight[]> {
  return incidents.map((incident, idx) => ({
    id: `risk-${idx + 1}`,
    pattern: incident.type.replace(/_/g, ' '),
    risk:
      incident.urgency === Urgency.CRITICAL || incident.urgency === Urgency.HIGH
        ? 'High'
        : incident.urgency === Urgency.MEDIUM
        ? 'Medium'
        : 'Low',
    when: `${incident.dayOfWeek} ${incident.time}`,
    where: incident.location.area,
    prevention: 'Dispatch volunteers and follow safety protocols',
  }));
}

export async function analyzeSmsUrgency(_text: string) {
  return {
    urgency: 7,
    category: "harassment",
    recommended_action: "phone_call",
    sentiment: "panic",
  };
}
