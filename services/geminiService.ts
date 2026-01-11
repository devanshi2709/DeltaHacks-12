// Frontend-safe stubs
// Gemini runs ONLY on backend

export async function getPredictiveInsights(_text: string) {
  return [
    {
      id: "risk-1",
      label: "Potential Harassment",
      confidence: 0.92,
      urgency: 7,
      recommended_action: "safety_check",
    },
    {
      id: "risk-2",
      label: "Escalation Risk",
      confidence: 0.78,
      urgency: 6,
      recommended_action: "phone_call",
    },
  ];
}

export async function analyzeSmsUrgency(_text: string) {
  return {
    urgency: 7,
    category: "harassment",
    recommended_action: "phone_call",
    sentiment: "panic",
  };
}
