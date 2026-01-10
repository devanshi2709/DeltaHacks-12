const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeIncident(message) {
  try {
    // Try gemini-1.5-flash first
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this crisis message: "${message}"

Return ONLY valid JSON:
{
  "category": "following",
  "urgency": 9,
  "emotion": "fear",
  "recommendedAction": "dispatch_immediate",
  "policeNeeded": false,
  "suggestedResponse": "Help is coming. Stay safe."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanText);
    
    console.log('✅ Gemini analysis:', analysis);
    return analysis;
    
  } catch (error) {
    console.error('❌ Gemini error:', error.message);
    
    // Smart fallback based on keywords
    const msg = message.toLowerCase();
    let urgency = 5;
    let category = 'other';
    
    if (msg.includes('follow') || msg.includes('stalking')) {
      category = 'following';
      urgency = 9;
    } else if (msg.includes('harass') || msg.includes('catcall')) {
      category = 'harassment';
      urgency = 7;
    } else if (msg.includes('unsafe') || msg.includes('dark')) {
      category = 'unsafe_location';
      urgency = 6;
    } else if (msg.includes('scared') || msg.includes('help')) {
      urgency = 8;
    }
    
    return {
      category,
      urgency,
      emotion: urgency > 7 ? 'fear' : 'concern',
      recommendedAction: urgency >= 8 ? 'dispatch_immediate' : 'provide_resources',
      policeNeeded: false,
      suggestedResponse: 'Help is on the way. Stay in a safe, well-lit area. 💜'
    };
  }
}

module.exports = { analyzeIncident };
