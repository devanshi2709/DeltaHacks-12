export interface ConversationFlow {
  [key: string]: {
    response: string;
    options?: { [key: string]: string };
    action?: string;
  };
}

export const flows: ConversationFlow = {
  START: {
    response: `🛡️ SafetyNet HER - You're safe here.

What's happening?

1️⃣ Someone following me
2️⃣ Feel unsafe at location  
3️⃣ Need fake emergency call
4️⃣ Need walking escort
5️⃣ Just want to talk
9️⃣ EMERGENCY - help NOW

Reply with number or describe your situation.`,
    options: {
      '1': 'FOLLOWING',
      '2': 'UNSAFE_LOCATION',
      '3': 'FAKE_CALL',
      '4': 'ESCORT',
      '5': 'TALK',
      '9': 'EMERGENCY'
    }
  },

  FOLLOWING: {
    response: `📍 Location tracking activated.

How close is the person?
A = Right behind me (< 20 feet)
B = Across the street
C = Following but keeping distance
D = Lost sight but still scared

Reply A, B, C, or D`,
    options: {
      'A': 'FOLLOWING_CLOSE',
      'B': 'FOLLOWING_ACROSS',
      'C': 'FOLLOWING_DISTANCE',
      'D': 'FOLLOWING_LOST'
    }
  },

  FOLLOWING_CLOSE: {
    response: `🚨 HIGH PRIORITY DISPATCH

✓ Volunteer Sarah dispatched - ETA 2 min
✓ Backup volunteer alerted
✓ Police on standby (not called yet)

IMMEDIATE ACTIONS:
→ Walk toward people/lights
→ Enter nearest store/restaurant  
→ We're tracking you live

Nearest safe spaces:
📍 Tim Hortons - 0.2 km (OPEN)
📍 Shoppers - 0.3 km (OPEN)

Sarah is wearing a PURPLE JACKET.

Are you able to get to a public place?
YES / NO`,
    action: 'DISPATCH_IMMEDIATE',
    options: {
      'YES': 'SAFE_LOCATION',
      'NO': 'ESCALATE'
    }
  },

  FOLLOWING_ACROSS: {
    response: `✓ Volunteer Maria dispatched - ETA 4 min
✓ Tracking your location

STAY SAFE:
→ Stay on well-lit streets
→ Don't go home if being followed
→ Head toward public places

Options:
A = Call me (fake conversation)
B = Connect me to volunteer now
C = I'm okay, just monitor me

Reply A, B, or C`,
    action: 'DISPATCH_MEDIUM',
    options: {
      'A': 'FAKE_CALL',
      'B': 'CONNECT',
      'C': 'MONITOR'
    }
  },

  FOLLOWING_DISTANCE: {
    response: `✓ Volunteer on standby - 6 min away
✓ Monitoring your location

You're doing great. Keep moving.

Do you want:
A = Volunteer to walk with you
B = Just track me until I'm home
C = Fake call to look busy

Reply A, B, or C`,
    action: 'STANDBY',
    options: {
      'A': 'ESCORT',
      'B': 'GUARDIAN_ANGEL',
      'C': 'FAKE_CALL'
    }
  },

  UNSAFE_LOCATION: {
    response: `Where are you?
A = Waiting at bus stop
B = Walking alone at night
C = Parking lot/garage
D = Other (describe)

Reply A, B, C, or D`,
    options: {
      'A': 'BUS_STOP',
      'B': 'WALKING',
      'C': 'PARKING',
      'D': 'TALK'
    }
  },

  FAKE_CALL: {
    response: `📞 FAKE EMERGENCY CALL READY

Your phone will ring in 10 seconds.

Script:
A = Family emergency (go home)
B = Friend needs you urgently  
C = Work emergency

Reply A, B, or C`,
    options: {
      'A': 'FAKE_CALL_FAMILY',
      'B': 'FAKE_CALL_FRIEND',
      'C': 'FAKE_CALL_WORK'
    }
  },

  FAKE_CALL_FAMILY: {
    response: `✓ Calling you NOW...

[ElevenLabs voice]: "Hey! Where are you?! Mom's in the hospital, you need to come RIGHT NOW!"

After you hang up:
→ Act concerned
→ Say "I have to go, family emergency"
→ Leave immediately

Did you get out safely?
YES / NO`,
    action: 'EXECUTE_FAKE_CALL',
    options: {
      'YES': 'RESOLVED',
      'NO': 'ESCORT'
    }
  },

  ESCORT: {
    response: `✓ ESCORT DISPATCHED

Volunteer: Sarah Martinez
ETA: 4 minutes
Wearing: PURPLE JACKET
Rating: ⭐ 4.9/5

Meeting point:
📍 Your current location

She'll say: "Hey! Sorry I'm late!"

Text ARRIVED when she gets there.`,
    action: 'DISPATCH_ESCORT'
  },

  TALK: {
    response: `I'm here. You're safe to talk.

What's on your mind?

(Type freely - confidential)

If you need help:
→ Text DISPATCH for volunteer
→ Text CALL for fake call
→ Text 911 for police

I'm listening. 💜`,
    action: 'TALK_MODE'
  },

  EMERGENCY: {
    response: `🚨 MAXIMUM PRIORITY

✓ Volunteer dispatched - ETA 2 MIN
✓ Backup alerted  
✓ Police notified (responding)

ARE YOU INJURED?
YES / NO

STAY ON THE LINE.`,
    action: 'EMERGENCY_DISPATCH'
  },

  GUARDIAN_ANGEL: {
    response: `👼 GUARDIAN ANGEL MODE

✓ Tracking your location
✓ Check-in every 5 minutes

Expected arrival time?
(Example: "10 minutes")

We'll text in 5 min.
Reply SAFE if okay.

You're not alone. 💜`,
    action: 'START_GUARDIAN'
  },

  RESOLVED: {
    response: `✓ You're safe! 

Would you like to:
A = File incident report
B = Talk to counselor
C = Close this  

Reply A, B, or C

We're here 24/7. 💜`,
    action: 'RESOLVE_INCIDENT',
    options: {
      'A': 'REPORT',
      'B': 'COUNSELOR',
      'C': 'END'
    }
  }
};
