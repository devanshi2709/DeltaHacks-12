// testGemini.ts

import { getPredictiveInsights } from "./geminiService";
import { Incident } from "./types";

const fakeIncidents: Incident[] = [
  {
    type: "harassment",
    time: "2026-01-09T21:55",
    locationName: "Main St Bus Stop",
  },
  {
    type: "following",
    time: "2026-01-09T22:05",
    locationName: "Main St Bus Stop",
  },
  {
    type: "harassment",
    time: "2026-01-16T22:10",
    locationName: "Main St Bus Stop",
  },
  {
    type: "following",
    time: "2026-01-23T22:00",
    locationName: "Main St Bus Stop",
  },
  {
    type: "general_fear",
    time: "2026-01-12T19:30",
    locationName: "Downtown Parking Garage",
  },
  {
    type: "general_fear",
    time: "2026-01-19T19:45",
    locationName: "Downtown Parking Garage",
  },
  {
    type: "harassment",
    time: "2026-01-14T16:20",
    locationName: "City Mall Entrance",
  },
];

async function runTest() {
  console.log("🔍 Running Gemini Predictive Insight Test...\n");

  const insights = await getPredictiveInsights(fakeIncidents);

  if (insights.length === 0) {
    console.log("⚠️ No patterns detected.");
    return;
  }

  insights.forEach((insight, index) => {
    console.log(`🧠 Pattern #${index + 1}`);
    console.log(`📍 Location: ${insight.location}`);
    console.log(`⚠️ Risk Level: ${insight.risk_level}`);
    console.log(`🕒 Time Window: ${insight.time_window}`);
    console.log(`📊 Confidence: ${Math.round(insight.confidence * 100)}%`);
    console.log(`📌 Incident Types: ${insight.incident_types.join(", ")}`);
    console.log(`🧾 Evidence: ${insight.evidence}`);
    console.log(`🛡️ Prevention: ${insight.recommended_prevention}`);
    console.log(`🚨 System Action: ${insight.system_action}`);
    console.log("—".repeat(50));
  });
}

runTest();
