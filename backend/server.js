require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

console.log("ElevenLabs key loaded:", !!process.env.ELEVENLABS_KEY);

const app = express();
const axios = require("axios"); 

//Expressing body parsing so we can read POST JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ElevenLabs audio endpoint
app.post("/api/voice/fake-call", async (req, res) => {
  try {
    const script =
      req.body?.text ||
      "Hey! Oh my god, I've been trying to reach you! There's a family emergency—you need to come home right now. No, it can't wait.";

    const apiKey = process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_KEY; // supports either name
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY (or ELEVENLABS_KEY) in backend/.env" });
    }
    if (!voiceId) {
      return res.status(500).json({ error: "Missing ELEVENLABS_VOICE_ID in backend/.env" });
    }

    const elevenRes = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: script,
        // model_id is optional; leave it if it works for you
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(elevenRes.data));
  } catch (err) {
    console.error("ElevenLabs error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});


// MongoDB connection
console.log('🔄 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Import models BEFORE routes
require('./models/Incident');
require('./models/Volunteer');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'SafetyNet HER API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Import routes
try {
  const smsRoutes = require('./routes/sms');
  const volunteerRoutes = require('./routes/volunteers');
  const incidentRoutes = require('./routes/incidents');
  
  app.use('/api/sms', smsRoutes);
  app.use('/api/volunteers', volunteerRoutes);
  app.use('/api/incidents', incidentRoutes);
  
  console.log('📋 Routes loaded successfully');
} catch (err) {
  console.warn('⚠️  Routes error:', err.message);
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
