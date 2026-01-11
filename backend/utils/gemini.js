/**
 * Gemini / Google Generative Language integration
 * SAFE, NON-BLOCKING, HACKATHON-STABLE
 *
 * - Uses Google Generative Language API (text-bison-001)
 * - NEVER crashes on bad AI output
 * - AI is advisory, fallback is guaranteed
 * - Logs clearly whether AI or fallback was used
 */

async function analyzeIncident(message) {
  const start = Date.now();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            text: `
You are assisting a women's community safety system.

Return ONLY a JSON object. No explanation text.

Schema:
{
  "category": "following | harassment | unsafe_location | emergency | other",
  "urgency": number (1-10),
  "emotion": "fear | panic | concern | calm",
  "recommend_dispatch": boolean,
  "police_needed": boolean,
  "confidence": number (0-1)
}

Message:
"${message}"
            `,
          },
          temperature: 0.2,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();

    // text-bison response shape (THIS IS CORRECT)
    const rawText = data?.candidates?.[0]?.outputText;

    if (!rawText) {
      throw new Error("No outputText from model");
    }

    // 🔐 SAFE JSON EXTRACTION (this is the key)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Model did not return JSON");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      ...analysis,
      latencyMs: Date.now() - start,
      source: "google-generative-language",
    };

  } catch (err) {
    console.log("⚠️ Gemini unavailable, using safe fallback");

    // ✅ DETERMINISTIC FALLBACK (GUARANTEED RESPONSE)
    const msg = message.toLowerCase();

    let urgency = 5;
    let category = "other";

    if (msg.includes("follow") || msg.includes("stalk")) {
      category = "following";
      urgency = 9;
    } else if (msg.includes("harass") || msg.includes("catcall")) {
      category = "harassment";
      urgency = 7;
    } else if (msg.includes("unsafe") || msg.includes("scared")) {
      category = "unsafe_location";
      urgency = 8;
    }

    return {
      category,
      urgency,
      emotion: urgency >= 8 ? "fear" : "concern",
      recommend_dispatch: urgency >= 7,
      police_needed: false,
      confidence: 0.55,
      latencyMs: Date.now() - start,
      source: "fallback",
    };
  }
}

module.exports = { analyzeIncident };
