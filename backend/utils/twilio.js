const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(to, message) {
  try {
    // Just try regular SMS - if it fails, we continue anyway
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log(`✅ SMS sent successfully to ${to}`);
    return result;
  } catch (error) {
    // Log but don't crash
    if (error.code === 21408) {
      console.log(`⚠️  SMS blocked for ${to} (Canadian number - trial account limitation)`);
    } else if (error.code === 21211) {
      console.log(`⚠️  Invalid number: ${to}`);
    } else {
      console.log(`⚠️  SMS failed: ${error.message}`);
    }
    
    // Return null but don't throw - system continues
    return null;
  }
}

async function makeCall(to, message) {
  try {
    const twiml = `<Response><Say voice="alice">${message}</Say></Response>`;
    
    const call = await client.calls.create({
      twiml: twiml,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    console.log(`✅ Call placed to ${to}`);
    return call;
  } catch (error) {
    console.log(`⚠️  Call failed: ${error.message}`);
    return null;
  }
}

module.exports = { sendSMS, makeCall };
