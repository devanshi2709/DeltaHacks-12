require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
