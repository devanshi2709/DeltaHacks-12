const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  available: { type: Boolean, default: true },
  onDuty: { type: Boolean, default: false },
  skills: [{
    type: String,
    enum: ['de-escalation', 'mental-health', 'medical', 'multilingual', 'crisis-counseling']
  }],
  languages: [{ type: String, default: ['English'] }],
  incidentsHandled: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 5 },
  activeIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],
  maxConcurrentIncidents: { type: Number, default: 1 },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

volunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', volunteerSchema);
