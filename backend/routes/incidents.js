const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// GET all incidents
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = status ? { status } : {};
    
    const incidents = await Incident.find(query)
      .populate('assignedVolunteer')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET incident stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const resolved = await Incident.countDocuments({ status: 'resolved' });
    const pending = await Incident.countDocuments({ status: 'pending' });
    
    const byCategory = await Incident.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const policeInvolved = await Incident.countDocuments({ policeInvolved: true });
    
    res.json({
      total,
      resolved,
      pending,
      byCategory,
      policeInvolvedPercentage: total > 0 ? ((policeInvolved / total) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
