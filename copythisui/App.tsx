import React, { useEffect, useRef, useState } from 'react';
import { flows } from '../src/flows/conversationFlows';
import FakeCall from './FakeCall';
import TorontoSafetyMap from './TorontoSafetyMap';

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
  locationHint?: string;
}

interface AIAnalysis {
  category: string;
  urgency: number;
  emotion: string;
  recommendedAction: string;
  policeNeeded: boolean;
  communityResolution: boolean;
  suggestedResponse?: string;
}

type ViewMode = 'live' | 'community';

const categoryColors: { [key: string]: string } = {
  life_threatening: 'from-red-700 to-red-900',
  domestic_violence: 'from-red-600 to-pink-700',
  assault: 'from-red-500 to-orange-600',
  sexual_assault: 'from-red-600 to-purple-700',
  following: 'from-orange-500 to-yellow-500',
  harassment: 'from-pink-500 to-pink-700',
  unsafe_location: 'from-yellow-400 to-amber-500',
  intoxicated_person: 'from-orange-400 to-yellow-600',
  uncomfortable: 'from-yellow-400 to-lime-500',
  other: 'from-blue-500 to-cyan-500',
};

const LOCATION_LABELS = [
  'Queen & Spadina • Downtown Toronto',
  'King & Bay • Financial District',
  'Dundas & Yonge • Eaton Centre',
  'Front & York • Union Station',
  'Bathurst & King • Fashion District',
  'Bloor & Yonge • Yorkville',
  'Harbourfront • Queens Quay',
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: flows.START.response, sender: 'system', timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState('START');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [liveAnalysis, setLiveAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [acceptedDispatch, setAcceptedDispatch] = useState<any>(null);
  const [volunteerDistance, setVolunteerDistance] = useState(2.4);
  const [volunteerTab, setVolunteerTab] = useState<'feed' | 'map' | 'history'>('feed');
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [incidentStatuses, setIncidentStatuses] = useState<Record<string, string>>({});
  const [missionThread, setMissionThread] = useState<string[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [volunteerLocked, setVolunteerLocked] = useState(true);
  const [volunteerNotif, setVolunteerNotif] = useState<string | null>(null);
  const [volunteerWakeStage, setVolunteerWakeStage] = useState<'hidden' | 'slide' | 'lock' | 'notif' | 'app' | 'awake'>('hidden');
  const [showVolunteerPhone, setShowVolunteerPhone] = useState(false);
  const [showVolunteerAlert, setShowVolunteerAlert] = useState(false);
  const [volunteerCanOpen, setVolunteerCanOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('live');
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [incidentFilter, setIncidentFilter] = useState<'all' | '24h' | '7d'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (acceptedDispatch && volunteerDistance > 0) {
      const interval = setInterval(() => {
        setVolunteerDistance((prev) => Math.max(0, prev - 0.15));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [acceptedDispatch, volunteerDistance]);

  useEffect(() => {
    if (acceptedDispatch?.incident?._id) {
      setActiveMissionId(acceptedDispatch.incident._id);
      setIncidentStatuses((prev) => ({ ...prev, [acceptedDispatch.incident._id]: 'accepted' }));
      setVolunteerTab('map');
      setVolunteerLocked(false);
    }
  }, [acceptedDispatch]);

  const loadData = async () => {
    try {
      const [incRes, statRes, volRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/incidents?limit=30`),
        fetch(`${BACKEND_URL}/api/incidents/stats`),
        fetch(`${BACKEND_URL}/api/volunteers`),
      ]);

      const incData = await incRes.json();
      setIncidents(incData);
      setStats(await statRes.json());
      setVolunteers(await volRes.json());
      setIncidentStatuses((prev) => {
        const next = { ...prev };
        incData.forEach((i: Incident) => {
          if (!next[i._id]) next[i._id] = i.status;
        });
        return next;
      });
    } catch (err) {
      console.error('Backend error:', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processUserInput = (text: string) => {
    const upperText = text.toUpperCase().trim();
    const currentOptions = flows[currentFlow]?.options;

    if (currentOptions) {
      for (const [key, nextFlow] of Object.entries(currentOptions)) {
        if (upperText === key.toUpperCase() || upperText === key) {
          return nextFlow;
        }
      }
    }

    if (upperText.includes('KILL') || upperText.includes('GUN') || upperText.includes('KNIFE')) return 'EMERGENCY';
    if (upperText.includes('UNSAFE') || upperText.includes('HELP') || upperText.includes('SCARED') || upperText.includes('FOLLOWING')) return 'FOLLOWING';
    if (upperText.includes('CALL')) return 'FAKE_CALL';
    if (upperText.includes('ESCORT') || upperText.includes('WALK')) return 'ESCORT';
    if (upperText.includes('TALK')) return 'TALK';
    if (upperText.includes('EMERGENCY') || upperText === '9') return 'EMERGENCY';
    if (upperText.includes('HARASS') || upperText.includes('CATCALL')) return 'UNSAFE_LOCATION';
    if (upperText.includes('DRUNK') || upperText.includes('BAR')) return 'BAR_EXIT_STRATEGY';
    if (upperText.includes('HOME') || upperText.includes('ALONE')) return 'GUARDIAN_ANGEL';
    if (upperText.includes('BUS') || upperText.includes('WAITING')) return 'UNSAFE_BUS_STOP';

    return 'TALK';
  };

  const expandUserMessage = (text: string) => {
    const t = text.trim();
    const upper = t.toUpperCase();
    const optionMap: Record<string, string> = {
      '1': 'Someone is following me',
      '2': 'I feel threatened where I am',
      '3': 'I need to leave now',
      '4': 'Check-in / stay with me',
      '5': 'Emergency now',
      'A': 'Send volunteer escort',
      'B': 'Call me (fake urgent call)',
      'C': 'Stay on text & check in',
      'D': 'Emergency help',
    };
    if (optionMap[upper]) return optionMap[upper];
    return t;
  };

  const triggerVolunteerWake = (alertText: string) => {
    if (!showVolunteerPhone) setShowVolunteerPhone(true);
    setVolunteerLocked(true);
    setVolunteerNotif(alertText);
    setShowVolunteerAlert(false);
    setVolunteerCanOpen(false);
    
    // Stage 1: Slide up from bottom (visible but black)
    setVolunteerWakeStage('slide');
    
    // Stage 2: After slide is complete, show clock on lock screen
    setTimeout(() => {
      setVolunteerWakeStage('lock');
    }, 1200);
    
    // Stage 3: Show alert notification on lock screen
    setTimeout(() => {
      setVolunteerWakeStage('notif');
      setShowVolunteerAlert(true);
    }, 2800);
    
    // Stage 4: Enable clicking after alert has been visible
    setTimeout(() => {
      setVolunteerCanOpen(true);
    }, 3800);
  };

  const handleVolunteerOpen = () => {
    if (!volunteerCanOpen) return;
    
    // Close the alert notification first
    setShowVolunteerAlert(false);
    
    // Brief pause before opening app
    setTimeout(() => {
      setVolunteerWakeStage('app');
      
      // Open the app after animation
      setTimeout(() => {
        setVolunteerLocked(false);
        setVolunteerWakeStage('awake');
        setVolunteerNotif(null);
        setVolunteerCanOpen(false);
      }, 1000);
    }, 300);
  };

  const analyzeMessage = (text: string): AIAnalysis => {
    const lower = text.toLowerCase();
    let urgency = 5;
    let category = 'other';
    let emotion = 'concern';
    let policeNeeded = false;
    let communityResolution = true;

    if (
      lower.includes('kill') ||
      lower.includes('murder') ||
      lower.includes('gun') ||
      lower.includes('knife') ||
      lower.includes('weapon') ||
      lower.includes('shoot')
    ) {
      category = 'life_threatening';
      urgency = 10;
      emotion = 'terror';
      policeNeeded = true;
      communityResolution = false;
    } else if (
      lower.includes('domestic') ||
      lower.includes('abuse') ||
      lower.includes('hit me') ||
      lower.includes('beating') ||
      lower.includes('partner') ||
      lower.includes('boyfriend') ||
      lower.includes('husband') ||
      lower.includes('ex')
    ) {
      category = 'domestic_violence';
      urgency = 10;
      emotion = 'fear';
      policeNeeded = true;
      communityResolution = false;
    } else if (
      lower.includes('assault') ||
      lower.includes('attack') ||
      lower.includes('grabbed') ||
      lower.includes('touching') ||
      lower.includes('groping') ||
      lower.includes('pushed')
    ) {
      category = 'assault';
      urgency = 10;
      emotion = 'panic';
      policeNeeded = true;
      communityResolution = false;
    } else if (lower.includes('rape') || lower.includes('sexual') || lower.includes('molest')) {
      category = 'sexual_assault';
      urgency = 10;
      emotion = 'trauma';
      policeNeeded = true;
      communityResolution = false;
    } else if (lower.includes('follow') || lower.includes('stalking') || lower.includes('chasing')) {
      category = 'following';
      urgency = 9;
      emotion = 'fear';
    } else if (
      lower.includes('harass') ||
      lower.includes('catcall') ||
      lower.includes('yelling') ||
      lower.includes("won't leave me alone")
    ) {
      category = 'harassment';
      urgency = 7;
      emotion = 'discomfort';
    } else if (
      lower.includes('unsafe') ||
      lower.includes('scared') ||
      lower.includes('alone') ||
      lower.includes('dark') ||
      lower.includes('isolated')
    ) {
      category = 'unsafe_location';
      urgency = 8;
      emotion = 'fear';
    } else if (lower.includes('drunk') || lower.includes('intoxicated') || lower.includes('high')) {
      category = 'intoxicated_person';
      urgency = 7;
      emotion = 'concern';
    } else if (lower.includes('uncomfortable') || lower.includes('creepy') || lower.includes('weird')) {
      category = 'uncomfortable';
      urgency = 6;
      emotion = 'unease';
    } else if (lower.includes('emergency') || lower.includes('911') || lower.includes('help now')) {
      urgency = 10;
      policeNeeded = true;
      communityResolution = false;
    }

    return {
      category,
      urgency,
      emotion,
      recommendedAction: urgency >= 8 ? 'dispatch_immediate' : 'provide_resources',
      policeNeeded,
      communityResolution: !policeNeeded,
    };
  };

  const normalizeAIResponse = (analysis: any, text: string): AIAnalysis => {
    if (!analysis) return analyzeMessage(text);
    const recommendedAction = analysis.recommendedAction || analysis.recommended_action || 'provide_resources';
    const policeNeeded =
      analysis.policeNeeded !== undefined
        ? analysis.policeNeeded
        : analysis.police_needed !== undefined
        ? analysis.police_needed
        : recommendedAction === 'dispatch_immediate' && (analysis.urgency ?? 0) >= 9;

    const base = analyzeMessage(text);
    const category = analysis.category && analysis.category !== 'other' ? analysis.category : base.category;

    return {
      category,
      urgency: Number(analysis.urgency ?? 5),
      emotion: analysis.emotion || base.emotion,
      recommendedAction,
      policeNeeded,
      communityResolution: analysis.communityResolution ?? !policeNeeded,
      suggestedResponse: analysis.suggestedResponse || analysis.suggested_response || base.recommendedAction,
    };
  };

  const fetchLiveAnalysis = async (text: string): Promise<AIAnalysis> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sms/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return normalizeAIResponse(data.analysis, text);
    } catch (err) {
      console.error('Gemini analysis failed, falling back to keywords', err);
      return analyzeMessage(text);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const userInput = inputText;
    setInputText('');
    setIsTyping(true);
    setIsAnalyzing(true);

    if (userInput.toUpperCase().includes('CALL')) {
      setShowFakeCall(true);
    }

    const displayText = expandUserMessage(userInput);

    const analysis = await fetchLiveAnalysis(displayText);
    setLiveAnalysis(analysis);
    setIsAnalyzing(false);

    // If there is an active mission, append to its transcript instead of creating new queue entry
    const currentMissionId = acceptedDispatch?.incident?._id || activeMissionId || activeCaseId;
    if (currentMissionId) {
      setMissionThread((prev) => [...prev, `Victim: ${displayText}`]);
    } else {
      const newIncident: Incident = {
        _id: Date.now().toString(),
        userPhone: '+16478715609',
        message: displayText,
        category: analysis.category,
        urgency: analysis.urgency,
        emotion: analysis.emotion,
        status: 'open',
        timestamp: new Date().toISOString(),
        policeInvolved: analysis.policeNeeded,
        locationHint: LOCATION_LABELS[Math.floor(Math.random() * LOCATION_LABELS.length)],
      };
      setIncidents((prev) => [newIncident, ...prev]);
      setIncidentStatuses((prev) => ({ ...prev, [newIncident._id]: 'open' }));
      setActiveCaseId(newIncident._id);
      setMissionThread([`Victim: ${displayText}`]);
      setVolunteerTab('feed');
      setVolunteerLocked(true);
      setVolunteerNotif(`ALERT: ${analysis.category.replace('_', ' ') || 'Safety'}`);
      triggerVolunteerWake(`ALERT: ${analysis.category.replace('_', ' ') || 'Safety'}`);
    }

    try {
      await fetch(`${BACKEND_URL}/api/sms/incoming`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          From: '+16478715609',
          Body: userInput,
          analysis,
        }),
      });
    } catch (err) {
      console.error('Backend error:', err);
    }

    setTimeout(() => {
      const nextFlow = processUserInput(userInput);
      setCurrentFlow(nextFlow);

      const flowData = flows[nextFlow];
      if (flowData) {
        setIsTyping(false);

        const systemMsg: Message = {
          id: Date.now().toString(),
          text: flowData.response,
          sender: 'system',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMsg]);
      }

      setTimeout(loadData, 800);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const statusForIncident = (inc: Incident) => incidentStatuses[inc._id] || inc.status;

  const handleVolunteerAction = (id: string, newStatus: string) => {
    setIncidentStatuses((prev) => ({ ...prev, [id]: newStatus }));
    setIncidents((prev) => prev.map((inc) => (inc._id === id ? { ...inc, status: newStatus } : inc)));
    const targetIncident = incidents.find((i) => i._id === id);
    if (newStatus === 'accepted') {
      if (targetIncident) {
        const volunteer = volunteers[0] || { name: 'Sarah M.' };
        setAcceptedDispatch({
          incident: targetIncident,
          volunteer: volunteer.name,
          eta: targetIncident.urgency >= 9 ? '2 min' : '4 min',
          action: 'DISPATCH_IMMEDIATE',
        });
        setActiveMissionId(id);
        setVolunteerTab('map');
        setVolunteerDistance(targetIncident.urgency >= 9 ? 1.5 : 2.4);
        setMissionThread([`Victim: ${targetIncident.message}`]);
      }
    }
    if (newStatus === 'resolved') {
      if (activeMissionId === id) setActiveMissionId(null);
      if (acceptedDispatch?.incident?._id === id) setAcceptedDispatch(null);
      setMissionThread([]);
    }
  };

  const policeInvolved = incidents.filter((i) => i.policeInvolved).length;
  const communityResolved = incidents.length - policeInvolved;
  const communityPercent = incidents.length > 0 ? Math.round((communityResolved / incidents.length) * 100) : 100;
  const displayLiveIncidents = stats?.total || incidents.length || 18;
  const displayPoliceInvolved = policeInvolved || 4;
  const displayCommunityResolved = incidents.length ? communityResolved : 14;
  const displayVolunteersOnDuty = volunteers.filter((v) => v.onDuty).length || 9;
  const displayCommunityPercent =
    incidents.length > 0
      ? communityPercent
      : Math.round((displayCommunityResolved / Math.max(displayCommunityResolved + displayPoliceInvolved, 1)) * 100);
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const isHighRiskTime = (dayOfWeek === 5 || dayOfWeek === 6) && hour >= 22;
  const activeMission = acceptedDispatch?.incident || incidents.find((i) => i._id === activeMissionId) || null;
  const resolvedIncidents = incidents.filter((i) => statusForIncident(i) === 'resolved');
  const volunteerHistory = resolvedIncidents.length
    ? resolvedIncidents
    : [
        {
          _id: 'demo-1',
          category: 'escort_completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          userPhone: '',
          message: 'Escorted rider to streetcar safely',
          urgency: 6,
          emotion: 'relief',
          status: 'resolved',
          policeInvolved: false,
          locationHint: 'Queen & Spadina',
        } as Incident,
        {
          _id: 'demo-2',
          category: 'harassment',
          timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
          userPhone: '',
          message: 'Catcalling outside a bar — walked victim to rideshare',
          urgency: 7,
          emotion: 'anxious',
          status: 'resolved',
          policeInvolved: false,
          locationHint: 'King & Bathurst',
        } as Incident,
        {
          _id: 'demo-3',
          category: 'following',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          userPhone: '',
          message: 'Stalker reported, monitored until safe handoff',
          urgency: 8,
          emotion: 'alert',
          status: 'resolved',
          policeInvolved: true,
          locationHint: 'Union Station',
        } as Incident,
      ];
  const filteredIncidents = incidents
    .filter((inc) => {
      if (incidentFilter === 'all') return true;
      const ts = new Date(inc.timestamp).getTime();
      const diffHours = (Date.now() - ts) / (1000 * 60 * 60);
      if (incidentFilter === '24h') return diffHours <= 24;
      if (incidentFilter === '7d') return diffHours <= 24 * 7;
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const fallbackIncidents: Incident[] = [
    {
      _id: 'past-1',
      category: 'following',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      userPhone: '',
      message: 'Reported being followed leaving Ossington bar — requested check-in until rideshare arrived.',
      urgency: 8,
      emotion: 'fear',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Ossington & Queen • West Queen West',
    } as Incident,
    {
      _id: 'past-2',
      category: 'assault',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      userPhone: '',
      message: 'Grabbed near alley; escalated to 911 and stayed until responders arrived.',
      urgency: 9,
      emotion: 'panic',
      status: 'resolved',
      policeInvolved: true,
      locationHint: 'Dundas & Yonge • Eaton Centre',
    } as Incident,
    {
      _id: 'past-3',
      category: 'unsafe_location',
      timestamp: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
      userPhone: '',
      message: 'Felt unsafe walking through dim parking lot; dispatched escort to transit hub.',
      urgency: 6,
      emotion: 'concern',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Front & York • Union Station',
    } as Incident,
    {
      _id: 'past-4',
      category: 'harassment',
      timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      userPhone: '',
      message: 'Group catcalling outside club; volunteer stayed on line and guided to safe pickup.',
      urgency: 7,
      emotion: 'unease',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'King & Bathurst • Entertainment District',
    } as Incident,
    {
      _id: 'past-5',
      category: 'following',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      userPhone: '',
      message: 'Believed to be followed between subway exits; camera share and check-ins until home.',
      urgency: 8,
      emotion: 'fear',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Bloor & Yonge • Yorkville',
    } as Incident,
    {
      _id: 'past-6',
      category: 'assault',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
      userPhone: '',
      message: 'Shoved near ATM vestibule; escalated to police and stayed on until officers arrived.',
      urgency: 9,
      emotion: 'panic',
      status: 'resolved',
      policeInvolved: true,
      locationHint: 'King & Bay • Financial District',
    } as Incident,
    {
      _id: 'past-7',
      category: 'intoxicated_person',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      userPhone: '',
      message: 'Intoxicated person refusing to leave; kept line open and guided to staffed venue.',
      urgency: 6,
      emotion: 'concern',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Harbourfront • Queens Quay',
    } as Incident,
    {
      _id: 'past-8',
      category: 'domestic_violence',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      userPhone: '',
      message: 'Requested silent support during domestic dispute; patched to authorities.',
      urgency: 10,
      emotion: 'fear',
      status: 'resolved',
      policeInvolved: true,
      locationHint: 'Bathurst & King • Fashion District',
    } as Incident,
    {
      _id: 'past-9',
      category: 'unsafe_location',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      userPhone: '',
      message: 'Lost in parking garage with poor lighting; guided to exit and rideshare.',
      urgency: 6,
      emotion: 'concern',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Union Station Parkade',
    } as Incident,
    {
      _id: 'past-10',
      category: 'harassment',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      userPhone: '',
      message: 'Persistent verbal harassment on streetcar; volunteer rode along via call.',
      urgency: 7,
      emotion: 'anxious',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Queen & Spadina • 501 Streetcar',
    } as Incident,
    {
      _id: 'past-11',
      category: 'following',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
      userPhone: '',
      message: 'Shadowed through PATH; advised to enter staffed lobby and wait with security.',
      urgency: 8,
      emotion: 'alert',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Bay & Wellington • PATH',
    } as Incident,
    {
      _id: 'past-12',
      category: 'assault',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString(),
      userPhone: '',
      message: 'Grabbed arm near alley; escalated to 911 and stayed until responders arrived.',
      urgency: 9,
      emotion: 'panic',
      status: 'resolved',
      policeInvolved: true,
      locationHint: 'Kensington Market',
    } as Incident,
    {
      _id: 'past-13',
      category: 'unsafe_location',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
      userPhone: '',
      message: 'Power outage in stairwell; guided to lit exit with building concierge looped in.',
      urgency: 6,
      emotion: 'concern',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'St. Clair & Yonge • Condo block',
    } as Incident,
    {
      _id: 'past-14',
      category: 'harassment',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      userPhone: '',
      message: 'Ride-share driver made unwanted comments; stayed on line and shared plate.',
      urgency: 7,
      emotion: 'unease',
      status: 'resolved',
      policeInvolved: true,
      locationHint: 'Pearson Pickup • T1',
    } as Incident,
    {
      _id: 'past-15',
      category: 'intoxicated_person',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
      userPhone: '',
      message: 'Unwanted contact from intoxicated patron; coordinated exit with staff.',
      urgency: 6,
      emotion: 'discomfort',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'College & Bathurst • Bar strip',
    } as Incident,
    {
      _id: 'past-16',
      category: 'following',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      userPhone: '',
      message: 'Bicycle followed slowly; rerouted to well-lit arterial and met by friend.',
      urgency: 8,
      emotion: 'fear',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Lake Shore & Parliament',
    } as Incident,
    {
      _id: 'past-17',
      category: 'harassment',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 55).toISOString(),
      userPhone: '',
      message: 'Unwanted filming on subway platform; notified TTC special constable.',
      urgency: 7,
      emotion: 'annoyed',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Bloor-Yonge Station',
    } as Incident,
    {
      _id: 'past-18',
      category: 'unsafe_location',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
      userPhone: '',
      message: 'Dim laneway shortcut felt unsafe; rerouted with live map and timed check-ins.',
      urgency: 6,
      emotion: 'concern',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Queen & Sherbourne',
    } as Incident,
    {
      _id: 'past-19',
      category: 'domestic_violence',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 65).toISOString(),
      userPhone: '',
      message: 'Requested silent exit plan; coordinated with shelter intake and police.',
      urgency: 10,
      emotion: 'fear',
      status: 'resolved',
      policeInvolved: true,
      locationHint: 'Midtown East',
    } as Incident,
    {
      _id: 'past-20',
      category: 'harassment',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
      userPhone: '',
      message: 'Repeated unwanted approaches outside convenience store; store staff looped in.',
      urgency: 7,
      emotion: 'unease',
      status: 'resolved',
      policeInvolved: false,
      locationHint: 'Bloor & Dufferin',
    } as Incident,
  ];

  const pastIncidentsDisplay: Incident[] =
    filteredIncidents.length >= 18
      ? filteredIncidents
      : [...filteredIncidents, ...fallbackIncidents].slice(0, 20);

  const renderMessageContent = (text: string) => {
    const rawLines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    let lines = rawLines;

    // If message is a single line but contains numbered segments, split into pseudo bullets
    if (rawLines.length === 1) {
      const splitByNumbers = text.split(/(?=\b\d+[.)]\s+)/).map((l) => l.trim()).filter(Boolean);
      if (splitByNumbers.length > 1) {
        lines = splitByNumbers;
      }
    }

    const bulletish = lines.length > 1 && lines.every((l) => /^\s*([0-9]+[.)]|[-•])\s+/.test(l));

    if (!bulletish) {
      return <span className="whitespace-pre-line">{text}</span>;
    }

    return (
      <ul className="list-disc list-inside space-y-1 text-[13px]">
        {lines.map((l, idx) => {
          const cleaned = l.replace(/^\s*([0-9]+[.)]|[-•])\s+/, '');
          return <li key={idx}>{cleaned}</li>;
        })}
      </ul>
    );
  };

  const personaNav: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'live', label: 'SMS + Volunteer', icon: '📱' },
    { id: 'community', label: 'Community Ops', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans">
      <style>{`
        @keyframes slideInFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes gentleBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes tapPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        .animate-slide-in-bottom {
          animation: slideInFromBottom 0.8s ease-out forwards;
        }
        
        .animate-gentle-bounce {
          animation: gentleBounce 2s infinite ease-in-out;
        }
        
        .animate-tap-pulse {
          animation: tapPulse 1.5s infinite ease-in-out;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <header className="h-16 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-black/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6b4ad8] flex items-center justify-center font-black text-xl shadow-lg shadow-violet-500/30 border border-white/10">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path
                d="M12 21s-6.5-3.8-9-8.2C1.1 11.6 1 10 1 9a5 5 0 019-3 5 5 0 019 3c0 1-.1 2.6-2 3.8C18.5 17.2 12 21 12 21z"
                fill="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">SafetyNet</p>
            <p className="text-base font-black text-white -mt-1">Safety Dispatch Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
          {personaNav.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeView === tab.id ? 'bg-white text-black shadow-lg shadow-violet-500/20' : 'text-zinc-300 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="bg-gradient-to-br from-[#0b0b10] via-[#0f0a15] to-[#0b0b10] rounded-[32px] border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] p-4 lg:p-6">
          {activeView === 'live' && (
            <div className={`grid gap-6 ${showVolunteerPhone ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
              {/* Survivor Phone */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-[360px] aspect-[9/19] bg-gradient-to-b from-[#e2e2e7] via-[#d1d1d6] to-[#e2e2e7] rounded-[3.5rem] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(255,255,255,0.1)] border-[4px] border-[#a1a1aa] ring-1 ring-white/20 flex flex-col overflow-hidden">
                  <div className="absolute left-[-2px] top-24 w-[3px] h-12 bg-[#a1a1aa] rounded-r-sm"></div>
                  <div className="absolute left-[-2px] top-40 w-[3px] h-16 bg-[#a1a1aa] rounded-r-sm"></div>
                  <div className="absolute left-[-2px] top-60 w-[3px] h-16 bg-[#a1a1aa] rounded-r-sm"></div>
                  <div className="absolute right-[-2px] top-40 w-[3px] h-24 bg-[#a1a1aa] rounded-l-sm"></div>

                  <div className="flex-1 bg-white rounded-[2.8rem] rounded-t-[3.2rem] overflow-hidden flex flex-col relative text-black shadow-inner border-[6px] border-black">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-50 flex items-center justify-end pr-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                    </div>

                    <div className="pt-10 pb-3 border-b border-zinc-200 flex flex-col items-center shrink-0 bg-[#F6F6F6]/90 backdrop-blur-xl z-40 rounded-t-[2.6rem] overflow-hidden">
                      <div className="absolute right-3 top-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-[10px] font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10c1.657 0 3-1.567 3-3.5S13.657 3 12 3 9 4.567 9 6.5 10.343 10 12 10z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 21a6.5 6.5 0 0113 0z" />
                        </svg>
                        <span>Location On</span>
                      </div>
                      <div className="w-full flex justify-between items-center px-4 mb-1">
                        <button className="text-[#007AFF] flex items-center gap-0.5">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                          <span className="text-base">9</span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <button className="text-[#007AFF] text-sm font-medium opacity-0">Edit</button>
                      </div>
                      <p className="text-[11px] font-bold text-zinc-900 leading-none">SafetyNet</p>
                      <div className="flex items-center gap-1 opacity-60 mt-0.5">
                        <span className="text-[9px] text-zinc-500 font-medium">905-323-SAFE</span>
                        <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-1">Location shared with Dad & Sister • stay on line</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-6 space-y-3 bg-white scroll-smooth no-scrollbar">
                      <div className="flex justify-center mb-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Today</span>
                      </div>

                      {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[82%] p-2.5 px-4 text-[14px] leading-[1.35] ${
                              m.sender === 'user'
                                ? 'bg-[#007AFF] text-white rounded-[18px] rounded-br-[4px] font-normal shadow-sm'
                                : 'bg-[#E9E9EB] text-black rounded-[18px] rounded-bl-[4px] font-normal shadow-sm'
                            }`}
                          >
                            {renderMessageContent(m.text)}
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-[#E9E9EB] p-2.5 px-4 rounded-[18px] rounded-bl-[4px] flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    <div className="px-3 pb-8 pt-2 bg-white flex gap-2 items-center border-t border-zinc-100">
                      <button className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="iMessage"
                          className="w-full bg-white border border-zinc-200 rounded-full py-2 px-4 pr-10 focus:outline-none text-[15px] text-black placeholder-zinc-400 transition-all focus:border-zinc-300"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!inputText.trim()}
                          className={`absolute right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            inputText.trim() ? 'bg-[#007AFF] text-white' : 'bg-zinc-100 text-zinc-300'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/10 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* AI Analysis Center */}
              <div className="hidden lg:flex">
                <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">AI Analysis</p>
                      <p className="text-lg font-black text-white">Gemini Safety Engine</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isAnalyzing ? 'bg-amber-500/20 text-amber-200 animate-pulse' : liveAnalysis ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-zinc-300'}`}>
                      {isAnalyzing ? 'Processing' : liveAnalysis ? 'Complete' : 'Ready'}
                    </span>
                  </div>

                  {liveAnalysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-semibold">Category</span>
                        <span className={`px-2 py-1 rounded-full text-[11px] font-black bg-gradient-to-r ${categoryColors[liveAnalysis.category] || categoryColors.other} text-white uppercase`}>
                          {liveAnalysis.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400 font-semibold">Urgency</span>
                          <span className={`text-xl font-black ${liveAnalysis.urgency >= 9 ? 'text-red-400' : 'text-white'}`}>{liveAnalysis.urgency}/10</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                          <div
                            className={`h-full ${liveAnalysis.urgency >= 9 ? 'bg-red-500' : liveAnalysis.urgency >= 7 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${liveAnalysis.urgency * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] font-black">
                        <div className={`p-3 rounded-2xl border ${liveAnalysis.communityResolution ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
                          <p className="text-zinc-300 mb-1">Community</p>
                          <p className={liveAnalysis.communityResolution ? 'text-emerald-300' : 'text-zinc-500'}>{liveAnalysis.communityResolution ? 'Preferred' : 'Standby'}</p>
                        </div>
                        <div className={`p-3 rounded-2xl border ${liveAnalysis.policeNeeded ? 'border-red-400/40 bg-red-500/10 animate-pulse' : 'border-white/10 bg-white/5'}`}>
                          <p className="text-zinc-300 mb-1">Police</p>
                          <p className={liveAnalysis.policeNeeded ? 'text-red-300' : 'text-zinc-500'}>{liveAnalysis.policeNeeded ? 'Escalate' : 'Not required'}</p>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-zinc-200">
                        {liveAnalysis.suggestedResponse || 'Monitoring channel and ready to assist.'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                      Awaiting input...
                    </div>
                  )}
                </div>
              </div>

              {/* Volunteer Phone (Sarah's app from codeThisUI) */}
              {showVolunteerPhone && (
                <div className="flex justify-center">
                  <div
                   className={`relative w-full max-w-[380px] h-[780px] 
  bg-gradient-to-br from-[#f5f6f7] via-[#d1d5db] to-[#9ca3af]
  rounded-[3.5rem] 
  border-[10px] border-[#e5e7eb]
  shadow-[0_25px_70px_rgba(0,0,0,0.55),inset_0_0_12px_rgba(255,255,255,0.6)]
  overflow-hidden ${
                      volunteerWakeStage === 'hidden'
                        ? 'translate-y-[100%] opacity-0'
                        : volunteerWakeStage === 'slide'
                        ? 'animate-slide-in-bottom'
                        : 'translate-y-0 opacity-100'
                    } transition-opacity duration-500`}
                  >
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-2 bg-black/40 rounded-full shadow-inner"></div>

                    <div className="h-full flex flex-col bg-[#050507]">
                      {volunteerLocked && (
                        <div className="absolute inset-0 z-[60] overflow-hidden rounded-[3.5rem]">
                          {/* Stage: black screen (initial) */}
                          {volunteerWakeStage === 'slide' && (
                            <div className="absolute inset-0 bg-black animate-in fade-in duration-500" />
                          )}

                          {/* Stage: wallpaper with clock ONLY (no alert yet) */}
                          {volunteerWakeStage === 'lock' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#050910] text-white flex flex-col items-center justify-center gap-5">
                              <div className="text-center animate-in fade-in duration-700">
                                <div className="text-5xl font-black mb-1">9:41</div>
                                <div className="text-[11px] uppercase tracking-[0.25em] text-white/70">Wednesday, Sept 18</div>
                              </div>
                            </div>
                          )}

                          {/* Stage: wallpaper with clock AND alert notification */}
                          {volunteerWakeStage === 'notif' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#050910] text-white flex flex-col items-center justify-center gap-5">
                              <div className="text-center">
                              <div className="text-5xl font-black mb-1">9:41</div>
                              <div className="text-[11px] uppercase tracking-[0.25em] text-white/70">Wednesday, Sept 18</div>
                            </div>
                            
                            {volunteerNotif && showVolunteerAlert && (
                                <div className="animate-in slide-in-from-bottom-8 duration-700 animate-[shake_0.5s_ease-in-out]">
                                  <div className="bg-red-500/20 border border-red-400/40 text-red-100 rounded-2xl px-5 py-4 text-left shadow-xl shadow-red-500/10 relative max-w-[300px]">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center">
                                        <span className="text-lg">⚠️</span>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-200">SAFETY ALERT</p>
                                        <p className="text-sm font-bold">{volunteerNotif}</p>
                                      </div>
                                    </div>
                                    
                                    {volunteerCanOpen && (
                                      <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-red-200/70">Tap to respond</span>
                                        <div 
                                          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-tap-pulse cursor-pointer hover:bg-white/30 transition-colors"
                                          onClick={handleVolunteerOpen}
                                        >
                                          <div className="animate-pulse">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Stage: app opening animation */}
                          {volunteerWakeStage === 'app' && (
                            <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-500 flex items-center justify-center">
                              <div className="text-center animate-in zoom-in duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                  <span className="text-2xl">👥</span>
                                </div>
                                <p className="text-sm font-bold text-white">Opening SafetyNet...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Volunteer Header (only visible when app is unlocked) */}
                      {!volunteerLocked && (
                        <>
                          <header className="px-6 py-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#09090b]/80 backdrop-blur-md z-50">
                      <div>
                        <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">SafetyNet Responder</h1>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          {volunteers[0]?.name || 'Volunteer'} (Online)
                        </p>
                      </div>
                            <div className="flex gap-2">
                              <div className="bg-zinc-900 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                                <span className="text-[10px] font-black text-violet-400">MESH: ACTIVE</span>
                              </div>
                            </div>
                          </header>

                          {/* Main Content */}
                          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                            {volunteerTab === 'feed' && (
                              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center">
                                  <h2 className="text-[11px] font-black uppercase tracking-widest text-violet-500">Live Queue</h2>
                                  <span className="text-[10px] font-bold text-zinc-500">
                                    {
                                      incidents.filter((inc) => {
                                        const st = statusForIncident(inc);
                                        return st === 'open' || st === 'pending' || (st === 'accepted' && inc._id !== activeMissionId);
                                      }).length
                                    }{' '}
                                    Nearby
                                  </span>
                                </div>

                                <div className="space-y-4">
                                  {incidents
                                    .filter((inc) => {
                                      const st = statusForIncident(inc);
                                      return st === 'open' || st === 'pending' || (st === 'accepted' && inc._id !== activeMissionId);
                                    })
                                    .map((incident, idx) => {
                                      const loc = incident.locationHint || LOCATION_LABELS[idx % LOCATION_LABELS.length];
                                      return (
                                      <div
                                        key={incident._id}
                                        className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6 space-y-5 shadow-2xl relative overflow-hidden group hover:border-violet-500/50 transition-all"
                                      >
                                        {incident.urgency >= 8 && (
                                          <div className="absolute top-0 right-0 p-4">
                                            <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-full border border-rose-500/20 animate-pulse">
                                              URG {incident.urgency}
                                            </span>
                                          </div>
                                        )}

                                          <div className="flex gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                              {incident.category?.includes('follow') ? '👣' : '🚶‍♀️'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">
                                                {incident.category.replace('_', ' ')}
                                              </p>
                                              <p className="text-base font-black truncate">{loc}</p>
                                              <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 italic leading-relaxed font-medium">"{incident.message}"</p>
                                            </div>
                                          </div>

                                          <button
                                          onClick={() => handleVolunteerAction(incident._id, 'accepted')}
                                          className="w-full bg-violet-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-violet-500 transition-all active:scale-95 shadow-xl shadow-violet-600/20"
                                          >
                                            Accept Dispatch
                                          </button>
                                        </div>
                                      );
                                    })}
                                  {incidents.length === 0 && (
                                    <div className="text-[11px] text-zinc-500 text-center py-6 border border-dashed border-white/10 rounded-xl">Awaiting first incident...</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {volunteerTab === 'map' && (
                              <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
                                {activeMission ? (
                                  <>
                                    <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6 space-y-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Active Mission</p>
                                          <h3 className="text-xl font-black">{activeMission.category.replace('_', ' ')}</h3>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-black text-zinc-500 uppercase">ETA</p>
                                          <p className="text-lg font-black text-white">{Math.ceil(volunteerDistance * 2.5)} MIN</p>
                                        </div>
                                      </div>
                                      <div className="h-48 bg-zinc-800 rounded-2xl relative overflow-hidden border border-white/5">
                                        <div
                                          className="absolute inset-0 opacity-20"
                                          style={{
                                            backgroundImage:
                                              'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                                            backgroundSize: '20px 20px',
                                          }}
                                        ></div>
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                                          <path d="M40 160 L100 120 L160 40" stroke="#7c3aed" strokeWidth="4" fill="none" strokeDasharray="10 5" className="animate-[dash_2s_linear_infinite]" />
                                          <circle cx="40" cy="160" r="6" fill="#10b981" />
                                          <circle cx="160" cy="40" r="8" fill="#f43f5e" className="animate-pulse" />
                                        </svg>
                                        <style>{`@keyframes dash { to { stroke-dashoffset: -15; } }`}</style>
                                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black">NAVIGATING TO USER</div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                          onClick={() => handleVolunteerAction(activeMission._id, 'on-scene')}
                                          className="bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95"
                                        >
                                          On Scene
                                        </button>
                                        <button
                                          onClick={() => handleVolunteerAction(activeMission._id, 'resolved')}
                                          className="bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95"
                                        >
                                          Resolved
                                        </button>
                                      </div>
                                    </div>
                                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 space-y-2">
                                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live User Transcript</p>
                                      {missionThread.length === 0 && (
                                        <p className="text-xs italic text-zinc-500">Awaiting updates...</p>
                                      )}
                                      {missionThread.map((line, idx) => (
                                        <p key={idx} className="text-xs text-zinc-300 leading-snug">
                                          {line}
                                        </p>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-3xl">🗺️</div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No Active Mission</p>
                                    <button onClick={() => setVolunteerTab('feed')} className="mt-4 text-xs font-black text-violet-500 uppercase">
                                      Back to Queue
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {volunteerTab === 'history' && (
                              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Mission Archive</h2>
                                <div className="space-y-3">
                            {volunteerHistory.map((incident) => (
                              <div key={incident._id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-lg opacity-60">✅</div>
                                  <div>
                                    <p className="text-xs font-bold">{incident.category.replace('_', ' ')}</p>
                                    <p className="text-[9px] text-zinc-600 uppercase font-black">
                                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Verified Safe</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                          </div>

                          {/* Bottom Nav */}
                          <nav className="h-20 border-t border-white/5 flex items-center justify-around px-8 bg-black/80 backdrop-blur-md shrink-0 pb-6">
                            <button
                              onClick={() => setVolunteerTab('feed')}
                              className={`flex flex-col items-center gap-1.5 transition-colors ${volunteerTab === 'feed' ? 'text-violet-500' : 'text-zinc-600'}`}
                            >
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <span className="text-[9px] font-black uppercase tracking-widest">Feed</span>
                            </button>
                            <button
                              onClick={() => setVolunteerTab('map')}
                              className={`flex flex-col items-center gap-1.5 transition-colors ${volunteerTab === 'map' ? 'text-violet-500' : 'text-zinc-600'}`}
                            >
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              <span className="text-[9px] font-black uppercase tracking-widest">Map</span>
                            </button>
                            <button
                              onClick={() => setVolunteerTab('history')}
                              className={`flex flex-col items-center gap-1.5 transition-colors ${volunteerTab === 'history' ? 'text-violet-500' : 'text-zinc-600'}`}
                            >
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-[9px] font-black uppercase tracking-widest">History</span>
                            </button>
                          </nav>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'community' && (
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Avg Peer Response', val: '5m 10s', sub: '50% faster than 911', color: 'text-emerald-300' },
                    { label: 'Community Resolved', val: displayCommunityResolved, sub: `${displayCommunityPercent}% without police`, color: 'text-emerald-300' },
                    { label: 'Police Involved', val: displayPoliceInvolved, sub: 'Flagged escalations', color: 'text-red-300' },
                    { label: 'Volunteers on Duty', val: displayVolunteersOnDuty, sub: 'Active mesh nodes', color: 'text-violet-300' },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{kpi.label}</p>
                      <p className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Real-Time Risk Landscape</p>
                      <p className="text-lg font-black text-white">Toronto Hotspots: Neighbourhood Risk</p>
                    </div>
                    {isHighRiskTime && (
                      <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-[10px] font-black text-red-200 uppercase tracking-[0.2em] animate-pulse">
                        High Risk Window
                      </span>
                    )}
                  </div>
                  <div className="h-[400px]">
                    <TorontoSafetyMap />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Predictive Safety Intelligence</p>
                      <p className="text-sm text-zinc-300">Live mesh signals & historical trends</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-3">
                      <p className="text-xs font-black text-red-200">High Risk • Friday 10PM-2AM</p>
                      <p className="text-[11px] text-red-100/80">Be extra cautious near club exits; coordinate escorts for riders.</p>
                    </div>
                    <div className="bg-amber-900/30 border border-amber-500/40 rounded-2xl p-3">
                      <p className="text-xs font-black text-amber-200">Medium Risk • Sat 9PM-1AM</p>
                      <p className="text-[11px] text-amber-100/80">Harassment reports rise along bar corridors; keep check-ins frequent.</p>
                    </div>
                    <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-2xl p-3">
                      <p className="text-xs font-black text-emerald-200">Lower Risk • Weeknights</p>
                      <p className="text-[11px] text-emerald-100/80">Routine patrols and virtual check-ins sustain coverage.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4 lg:mt-[150px] md:mt-10 mt-8">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 space-y-3 h-[900px] flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Past Incidents</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                      <span className="uppercase tracking-widest text-[9px] text-zinc-500">Since</span>
                      <select
                        value={incidentFilter}
                        onChange={(e) => setIncidentFilter(e.target.value as 'all' | '24h' | '7d')}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
                      >
                        <option value="24h">24 hrs</option>
                        <option value="7d">7 days</option>
                        <option value="all">All time</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 overflow-y-auto pr-1">
                    {pastIncidentsDisplay.slice(0, 40).map((inc, idx) => {
                      const loc = inc.locationHint || LOCATION_LABELS[idx % LOCATION_LABELS.length];
                      return (
                      <button
                        key={inc._id}
                        onClick={() => setSelectedIncident(inc)}
                        className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 hover:border-violet-400/40 transition-colors"
                      >
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r ${
                            categoryColors[inc.category] || categoryColors.other
                          } text-white`}
                        >
                          {inc.category.replace('_', ' ')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white leading-tight line-clamp-2">"{inc.message}"</p>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{loc}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                            {new Date(inc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            • {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            inc.policeInvolved ? 'bg-red-900/60 text-red-200' : 'bg-emerald-900/60 text-emerald-200'
                          }`}
                        >
                          {inc.policeInvolved ? '🚔' : '👥'}
                        </span>
                      </button>
                      );
                    })}
                    {pastIncidentsDisplay.length === 0 && (
                      <div className="text-[11px] text-zinc-500 text-center py-6 border border-dashed border-white/10 rounded-xl">
                        No incidents in this window
                      </div>
                    )}
                  </div>
                  {selectedIncident && (
                    <div className="mt-3 bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Incident Details</p>
                          <p className="text-base font-black text-white leading-tight">
                            {selectedIncident.category.replace('_', ' ')}
                          </p>
                          <p className="text-[11px] text-zinc-400 uppercase tracking-widest">
                            {new Date(selectedIncident.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            • {new Date(selectedIncident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedIncident(null)}
                          className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                          Close
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-zinc-400 mb-1 uppercase tracking-widest">Location</p>
                          <p className="text-white">{selectedIncident.locationHint || 'Toronto (approx.)'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-zinc-400 mb-1 uppercase tracking-widest">Urgency</p>
                          <p className="text-white font-black">{selectedIncident.urgency}/10</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-zinc-400 mb-1 uppercase tracking-widest">Status</p>
                          <p className="text-emerald-300 font-black">{selectedIncident.status || 'resolved'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-zinc-400 mb-1 uppercase tracking-widest">Police</p>
                          <p className="text-white">{selectedIncident.policeInvolved ? 'Notified' : 'Community-led'}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[12px] text-zinc-200 leading-relaxed">
                        {selectedIncident.message}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeView !== 'community' && (
        <footer className="h-12 border-t border-white/5 flex items-center justify-between px-4 lg:px-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-black/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Mesh encrypted • {volunteers.filter((v) => v.onDuty).length || 0} volunteers live
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white">System v1.4.2</span>
            <span>SafetyNet Protocol</span>
          </div>
        </footer>
      )}

      {showFakeCall && <FakeCall onEnd={() => setShowFakeCall(false)} />}
    </div>
  );
}
export default App;
