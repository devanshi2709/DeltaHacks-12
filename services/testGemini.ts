// testGemini.ts
import { PredictiveInsight, Incident, Urgency } from "./types";

// Fake incidents for demo
const fakeIncidents: Incident[] = [
  {
    id: '1',
    type: "harassment",
    time: "2026-01-09T21:55",
    dayOfWeek: "Friday",
    category: "HARASSMENT",
    location: { area: "Main St Bus Stop", lat: 43.2550, lng: -79.8700 },
    description: "Someone shouted at the user",
    resolvedBy: "",
    urgency: Urgency.HIGH,
    urgencyScore: 8,
    status: "open"
  },
  {
    id: '2',
    type: "following",
    time: "2026-01-09T22:05",
    dayOfWeek: "Friday",
    category: "FOLLOWED",
    location: { area: "Main St Bus Stop", lat: 43.2550, lng: -79.8700 },
    description: "User reported being followed",
    resolvedBy: "",
    urgency: Urgency.HIGH,
    urgencyScore: 9,
    status: "open"
  },
  {
    id: '3',
    type: "harassment",
    time: "2026-01-16T22:10",
    dayOfWeek: "Friday",
    category: "HARASSMENT",
    location: { area: "Main St Bus Stop", lat: 43.2550, lng: -79.8700 },
    description: "Harassment reported near bus stop",
    resolvedBy: "",
    urgency: Urgency.MEDIUM,
    urgencyScore: 7,
    status: "open"
  },
  {
    id: '4',
    type: "following",
    time: "2026-01-23T22:00",
    dayOfWeek: "Friday",
    category: "FOLLOWED",
    location: { area: "Main St Bus Stop", lat: 43.2550, lng: -79.8700 },
    description: "User followed for 3 blocks",
    resolvedBy: "",
    urgency: Urgency.HIGH,
    urgencyScore: 9,
    status: "open"
  }
];

// Fake "AI insights" generator for demo
function getPredictiveInsights(incidents: Incident[]): PredictiveInsight[] {
  // Must match your PredictiveInsight type exactly
  return [
    {
      pattern: "Harassment spike near Main St Bus Stop",
      risk: "High",
      when: "Fridays 9–11 PM",
      where: "Main St Bus Stop",
      prevention: "Dispatch 2 volunteers during peak hours",
    },
    {
      pattern: "Following incidents increasing near Main St Bus Stop",
      risk: "Medium",
      when: "Fridays 10–11 PM",
      where: "Main St Bus Stop",
      prevention: "Volunteer patrol recommended",
    }
  ];
}

// Demo runner
async function runTest() {
  console.log("🔍 Running Gemini Predictive Insight Test...\n");

  const insights = getPredictiveInsights(fakeIncidents);

  if (!insights || insights.length === 0) {
    console.log("⚠️ No patterns detected.");
    return;
  }

  insights.forEach((insight, index) => {
    console.log(`🧠 Pattern #${index + 1}`);
    console.log(`📌 Pattern: ${insight.pattern}`);
    console.log(`📍 Location: ${insight.where}`);
    console.log(`⚠️ Risk Level: ${insight.risk}`);
    console.log(`🕒 Time Window: ${insight.when}`);
    console.log(`🛡️ Recommended Prevention: ${insight.prevention}`);
    console.log("—".repeat(50));
  });
}

runTest();
