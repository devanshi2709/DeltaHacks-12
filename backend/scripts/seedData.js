require('dotenv').config();
const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    await Volunteer.deleteMany({});
    
    const volunteers = [
      {
        name: 'Sansita (You!)',
        phone: '+6478715609',  // <-- CHANGE THIS!
        location: {
          type: 'Point',
          coordinates: [-79.8711, 43.2557]
        },
        available: true,
        onDuty: true,
        skills: ['de-escalation', 'mental-health'],
        languages: ['English']
      }
    ];
    
    await Volunteer.insertMany(volunteers);
    console.log('✅ Volunteers seeded:', volunteers.length);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedData();
