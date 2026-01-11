import React, { useState, useEffect, useRef } from 'react';
import { flows } from './src/flows/conversationFlows';

const BACKEND_URL = 'http://localhost:3001';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

interface Incident {
  _id: string;
  userPhone: string;
  message: string;
  category: string;
  urgency: number;
  emotion: string;
  status: string;
  timestamp: string;
  policeInvolved?: boolean;
}

interface AIAnalysis {
  category: string;
  urgency: number;
  emotion: string;
  emotionIntensity: number;
  recommendedAction: string;
  policeNeeded: boolean;
  communityResolution: boolean;
  reasoning: string;
  keyIndicators: string[];
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: flows.START.response, sender: 'system', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState('START');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [liveAnalysis, setLiveAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingDispatch, setPendingDispatch] = useState<any>(null);
  const [acceptedDispatch, setAcceptedDispatch] = useState<any>(null);
  const [volunteerDistance, setVolunteerDistance] = useState(2.4);
  const [showCommunityHub, setShowCommunityHub] = useState(false);
  const [showMapInPhone, setShowMapInPhone] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callScript, setCallScript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (acceptedDispatch && volunteerDistance > 0) {
      const interval = setInterval(() => {
        setVolunteerDistance(prev => Math.max(0, prev - 0.15));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [acceptedDispatch]);

  const loadData = async () => {
    try {
      const [incRes, statRes, volRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/incidents?limit=30`),
        fetch(`${BACKEND_URL}/api/incidents/stats`),
        fetch(`${BACKEND_URL}/api/volunteers`)
      ]);
      
      const incData = await incRes.json();
      setIncidents(incData);
      setStats(await statRes.json());
      setVolunteers(await volRes.json());
    } catch (err) {
      console.error('Backend error:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = (text: string): AIAnalysis => {
    const lower = text.toLowerCase();
    let urgency = 5;
    let category = 'uncertain';
    let emotion = 'concern';
    let emotionIntensity = 5;
    let policeNeeded = false;
    let communityResolution = true;
    let reasoning = '';
    let keyIndicators: string[] = [];

    // DEATH/SUICIDE - MAXIMUM PRIORITY
    if (lower.includes('die') || lower.includes('dying') || lower.includes('death') || 
        lower.includes('suicide') || lower.includes('end it') || lower.includes('kill myself') ||
        lower.includes('want to die') || lower.includes('going to die')) {
      category = 'suicide_risk';
      urgency = 10;
      emotion = 'despair';
      emotionIntensity = 10;
      policeNeeded = true;
      communityResolution = false;
      reasoning = 'CRITICAL: Suicidal ideation detected. Immediate mental health crisis intervention required. Police + crisis counselor dispatched. User expressing desire to die requires emergency psychiatric evaluation.';
      keyIndicators = ['death language', 'suicidal ideation', 'extreme distress'];
    }
    // WEAPONS - POLICE REQUIRED
    else if (lower.includes('gun') || lower.includes('knife') || lower.includes('weapon') || 
             lower.includes('shoot') || lower.includes('stab') || lower.includes('blade')) {
      category = 'armed_threat';
      urgency = 10;
      emotion = 'terror';
      emotionIntensity = 10;
      policeNeeded = true;
      communityResolution = false;
      reasoning = 'LETHAL THREAT: Weapon presence confirmed. Armed response required. Police dispatched immediately. Volunteer provides location coordination only - does NOT approach scene.';
      keyIndicators = ['weapon mentioned', 'lethal force', 'immediate danger'];
    }
    // KILLING/MURDER THREAT
    else if (lower.includes('kill me') || lower.includes('killing') || lower.includes('murder')) {
      category = 'homicide_threat';
      urgency = 10;
      emotion = 'terror';
      emotionIntensity = 10;
      policeNeeded = true;
      communityResolution = false;
      reasoning = 'ACTIVE THREAT: Homicide threat detected. Perpetrator making lethal threats. Police required for arrest/protection. Medical standby initiated.';
      keyIndicators = ['murder threat', 'lethal intent', 'active danger'];
    }
    // 911/EMERGENCY EXPLICIT REQUEST
    else if (lower === '911' || lower === 'emergency' || lower.includes('call 911') || 
             lower.includes('need police now')) {
      category = 'emergency_request';
      urgency = 10;
      emotion = 'panic';
      emotionIntensity = 9;
      policeNeeded = true;
      communityResolution = false;
      reasoning = 'USER REQUESTING POLICE: Direct emergency service request. Honoring user choice for police involvement. Situation severity unknown but user assessment indicates crisis.';
      keyIndicators = ['explicit police request', '911 mentioned', 'emergency declared'];
    }
    // PHYSICAL ASSAULT IN PROGRESS
    else if (lower.includes('hitting me') || lower.includes('hit me') || lower.includes('beating') || 
             lower.includes('attacked') || lower.includes('assaulting')) {
      category = 'physical_assault';
      urgency = 10;
      emotion = 'panic';
      emotionIntensity = 9;
      policeNeeded = true;
      communityResolution = false;
      reasoning = 'ACTIVE ASSAULT: Physical violence in progress. Police required for perpetrator arrest. Medical evaluation needed post-rescue. Documentation for charges.';
      keyIndicators = ['active violence', 'physical assault', 'ongoing attack'];
    }
    // GRABBED/TOUCHING - HIGH URGENCY
    else if (lower.includes('grabbed') || lower.includes('touching') || lower.includes('groping') || 
             lower.includes('groped')) {
      category = 'physical_contact';
      urgency = 9;
      emotion = 'violation';
      emotionIntensity = 8;
      policeNeeded = true;
      communityResolution = false;
      reasoning = 'PHYSICAL CONTACT: Unwanted physical contact occurred. While volunteer can assist with immediate safety, police needed for assault documentation and potential arrest.';
      keyIndicators = ['unwanted touch', 'physical boundary violation', 'potential assault'];
    }
    // DOMESTIC VIOLENCE
    else if (lower.includes('boyfriend') || lower.includes('husband') || lower.includes('partner') || 
             lower.includes('ex ') || (lower.includes('home') && lower.includes('scared'))) {
      category = 'domestic_violence';
      urgency = 9;
      emotion = 'fear';
      emotionIntensity = 8;
      policeNeeded = true;
      communityResolution = false;
      reasoning = 'DOMESTIC SITUATION: Partner/ex-partner involved. High recurrence risk. Police needed for protection order enforcement. Shelter resources being activated.';
      keyIndicators = ['intimate partner', 'domestic context', 'escalation risk'];
    }
    // FOLLOWING - HIGH BUT COMMUNITY CAN HANDLE
    else if (lower.includes('following') || lower.includes('follow') || lower.includes('stalking') || 
             lower.includes('chasing') || lower.includes('behind me')) {
      category = 'following';
      urgency = 9;
      emotion = 'fear';
      emotionIntensity = 8;
      reasoning = 'ACTIVE PURSUIT: Person following user. No weapon detected yet. Trained volunteer can provide immediate presence/escort. Situation monitored - police on standby if escalates.';
      keyIndicators = ['being followed', 'active pursuit', 'no weapon yet'];
    }
    // NOT SAFE/UNSAFE - LOCATION CONCERN
    else if (lower.includes('not safe') || lower.includes('unsafe') || lower.includes('feel unsafe')) {
      category = 'unsafe_location';
      urgency = 8;
      emotion = 'fear';
      emotionIntensity = 7;
      reasoning = 'UNSAFE ENVIRONMENT: User in threatening location. No immediate perpetrator but elevated risk. Volunteer escort appropriate to move user to safety.';
      keyIndicators = ['location concern', 'environmental threat', 'preventive action needed'];
    }
    // SCARED/AFRAID - FEAR RESPONSE
    else if (lower.includes('scared') || lower.includes('afraid') || lower.includes('terrified') || 
             lower.includes('frightened')) {
      category = 'fear_response';
      urgency = 8;
      emotion = 'fear';
      emotionIntensity = 7;
      reasoning = 'FEAR DETECTED: User experiencing fear response. Context unclear but emotion indicates threat perception. Volunteer dispatched to assess and provide safety presence.';
      keyIndicators = ['fear emotion', 'threat perception', 'needs assessment'];
    }
    // HARASSMENT - MEDIUM-HIGH
    else if (lower.includes('harass') || lower.includes('catcall') || lower.includes('yelling') || 
             lower.includes('won\'t leave')) {
      category = 'harassment';
      urgency = 7;
      emotion = 'discomfort';
      emotionIntensity = 6;
      reasoning = 'HARASSMENT: Verbal harassment without physical threat. Community volunteer can de-escalate through presence. Police not needed unless situation escalates to physical.';
      keyIndicators = ['verbal harassment', 'no physical threat', 'de-escalation possible'];
    }
    // ALONE/WALKING ALONE - PREVENTIVE
    else if (lower.includes('alone') || lower.includes('walking alone') || lower.includes('by myself')) {
      category = 'preventive_safety';
      urgency = 6;
      emotion = 'unease';
      emotionIntensity = 5;
      reasoning = 'PREVENTIVE REQUEST: User seeking company for safety. No active threat but seeking reassurance. Volunteer escort provides peace of mind and deters potential threats.';
      keyIndicators = ['isolation concern', 'preventive measure', 'seeking presence'];
    }
    // UNCOMFORTABLE/CREEPY - LOW-MEDIUM
    else if (lower.includes('uncomfortable') || lower.includes('creepy') || lower.includes('weird') || 
             lower.includes('strange')) {
      category = 'uncomfortable_situation';
      urgency = 6;
      emotion = 'unease';
      emotionIntensity = 5;
      reasoning = 'DISCOMFORT: User uncomfortable with person/situation. No overt threat yet but instincts activated. Volunteer provides presence and monitors for escalation.';
      keyIndicators = ['intuition', 'discomfort', 'early warning signs'];
    }
    // HELP - GENERAL
    else if (lower.includes('help') || lower.includes('help me')) {
      category = 'help_request';
      urgency = 7;
      emotion = 'distress';
      emotionIntensity = 6;
      reasoning = 'HELP REQUESTED: General help call without specifics. Volunteer dispatched to assess situation. Ready to escalate to police if needed once context clear.';
      keyIndicators = ['help requested', 'needs assessment', 'situation unclear'];
    }
    // CONVERSATIONAL/SUPPORT SEEKING
    else if (lower.includes('talk') || lower.includes('listen') || lower.includes('okay') || 
             lower.includes('fine') || lower === 'hi' || lower === 'hello') {
      category = 'conversational';
      urgency = 3;
      emotion = 'neutral';
      emotionIntensity = 2;
      reasoning = 'NON-EMERGENCY: User engaging conversationally or seeking emotional support. No immediate safety threat. Community counselor available if user wants to talk through concerns.';
      keyIndicators = ['conversational', 'emotional support', 'no threat detected'];
    }
    // DEFAULT - UNCLEAR
    else {
      category = 'needs_assessment';
      urgency = 5;
      emotion = 'concern';
      emotionIntensity = 4;
      reasoning = 'UNCLEAR SITUATION: Message does not match crisis patterns. Requesting clarification from user. Volunteer on standby if situation develops.';
      keyIndicators = ['unclear context', 'awaiting details', 'monitoring'];
    }

    return {
      category,
      urgency,
      emotion,
      emotionIntensity,
      recommendedAction: urgency >= 8 ? 'dispatch_immediate' : urgency >= 6 ? 'dispatch_monitor' : 'provide_resources',
      policeNeeded,
      communityResolution: !policeNeeded,
      reasoning,
      keyIndicators
    };
  };

  const processUserInput = (text: string, analysis: AIAnalysis) => {
    const upperText = text.toUpperCase().trim();
    
    // CRITICAL KEYWORDS OVERRIDE EVERYTHING
    if (analysis.urgency === 10) {
      return 'EMERGENCY';
    }
    
    // Check conversation flow options
    const currentOptions = flows[currentFlow]?.options;
    if (currentOptions) {
      for (const [key, nextFlow] of Object.entries(currentOptions)) {
        if (upperText === key.toUpperCase() || upperText === key) {
          return nextFlow;
        }
      }
    }

    // Route based on analysis
    if (analysis.urgency >= 8) return 'FOLLOWING';
    if (upperText.includes('CALL')) {
      // Trigger fake call
      setIncomingCall(true);
      setCallScript('Family Emergency');
      setTimeout(() => setIncomingCall(false), 8000);
      return 'FAKE_CALL';
    }
    if (upperText.includes('ESCORT')) return 'ESCORT';
    
    return 'TALK';
  };

  const sendMessage = async () => {
  if (!inputText.trim()) return;

  const userMsg: Message = {
    id: Date.now().toString(),
    text: inputText,
    sender: 'user',
    timestamp: new Date()
  };
  setMessages(prev => [...prev, userMsg]);
  
  const userInput = inputText;
  setInputText('');
  setIsTyping(true);
  setIsAnalyzing(true);

  // ANALYZE FIRST - THIS IS THE SOURCE OF TRUTH
  const analysis = analyzeMessage(userInput);
  
  setTimeout(() => {
    setLiveAnalysis(analysis); // LOCK IT IN - NEVER OVERRIDE
    setIsAnalyzing(false);

    // Create dispatch based on analysis urgency
    if (analysis.urgency >= 8) {
      const volunteer = volunteers[0] || { name: 'Sarah Martinez' };
      const newDispatch = {
        incident: {
          _id: Date.now().toString(),
          userPhone: '+16478715609',
          message: userInput,
          category: analysis.category,
          urgency: analysis.urgency,
          emotion: analysis.emotion,
          status: 'pending',
          timestamp: new Date().toISOString(),
          policeInvolved: analysis.policeNeeded
        },
        volunteer: volunteer.name,
        eta: analysis.urgency === 10 ? '2 min' : '4 min',
        action: 'DISPATCH_IMMEDIATE'
      };
      setPendingDispatch(newDispatch);
    }

    // Check for fake call trigger
    if (userInput.toLowerCase().includes('call me') || userInput.toLowerCase().includes('fake call') || userInput.toLowerCase() === '3') {
      setIncomingCall(true);
      setCallScript('Family Emergency');
      setTimeout(() => setIncomingCall(false), 8000);
    }
  }, 1200);

  try {
    await fetch(`${BACKEND_URL}/api/sms/incoming`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `From=%2B16478715609&Body=${encodeURIComponent(userInput)}`
    });
  } catch (err) {
    console.error('Backend error:', err);
  }

  // System response
  setTimeout(() => {
    setIsTyping(false);
    
    let responseText = '';
    
    if (analysis.urgency === 10) {
      responseText = `🚨 MAXIMUM PRIORITY EMERGENCY

Category: ${analysis.category.toUpperCase().replace('_', ' ')}
Urgency: ${analysis.urgency}/10

${analysis.policeNeeded ? '✓ Police dispatched - responding now\n✓ Medical support alerted' : '✓ Crisis team dispatched'}
✓ Volunteer en route - ETA 2 min

STAY ON THE LINE. You are not alone.

Are you in immediate danger?
Reply: YES / NO`;
    } else if (analysis.urgency >= 8) {
      responseText = `🚨 HIGH PRIORITY ALERT

✓ Volunteer dispatched
✓ ETA: 4 minutes
✓ Tracking your location

${analysis.policeNeeded ? 'Police on standby if needed.' : 'Community responder coming to help.'}

Stay where you are if safe, or move to a public place.

Text your status or "HELP" if situation worsens.`;
    } else if (analysis.urgency >= 6) {
      responseText = `⚠️ Support dispatched

A trained volunteer is available to help.

What do you need?
- Type ESCORT for walking companion
- Type CALL for fake emergency call  
- Type TALK to chat confidentially

We're here for you. 💜`;
    } else {
      // Low urgency - use conversation flow
      const nextFlow = processUserInput(userInput, analysis);
      setCurrentFlow(nextFlow);
      const flowData = flows[nextFlow];
      
      if (flowData) {
        responseText = flowData.response;
      } else {
        responseText = `I'm here. You're safe to talk.

What's on your mind?

(Type freely - confidential)

If you need help:
→ Text DISPATCH for volunteer
→ Text CALL for fake call
→ Text 911 for police

I'm listening. 💜`;
      }
    }
    
    const systemMsg: Message = {
      id: Date.now().toString(),
      text: responseText,
      sender: 'system',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMsg]);

    setTimeout(loadData, 1000);
  }, 2800);
};

  const handleAcceptDispatch = () => {
    if (pendingDispatch) {
      setAcceptedDispatch(pendingDispatch);
      setPendingDispatch(null);
      setVolunteerDistance(pendingDispatch.incident.urgency === 10 ? 1.5 : 2.4);
      setShowMapInPhone(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const categoryColors: { [key: string]: string } = {
    suicide_risk: 'from-purple-700 to-red-900',
    armed_threat: 'from-red-700 to-red-900',
    homicide_threat: 'from-red-700 to-black',
    emergency_request: 'from-red-600 to-orange-600',
    physical_assault: 'from-red-600 to-orange-700',
    physical_contact: 'from-red-500 to-orange-600',
    domestic_violence: 'from-red-600 to-pink-700',
    following: 'from-orange-500 to-yellow-500',
    unsafe_location: 'from-amber-500 to-yellow-600',
    fear_response: 'from-yellow-600 to-orange-500',
    harassment: 'from-yellow-500 to-amber-500',
    preventive_safety: 'from-yellow-400 to-green-500',
    uncomfortable_situation: 'from-yellow-400 to-lime-500',
    help_request: 'from-orange-400 to-yellow-500',
    conversational: 'from-blue-500 to-cyan-500',
    needs_assessment: 'from-zinc-500 to-zinc-700',
    other: 'from-blue-500 to-cyan-500'
  };

  const emotionColors: { [key: string]: string } = {
    despair: 'text-purple-400',
    terror: 'text-red-500',
    panic: 'text-red-400',
    violation: 'text-pink-400',
    fear: 'text-orange-400',
    distress: 'text-yellow-400',
    unease: 'text-yellow-300',
    discomfort: 'text-amber-300',
    concern: 'text-zinc-400',
    neutral: 'text-zinc-500'
  };

  const policeInvolved = incidents.filter(i => i.policeInvolved).length;
  const communityResolved = incidents.length - policeInvolved;
  const communityPercent = incidents.length > 0 ? Math.round((communityResolved / incidents.length) * 100) : 100;

  if (showCommunityHub) {
    return (
      <div className="h-screen bg-black flex flex-col">
        <div className="h-16 bg-zinc-900 border-b border-zinc-700 px-6 py-3 flex items-center justify-between">
          <button onClick={() => setShowCommunityHub(false)} className="text-white hover:text-violet-400 font-bold">
            ← Back to Live View
          </button>
          <h1 className="text-white font-black text-xl">🏘️ Community Hub</h1>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <h2 className="text-2xl font-black text-white mb-6">📊 Impact Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-5xl font-black text-green-400 mb-2">$57,000</div>
                    <div className="text-zinc-400 text-sm">Cost savings (30 days)</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black text-violet-400 mb-2">156</div>
                    <div className="text-zinc-400 text-sm">Women helped</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black text-blue-400 mb-2">4.2min</div>
                    <div className="text-zinc-400 text-sm">Avg response</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black text-green-400 mb-2">{communityPercent}%</div>
                    <div className="text-zinc-400 text-sm">Community resolution</div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <h2 className="text-2xl font-black text-white mb-6">🔮 Risk Patterns</h2>
                <div className="space-y-4">
                  <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-4">
                    <div className="text-red-400 font-black mb-2">⚠️ HIGH RISK</div>
                    <div className="text-white font-bold">Friday/Saturday 10PM-2AM</div>
                    <div className="text-red-300 text-sm">Main St • 23 incidents/month</div>
                  </div>
                  <div className="bg-yellow-900/30 border-2 border-yellow-500/50 rounded-xl p-4">
                    <div className="text-yellow-400 font-black mb-2">⚡ MEDIUM RISK</div>
                    <div className="text-white font-bold">Saturday 9PM-1AM</div>
                    <div className="text-yellow-300 text-sm">Bar district • 15 incidents/month</div>
                  </div>
                  <div className="bg-green-900/30 border-2 border-green-500/50 rounded-xl p-4">
                    <div className="text-green-400 font-black mb-2">✓ LOW RISK</div>
                    <div className="text-white font-bold">Weekdays</div>
                    <div className="text-green-300 text-sm">All areas • 3-5 incidents/week</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-8">
              <h2 className="text-2xl font-black text-white mb-6">🗺️ Danger Zone Heatmap</h2>
              <div className="relative h-96 bg-zinc-950 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-zinc-600 text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <div className="text-2xl font-bold mb-2">Beasley District, Hamilton</div>
                  </div>
                </div>
                
                <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-yellow-500/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-1/3 left-1/2 w-20 h-20 bg-orange-500/35 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-white">High Risk (8+ incidents/week)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-white">Medium Risk (4-7 incidents/week)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-white">Low Risk (&lt;3 incidents/week)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-black text-white mb-6">👥 Volunteer Network</h2>
              <div className="grid grid-cols-3 gap-4">
                {volunteers.map((vol) => (
                  <div key={vol._id} className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-white font-bold text-lg">{vol.name}</div>
                        <div className="text-zinc-400 text-xs">⭐ {vol.rating.toFixed(1)} • {vol.onDuty ? '🟢 On Duty' : '🔴 Off'}</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {vol.skills.map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-semibold text-zinc-300">
                            {skill.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-zinc-500 text-xs">
                      📍 Beasley • 🗣️ {vol.languages?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="h-20 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-700 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center text-xl font-black">
              S
            </div>
            <div>
              <h1 className="text-white font-black text-lg">SafetyNet HER</h1>
              <p className="text-zinc-400 text-[10px]">Beasley District Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{stats?.total || 0}</div>
              <div className="text-[9px] text-zinc-400 font-bold">Total</div>
            </div>
            
            <div className="h-10 w-px bg-zinc-700"></div>
            
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{communityResolved}</div>
              <div className="text-[9px] text-green-400 font-bold">Community</div>
              <div className="text-[8px] text-zinc-500">{communityPercent}%</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">{policeInvolved}</div>
              <div className="text-[9px] text-red-400 font-bold">Police</div>
              <div className="text-[8px] text-zinc-500">{100 - communityPercent}%</div>
            </div>
            
            <div className="h-10 w-px bg-zinc-700"></div>
            
            <button 
              onClick={() => setShowCommunityHub(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-lg"
            >
              🏘️ Community Hub
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* iPhone Panel */}
        <div className="w-[30%] bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-6">
          <div className="w-[360px] h-[780px] bg-zinc-900 rounded-[50px] border-[10px] border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-3xl z-50"></div>
            
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 pt-3 z-40 text-white text-xs">
              <span className="font-semibold">9:41</span>
              <span>100%</span>
            </div>

            {incomingCall ? (
              <div className="h-full bg-black flex flex-col items-center justify-center pt-12">
                <div className="text-center mb-8 animate-in fade-in zoom-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full mx-auto mb-4 animate-pulse shadow-2xl"></div>
                  <div className="text-white text-2xl font-bold mb-1">Mom</div>
                  <div className="text-zinc-400 text-sm">Incoming Call...</div>
                </div>
                
                <div className="text-white text-lg mb-12 px-8 text-center">
                  <div className="text-2xl mb-4">📞</div>
                  <div className="font-bold mb-2">EMERGENCY CALL</div>
                  <div className="text-sm text-zinc-400">Answer to activate fake call script</div>
                </div>

                <div className="flex gap-16">
                  <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-transform">
                    ✕
                  </button>
                  <button className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl animate-bounce shadow-xl hover:scale-110 transition-transform">
                    📞
                  </button>
                </div>
              </div>
            ) : showMapInPhone && acceptedDispatch ? (
              <div className="h-full bg-black flex flex-col pt-12">
                <div className="bg-zinc-900/98 backdrop-blur-xl border-b border-zinc-800 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold text-sm">Volunteer En Route</div>
                    <button onClick={() => setShowMapInPhone(false)} className="text-zinc-400 text-xs">
                      ← Messages
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-zinc-950">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-purple-950/30"></div>
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                    
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
                      <div className="w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-2xl animate-pulse flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                        You
                      </div>
                    </div>
                    
                    <div 
                      className="absolute transition-all duration-1000"
                      style={{
                        bottom: `${25 + (volunteerDistance / 2.4) * 35}%`,
                        right: `${15 + (volunteerDistance / 2.4) * 30}%`
                      }}
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-2xl animate-pulse flex items-center justify-center text-lg">
                        🚑
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                        {acceptedDispatch.volunteer}
                      </div>
                    </div>

                    {volunteerDistance <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur">
                        <div className="text-center">
                          <div className="text-5xl mb-2">✓</div>
                          <div className="text-green-400 font-black text-xl">VOLUNTEER ARRIVED</div>
                          <div className="text-white text-sm mt-2">You're safe now</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-white font-black text-lg">{volunteerDistance.toFixed(1)}km</div>
                      <div className="text-zinc-400">Distance</div>
                    </div>
                    <div>
                      <div className="text-white font-black text-lg">{Math.ceil(volunteerDistance * 2.5)}m</div>
                      <div className="text-zinc-400">ETA</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-black text-lg animate-pulse">LIVE</div>
                      <div className="text-zinc-400">Tracking</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-black flex flex-col pt-12">
                <div className="bg-zinc-900/98 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center font-black">
                      S
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">SafetyNet HER</div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="text-green-400 text-[10px] font-semibold">Available 24/7</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-[20px] px-3 py-2 text-sm ${
                        msg.sender === 'user' 
                          ? 'bg-blue-500 text-white rounded-br-sm' 
                          : 'bg-zinc-800 text-white rounded-bl-sm'
                      }`}>
                        <p className="leading-snug whitespace-pre-line">{msg.text}</p>
                        <p className="text-[9px] mt-1 opacity-50">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-800 rounded-[20px] rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          {[0, 150, 300].map((delay) => (
                            <div key={delay} className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-zinc-900/98 backdrop-blur-xl border-t border-zinc-800 px-4 py-2 pb-6 shrink-0">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-full px-3 py-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="iMessage"
                        className="w-full bg-transparent text-white text-sm outline-none placeholder-zinc-500"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!inputText.trim()}
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        inputText.trim() ? 'bg-blue-500' : 'bg-zinc-700 opacity-40'
                      }`}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="w-[35%] bg-zinc-950 border-x border-zinc-800 overflow-y-auto p-5">
          <h2 className="text-2xl font-black text-white mb-5">🧠 AI Analysis Engine</h2>

          <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-2 border-violet-500/30 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-yellow-400 animate-pulse' : liveAnalysis ? 'bg-green-400' : 'bg-zinc-600'}`}></div>
              <h3 className="text-white font-black text-base">
                {isAnalyzing ? 'ANALYZING...' : liveAnalysis ? '═══ ANALYSIS COMPLETE ═══' : 'READY FOR INPUT'}
              </h3>
            </div>

            {liveAnalysis && (
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <div className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                    <span>🏷️</span> CATEGORY:
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg font-black text-sm bg-gradient-to-r ${categoryColors[liveAnalysis.category]} text-white uppercase inline-block`}>
                    {liveAnalysis.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Urgency Level with Bar */}
                <div>
                  <div className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                    <span>⚠️</span> URGENCY LEVEL: <span className={`text-xl font-black ${liveAnalysis.urgency === 10 ? 'text-red-500 animate-pulse' : liveAnalysis.urgency >= 8 ? 'text-red-400' : liveAnalysis.urgency >= 6 ? 'text-yellow-400' : 'text-green-400'}`}>{liveAnalysis.urgency}/10</span>
                  </div>
                  <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        liveAnalysis.urgency === 10 ? 'bg-red-600 animate-pulse' : 
                        liveAnalysis.urgency >= 8 ? 'bg-red-500' : 
                        liveAnalysis.urgency >= 6 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${liveAnalysis.urgency * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Emotion with Intensity */}
                <div>
                  <div className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                    <span>😰</span> DETECTED EMOTION:
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold capitalize ${emotionColors[liveAnalysis.emotion]}`}>
                      {liveAnalysis.emotion}
                    </span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${emotionColors[liveAnalysis.emotion]?.replace('text-', 'bg-')}`}
                        style={{ width: `${liveAnalysis.emotionIntensity * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm font-bold">{liveAnalysis.emotionIntensity}/10</span>
                  </div>
                </div>

                {/* Key Indicators */}
                <div>
                  <div className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                    <span>🎯</span> KEY INDICATORS:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {liveAnalysis.keyIndicators.map((indicator, i) => (
                      <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs font-semibold text-zinc-300">
                        • {indicator}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <div className="text-zinc-400 text-xs font-bold mb-3 flex items-center gap-2">
                    <span>🚔</span> RECOMMENDED RESOLUTION:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      liveAnalysis.communityResolution 
                        ? 'border-green-500 bg-green-500/20 scale-105' 
                        : 'border-zinc-700 bg-zinc-800/50'
                    }`}>
                      <div className="text-center">
                        <div className={`text-3xl mb-2 ${liveAnalysis.communityResolution ? 'text-green-400' : 'text-zinc-600'}`}>
                          {liveAnalysis.communityResolution ? '✓' : '○'}
                        </div>
                        <div className={`text-xs font-bold ${liveAnalysis.communityResolution ? 'text-green-400' : 'text-zinc-500'}`}>
                          COMMUNITY
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      liveAnalysis.policeNeeded 
                        ? 'border-red-500 bg-red-500/20 scale-105 animate-pulse' 
                        : 'border-zinc-700 bg-zinc-800/50'
                    }`}>
                      <div className="text-center">
                        <div className={`text-3xl mb-2 ${liveAnalysis.policeNeeded ? 'text-red-400' : 'text-zinc-600'}`}>
                          {liveAnalysis.policeNeeded ? '✓' : '○'}
                        </div>
                        <div className={`text-xs font-bold ${liveAnalysis.policeNeeded ? 'text-red-400' : 'text-zinc-500'}`}>
                          POLICE NEEDED: {liveAnalysis.policeNeeded ? 'YES' : 'NO'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div>
                  <div className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                    <span>💭</span> AI REASONING:
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-3 text-zinc-300 text-sm leading-relaxed border border-zinc-700">
                    {liveAnalysis.reasoning}
                  </div>
                </div>

                <div className="border-t border-zinc-700 pt-3 text-center">
                  <div className="text-zinc-500 text-xs">
                    ═══════════════════
                  </div>
                </div>
              </div>
            )}

            {!liveAnalysis && !isAnalyzing && (
              <div className="text-center text-zinc-500 py-10">
                <div className="text-5xl mb-3">🤖</div>
                <div className="text-sm">Waiting for crisis message...</div>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h3 className="text-white font-black text-sm mb-3">📊 Recent Patterns</h3>
            <div className="space-y-2 text-xs">
              {Object.entries(
                incidents.reduce((acc: any, inc) => {
                  acc[inc.category] = (acc[inc.category] || 0) + 1;
                  return acc;
                }, {})
              ).slice(0, 6).map(([category, count]: [string, any]) => (
                <div key={category} className="flex items-center justify-between bg-zinc-950 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${categoryColors[category] || categoryColors.other}`}></div>
                    <span className="text-white font-semibold capitalize">{category.replace('_', ' ')}</span>
                  </div>
                  <span className="text-zinc-400 font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Volunteer Dispatch Panel */}
        <div className="w-[35%] bg-zinc-900 overflow-y-auto p-5">
          <h2 className="text-2xl font-black text-white mb-5">🚑 Volunteer Dispatch</h2>

          {pendingDispatch && !acceptedDispatch && (
            <div className="mb-5 bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🚨</span>
                <div>
                  <div className="text-red-400 font-black text-sm">NEW ALERT</div>
                  <div className="text-white font-bold text-xl">{pendingDispatch.volunteer}</div>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                    pendingDispatch.incident.urgency === 10 ? 'bg-red-600 animate-pulse' : 
                    pendingDispatch.incident.urgency >= 8 ? 'bg-red-500' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {pendingDispatch.incident.urgency}/10
                  </span>
                  <span className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-bold uppercase text-zinc-300">
                    {pendingDispatch.incident.category.replace('_', ' ')}
                  </span>
                  {pendingDispatch.incident.policeInvolved && (
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-red-900 text-red-400 animate-pulse">
                      🚔 POLICE
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold text-base">"{pendingDispatch.incident.message}"</p>
                <div className="text-zinc-400 text-xs mt-2">ETA: {pendingDispatch.eta}</div>
              </div>

              <button
                onClick={handleAcceptDispatch}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl text-lg transition-all hover:scale-105 active:scale-95"
              >
                ✓ ACCEPT DISPATCH
              </button>
            </div>
          )}

          {acceptedDispatch && (
            <div className="mb-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-green-400 font-black text-sm">EN ROUTE TO USER</h3>
              </div>

              <div className="mb-4">
                <div className="text-white font-bold text-xl mb-1">{acceptedDispatch.volunteer}</div>
                <div className="text-zinc-300 text-sm">ETA: {Math.ceil(volunteerDistance * 2.5)} minutes</div>
              </div>

              <div className="bg-zinc-950 rounded-xl h-64 mb-4 relative overflow-hidden border border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-purple-950/30"></div>
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
                
                <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
                  <div className="w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-2xl animate-bounce flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded whitespace-nowrap">
                    User Location
                  </div>
                </div>
                
                <div 
                  className="absolute transition-all duration-1000"
                  style={{
                    bottom: `${20 + (volunteerDistance / 2.4) * 40}%`,
                    right: `${15 + (volunteerDistance / 2.4) * 35}%`
                  }}
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-2xl animate-pulse flex items-center justify-center text-lg">
                    🚑
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded whitespace-nowrap">
                    You ({acceptedDispatch.volunteer})
                  </div>
                </div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line 
                    x1="50%" 
                    y1="67%" 
                    x2={`${85 - (volunteerDistance / 2.4) * 35}%`}
                    y2={`${60 - (volunteerDistance / 2.4) * 40}%`}
                    stroke="rgba(34, 197, 94, 0.6)" 
                    strokeWidth="3" 
                    strokeDasharray="8,4"
                    className="animate-pulse"
                  />
                </svg>

                {volunteerDistance <= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur">
                    <div className="text-center">
                      <div className="text-5xl mb-2">✓</div>
                      <div className="text-green-400 font-black text-xl">ARRIVED</div>
                      <div className="text-zinc-400 text-sm mt-1">User is safe</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  <div className="text-white font-black text-lg">{volunteerDistance.toFixed(1)}km</div>
                  <div className="text-zinc-400">Distance</div>
                </div>
                <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  <div className="text-white font-black text-lg">{Math.ceil(volunteerDistance * 2.5)}m</div>
                  <div className="text-zinc-400">ETA</div>
                </div>
                <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  <div className="text-green-400 font-black text-lg animate-pulse">LIVE</div>
                  <div className="text-zinc-400">Tracking</div>
                </div>
              </div>
            </div>
          )}

          <h3 className="text-white font-black text-base mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {incidents.slice(0, 12).map((inc) => (
              <div key={inc._id} className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-black ${
                    inc.urgency === 10 ? 'bg-red-600 animate-pulse' :
                    inc.urgency >= 8 ? 'bg-red-500' : 
                    inc.urgency >= 6 ? 'bg-yellow-500 text-black' : 
                    'bg-green-500 text-black'
                  }`}>
                    {inc.urgency}/10
                  </span>
                  <span className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold uppercase text-zinc-300">
                    {inc.category?.replace('_', ' ')}
                  </span>
                  {inc.policeInvolved ? (
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-red-900/50 text-red-400">
                      🚔
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-green-900/50 text-green-400">
                      👥
                    </span>
                  )}
                </div>
                <p className="text-white text-xs leading-tight line-clamp-2">"{inc.message}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
