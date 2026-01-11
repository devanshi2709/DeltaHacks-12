const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  userPhone: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  locationHint: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [-79.8711, 43.2557] }
  },
  category: {
    type: String,
    enum: ['harassment', 'following', 'unsafe_location', 'domestic', 'other'],
    default: 'other'
  },
  urgency: { type: Number, min: 1, max: 10, default: 5 },
  emotion: {
    type: String,
    enum: ['fear', 'panic', 'concern', 'calm'],
    default: 'concern'
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'resolved', 'cancelled'],
    default: 'pending'
  },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    default: null
  },
  resolution: String,
  policeInvolved: { type: Boolean, default: false },
  responseTime: Number
}, { timestamps: true });

incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);
