const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');

// GET all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('activeIncidents')
      .sort({ available: -1, onDuty: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new volunteer
router.post('/', async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.status(201).json(volunteer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH update availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { available, onDuty } = req.body;
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { available, onDuty, lastActive: new Date() },
      { new: true }
    );
    res.json(volunteer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
