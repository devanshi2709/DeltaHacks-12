const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Volunteer = require('../models/Volunteer');
const { analyzeIncident } = require('../utils/gemini');
const { sendSMS, makeCall } = require('../utils/twilio');

router.post('/incoming', async (req, res) => {
  try {
    const { From, Body } = req.body;
    const userPhone = From;
    const userMessage = Body.trim();
    
    console.log('\n🚨 ═══════════════════════════════════════');
    console.log('     NEW CRISIS ALERT RECEIVED');
    console.log('═══════════════════════════════════════ 🚨');
    console.log(`📱 From: ${userPhone}`);
    console.log(`💬 Message: "${userMessage}"`);

    if (userMessage.toUpperCase() === 'CALL ME') {
      console.log('📞 Fake emergency call requested...');
      await handleFakeCall(userPhone);
      return res.status(200).send('<Response></Response>');
    }

    console.log('\n🤖 Analyzing message with Gemini AI...');
    const analysis = await analyzeIncident(userMessage);
    
    console.log('\n📊 ═══ AI ANALYSIS RESULTS ═══');
    console.log(`   🏷️  Category: ${analysis.category.toUpperCase()}`);
    console.log(`   ⚠️  Urgency Level: ${analysis.urgency}/10`);
    console.log(`   😰 Emotion: ${analysis.emotion}`);
    console.log(`   🎯 Recommended Action: ${analysis.recommendedAction}`);
    console.log(`   🚔 Police Needed: ${analysis.policeNeeded ? 'YES' : 'NO'}`);
    console.log('═════════════════════════════════════');
    
    const incident = new Incident({
      userPhone,
      message: userMessage,
      category: analysis.category,
      urgency: analysis.urgency,
      emotion: analysis.emotion,
      status: 'pending'
    });
    
    await incident.save();
    console.log(`\n💾 Incident saved to database`);
    console.log(`   ID: ${incident._id}`);
    
    const volunteer = await findNearestVolunteer(incident.location.coordinates);
    
    if (volunteer && analysis.recommendedAction === 'dispatch_immediate') {
      console.log('\n🚑 ═══ DISPATCHING VOLUNTEER ═══');
      console.log(`   👤 Name: ${volunteer.name}`);
      console.log(`   📱 Phone: ${volunteer.phone}`);
      console.log(`   📍 Location: Beasley area`);
      console.log(`   ⏱️  ETA: ~5 minutes`);
      
      incident.status = 'dispatched';
      incident.assignedVolunteer = volunteer._id;
      await incident.save();
      
      volunteer.activeIncidents.push(incident._id);
      await volunteer.save();
      
      // Send to volunteer
      const volunteerMsg = `🚨 SAFETYNET DISPATCH\n\nUrgency: ${analysis.urgency}/10\nCategory: ${analysis.category}\nLocation: Beasley area\n\nUser message: "${userMessage}"\n\nReply ACCEPT to respond.`;
      
      console.log('\n📤 Sending alert to volunteer...');
      await sendSMS(volunteer.phone, volunteerMsg);
      
      // Send to user
      const userMsg = `✅ Help is on the way!\n\n${volunteer.name} has been notified.\nETA: ~5 minutes\n\n${analysis.suggestedResponse}\n\nYou're not alone. 💜`;
      
      console.log('📤 Sending confirmation to user...');
      await sendSMS(userPhone, userMsg);
      
      console.log('\n✅ DISPATCH COMPLETE');
      
    } else if (!volunteer) {
      console.log('\n⚠️  No volunteers available');
      const fallbackMsg = `We've received your message. ${analysis.suggestedResponse}\n\nIf in immediate danger, call 911.\n\nText CALL ME for fake emergency call.`;
      await sendSMS(userPhone, fallbackMsg);
    } else {
      console.log('\n📋 Lower urgency - providing resources');
      const resourceMsg = `${analysis.suggestedResponse}\n\nResources:\n- Text CALL ME for fake call\n- Call 911 if immediate danger\n- We're here to help 💜`;
      await sendSMS(userPhone, resourceMsg);
    }
    
    console.log('\n═══════════════════════════════════════\n');
    res.status(200).send('<Response></Response>');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    res.status(500).send('<Response></Response>');
  }
});

async function findNearestVolunteer(coords) {
  try {
    const volunteers = await Volunteer.find({
      available: true,
      onDuty: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: 5000
        }
      }
    }).limit(1);
    
    return volunteers[0] || null;
  } catch (error) {
    console.error('Error finding volunteer:', error);
    return null;
  }
}

async function handleFakeCall(userPhone) {
  const message = "Hey! Oh my god, I've been trying to reach you! " +
    "There's a family emergency, you need to come home right now. " +
    "No, it can't wait. I need you here in 20 minutes. Okay, see you soon!";
  
  console.log('📞 Placing fake emergency call...');
  await makeCall(userPhone, message);
  
  setTimeout(async () => {
    await sendSMS(
      userPhone,
      "Fake call complete. Are you safe now?\n\n1 = Yes, I'm safe\n2 = I need help"
    );
  }, 45000);
}

module.exports = router;
