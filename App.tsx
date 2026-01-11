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
  recommendedAction: string;
  policeNeeded: boolean;
  communityResolution: boolean;
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
  const [acceptedDispatch, setAcceptedDispatch] = useState<any>(null);
  const [volunteerDistance, setVolunteerDistance] = useState(2.4);
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

    // Keyword routing
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

  const analyzeMessage = (text: string): AIAnalysis => {
    const lower = text.toLowerCase();
    let urgency = 5;
    let category = 'other';
    let emotion = 'concern';
    let policeNeeded = false;
    let communityResolution = true;

    // CRITICAL EMERGENCIES
    if (lower.includes('kill') || lower.includes('murder') || lower.includes('gun') || 
        lower.includes('knife') || lower.includes('weapon') || lower.includes('shoot')) {
      category = 'life_threatening';
      urgency = 10;
      emotion = 'terror';
      policeNeeded = true;
      communityResolution = false;
    }
    // DOMESTIC VIOLENCE
    else if (lower.includes('domestic') || lower.includes('abuse') || lower.includes('hit me') || 
             lower.includes('beating') || lower.includes('partner') || lower.includes('boyfriend') ||
             lower.includes('husband') || lower.includes('ex')) {
      category = 'domestic_violence';
      urgency = 10;
      emotion = 'fear';
      policeNeeded = true;
      communityResolution = false;
    }
    // PHYSICAL ASSAULT
    else if (lower.includes('assault') || lower.includes('attack') || lower.includes('grabbed') || 
             lower.includes('touching') || lower.includes('groping') || lower.includes('pushed')) {
      category = 'assault';
      urgency = 10;
      emotion = 'panic';
      policeNeeded = true;
      communityResolution = false;
    }
    // SEXUAL HARASSMENT/ASSAULT
    else if (lower.includes('rape') || lower.includes('sexual') || lower.includes('molest')) {
      category = 'sexual_assault';
      urgency = 10;
      emotion = 'trauma';
      policeNeeded = true;
      communityResolution = false;
    }
    // FOLLOWING - HIGH URGENCY
    else if (lower.includes('follow') || lower.includes('stalking') || lower.includes('chasing')) {
      category = 'following';
      urgency = 9;
      emotion = 'fear';
    }
    // HARASSMENT - MEDIUM-HIGH
    else if (lower.includes('harass') || lower.includes('catcall') || lower.includes('yelling') ||
             lower.includes('won\'t leave me alone')) {
      category = 'harassment';
      urgency = 7;
      emotion = 'discomfort';
    }
    // UNSAFE LOCATION - MEDIUM-HIGH
    else if (lower.includes('unsafe') || lower.includes('scared') || lower.includes('alone') ||
             lower.includes('dark') || lower.includes('isolated')) {
      category = 'unsafe_location';
      urgency = 8;
      emotion = 'fear';
    }
    // DRUNK/IMPAIRED PERSON
    else if (lower.includes('drunk') || lower.includes('intoxicated') || lower.includes('high')) {
      category = 'intoxicated_person';
      urgency = 7;
      emotion = 'concern';
    }
    // UNCOMFORTABLE SITUATION
    else if (lower.includes('uncomfortable') || lower.includes('creepy') || lower.includes('weird')) {
      category = 'uncomfortable';
      urgency = 6;
      emotion = 'unease';
    }
    // EMERGENCY KEYWORDS
    else if (lower.includes('emergency') || lower.includes('911') || lower.includes('help now')) {
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
      communityResolution: !policeNeeded
    };
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

    setTimeout(() => {
      const analysis = analyzeMessage(userInput);
      setLiveAnalysis(analysis);
      setIsAnalyzing(false);

      if (analysis.urgency >= 8) {
        const volunteer = volunteers[0] || { name: 'Sarah Martinez' };
        setAcceptedDispatch({
          incident: {
            _id: Date.now().toString(),
            userPhone: '+16478715609',
            message: userInput,
            category: analysis.category,
            urgency: analysis.urgency,
            emotion: analysis.emotion,
            status: 'dispatched',
            timestamp: new Date().toISOString(),
            policeInvolved: analysis.policeNeeded
          },
          volunteer: volunteer.name,
          eta: analysis.urgency === 10 ? '2 min' : '4 min',
          action: 'DISPATCH_IMMEDIATE'
        });
        setVolunteerDistance(analysis.urgency === 10 ? 1.5 : 2.4);
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
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMsg]);
      }

      setTimeout(loadData, 1000);
    }, 2800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const categoryColors: { [key: string]: string } = {
    life_threatening: 'from-red-700 to-red-900',
    domestic_violence: 'from-red-600 to-pink-700',
    assault: 'from-red-500 to-orange-600',
    sexual_assault: 'from-red-600 to-purple-700',
    following: 'from-orange-500 to-yellow-500',
    harassment: 'from-yellow-500 to-amber-500',
    unsafe_location: 'from-amber-500 to-yellow-600',
    intoxicated_person: 'from-orange-400 to-yellow-600',
    uncomfortable: 'from-yellow-400 to-lime-500',
    other: 'from-blue-500 to-cyan-500'
  };

  const policeInvolved = incidents.filter(i => i.policeInvolved).length;
  const communityResolved = incidents.length - policeInvolved;
  const communityPercent = incidents.length > 0 ? Math.round((communityResolved / incidents.length) * 100) : 100;

  // Calculate patterns
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const isHighRiskTime = (dayOfWeek === 5 || dayOfWeek === 6) && hour >= 22; // Friday/Saturday 10pm+

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Stats Bar */}
      <div className="h-20 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-700 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center text-xl font-black shadow-lg">
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
            
            <div className="text-center">
              <div className="text-2xl font-black text-violet-400">{volunteers.filter(v => v.onDuty).length}</div>
              <div className="text-[9px] text-zinc-400 font-bold">Volunteers</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Panel View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel 1: iPhone (20%) */}
        <div className="w-1/5 bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-4">
          <div className="w-[280px] h-[600px] bg-zinc-900 rounded-[40px] border-[8px] border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[22px] bg-black rounded-b-3xl z-50"></div>
            
            <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-5 pt-2 z-40 text-white text-[10px]">
              <span className="font-semibold">9:41</span>
              <span>100%</span>
            </div>

            <div className="h-full bg-black flex flex-col pt-10">
              <div className="bg-zinc-900/98 backdrop-blur-xl border-b border-zinc-800 px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center font-black text-xs">
                    S
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs">SafetyNet HER</div>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="text-green-400 text-[8px] font-semibold">24/7</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 text-[11px]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-[16px] px-2.5 py-1.5 ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-sm' 
                        : 'bg-zinc-800 text-white rounded-bl-sm'
                    }`}>
                      <p className="leading-snug whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-[16px] rounded-bl-sm px-3 py-2">
                      <div className="flex gap-0.5">
                        {[0, 150, 300].map((delay) => (
                          <div key={delay} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-zinc-900/98 backdrop-blur-xl border-t border-zinc-800 px-3 py-2 pb-4 shrink-0">
                <div className="flex items-end gap-1.5">
                  <div className="flex-1 bg-zinc-800 rounded-full px-2.5 py-1.5">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="iMessage"
                      className="w-full bg-transparent text-white text-xs outline-none placeholder-zinc-500"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      inputText.trim() ? 'bg-blue-500' : 'bg-zinc-700 opacity-40'
                    }`}
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: AI Analysis (25%) */}
        <div className="w-1/4 bg-zinc-950 border-l border-zinc-800 overflow-y-auto p-4">
          <h2 className="text-xl font-black text-white mb-4">🧠 AI Analysis</h2>

          <div className="mb-4">
            <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-2 border-violet-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-400 animate-pulse' : liveAnalysis ? 'bg-green-400' : 'bg-zinc-600'}`}></div>
                <h3 className="text-white font-black text-sm">
                  {isAnalyzing ? 'ANALYZING...' : liveAnalysis ? 'COMPLETE' : 'READY'}
                </h3>
              </div>

              {liveAnalysis && (
                <div className="space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-xs font-semibold">Category:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r ${categoryColors[liveAnalysis.category]} text-white uppercase`}>
                      {liveAnalysis.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-400 text-xs font-semibold">Urgency:</span>
                      <span className={`font-black text-lg ${liveAnalysis.urgency === 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{liveAnalysis.urgency}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${liveAnalysis.urgency === 10 ? 'bg-red-600 animate-pulse' : liveAnalysis.urgency >= 8 ? 'bg-red-500' : liveAnalysis.urgency >= 6 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${liveAnalysis.urgency * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-700">
                    <div className="text-zinc-400 text-xs font-semibold mb-2">Resolution:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded-lg border transition-all ${liveAnalysis.communityResolution ? 'border-green-500 bg-green-500/20' : 'border-zinc-700 bg-zinc-800/50'}`}>
                        <div className="text-center">
                          <div className={`text-xl ${liveAnalysis.communityResolution ? 'text-green-400' : 'text-zinc-600'}`}>
                            {liveAnalysis.communityResolution ? '✓' : '○'}
                          </div>
                          <div className={`text-[9px] font-bold ${liveAnalysis.communityResolution ? 'text-green-400' : 'text-zinc-500'}`}>
                            COMMUNITY
                          </div>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg border transition-all ${liveAnalysis.policeNeeded ? 'border-red-500 bg-red-500/20 animate-pulse' : 'border-zinc-700 bg-zinc-800/50'}`}>
                        <div className="text-center">
                          <div className={`text-xl ${liveAnalysis.policeNeeded ? 'text-red-400' : 'text-zinc-600'}`}>
                            {liveAnalysis.policeNeeded ? '✓' : '○'}
                          </div>
                          <div className={`text-[9px] font-bold ${liveAnalysis.policeNeeded ? 'text-red-400' : 'text-zinc-500'}`}>
                            POLICE
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!liveAnalysis && !isAnalyzing && (
                <div className="text-center text-zinc-500 py-6">
                  <div className="text-3xl mb-1">🤖</div>
                  <div className="text-xs">Awaiting input...</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-white mb-3">📊 Breakdown</h3>
            <div className="space-y-1.5 text-xs">
              {Object.entries(
                incidents.reduce((acc: any, inc) => {
                  acc[inc.category] = (acc[inc.category] || 0) + 1;
                  return acc;
                }, {})
              ).slice(0, 8).map(([category, count]: [string, any]) => (
                <div key={category} className="bg-zinc-900 rounded-lg p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${categoryColors[category] || categoryColors.other}`}></div>
                    <span className="text-white font-semibold capitalize text-[11px]">{category.replace('_', ' ')}</span>
                  </div>
                  <span className="text-zinc-400 font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Community Intelligence (30%) */}
        <div className="w-[30%] bg-zinc-900 border-l border-zinc-800 overflow-y-auto p-4">
          <h2 className="text-xl font-black text-white mb-4">🏘️ Community Intel</h2>

          {/* Risk Alert */}
          {isHighRiskTime && (
            <div className="mb-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="text-red-400 font-black text-sm">HIGH RISK PERIOD</div>
                  <div className="text-zinc-300 text-xs">Friday/Saturday 10PM-2AM</div>
                </div>
              </div>
              <div className="text-zinc-300 text-xs mt-2">
                📈 Expected incidents: 15-20 tonight<br/>
                👥 Extra volunteers dispatched<br/>
                🚨 Fast response mode: ACTIVE
              </div>
            </div>
          )}

          {/* Volunteer Profiles */}
          <div className="mb-4">
            <h3 className="text-sm font-black text-white mb-3">👥 Active Volunteers</h3>
            <div className="space-y-2">
              {volunteers.filter(v => v.onDuty).map((vol) => (
                <div key={vol._id} className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-bold text-sm">{vol.name}</div>
                      <div className="text-zinc-400 text-[10px]">⭐ {vol.rating.toFixed(1)} rating</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${vol.available ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vol.skills.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] font-semibold text-zinc-300">
                        {skill.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    📍 Beasley area • {vol.languages?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Patterns */}
          <div className="mb-4">
            <h3 className="text-sm font-black text-white mb-3">🔮 Patterns Detected</h3>
            <div className="space-y-2">
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 font-bold text-xs mb-1">HIGH RISK</div>
                <div className="text-white text-xs mb-1">Friday 10PM-2AM • Main St</div>
                <div className="text-zinc-400 text-[10px]">23 incidents last month</div>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
                <div className="text-yellow-400 font-bold text-xs mb-1">MEDIUM RISK</div>
                <div className="text-white text-xs mb-1">Saturday 9PM-1AM • Bar district</div>
                <div className="text-zinc-400 text-[10px]">15 incidents last month</div>
              </div>
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 font-bold text-xs mb-1">LOW RISK</div>
                <div className="text-white text-xs mb-1">Weekdays • All areas</div>
                <div className="text-zinc-400 text-[10px]">3-5 incidents per week</div>
              </div>
            </div>
          </div>

          {/* Impact Metrics */}
          <div>
            <h3 className="text-sm font-black text-white mb-3">💰 Community Impact</h3>
            <div className="space-y-2">
              <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                <div className="text-green-400 font-black text-2xl">$57,000</div>
                <div className="text-zinc-400 text-[10px]">Cost savings (30 days)</div>
                <div className="text-zinc-500 text-[9px] mt-1">vs traditional police response</div>
              </div>
              <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                <div className="text-violet-400 font-black text-2xl">156</div>
                <div className="text-zinc-400 text-[10px]">Women helped (30 days)</div>
              </div>
              <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                <div className="text-blue-400 font-black text-2xl">4.2min</div>
                <div className="text-zinc-400 text-[10px]">Avg response time</div>
                <div className="text-zinc-500 text-[9px] mt-1">vs 18min (911 average)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Volunteer Dispatch (25%) */}
        <div className="w-1/4 bg-zinc-950 border-l border-zinc-800 overflow-y-auto p-4">
          <h2 className="text-xl font-black text-white mb-4">🚑 Dispatch</h2>

          {acceptedDispatch && (
            <div className="mb-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-green-400 font-black text-xs">EN ROUTE</h3>
              </div>

              <div className="mb-3">
                <div className="text-white font-bold text-lg mb-0.5">{acceptedDispatch.volunteer}</div>
                <div className="text-zinc-300 text-xs">ETA: {Math.ceil(volunteerDistance * 2.5)}m</div>
              </div>

              {/* Mini Map */}
              <div className="bg-zinc-950 rounded-lg h-40 mb-3 relative overflow-hidden border border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-purple-950/30"></div>
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '15px 15px'
                }}></div>
                
                {/* User */}
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-bounce flex items-center justify-center text-xs">
                    👤
                  </div>
                </div>
                
                {/* Volunteer */}
                <div 
                  className="absolute transition-all duration-1000"
                  style={{
                    bottom: `${15 + (volunteerDistance / 2.4) * 45}%`,
                    right: `${10 + (volunteerDistance / 2.4) * 40}%`
                  }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center text-xs">
                    🚑
                  </div>
                </div>

                {volunteerDistance <= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur">
                    <div className="text-center">
                      <div className="text-3xl mb-1">✓</div>
                      <div className="text-green-400 font-black text-sm">ARRIVED</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="bg-zinc-950 rounded p-2 text-center border border-zinc-800">
                  <div className="text-white font-black">{volunteerDistance.toFixed(1)}km</div>
                  <div className="text-zinc-400">Distance</div>
                </div>
                <div className="bg-zinc-950 rounded p-2 text-center border border-zinc-800">
                  <div className="text-white font-black">{Math.ceil(volunteerDistance * 2.5)}m</div>
                  <div className="text-zinc-400">ETA</div>
                </div>
                <div className="bg-zinc-950 rounded p-2 text-center border border-zinc-800">
                  <div className="text-green-400 font-black animate-pulse">LIVE</div>
                  <div className="text-zinc-400">Track</div>
                </div>
              </div>
            </div>
          )}

          <h3 className="text-sm font-black text-white mb-3">Recent Activity</h3>
          <div className="space-y-1.5">
            {incidents.slice(0, 12).map((inc) => (
              <div key={inc._id} className="bg-zinc-900 rounded-lg p-2.5 border border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                    inc.urgency === 10 ? 'bg-red-600 animate-pulse' :
                    inc.urgency >= 8 ? 'bg-red-500' : 
                    inc.urgency >= 6 ? 'bg-yellow-500 text-black' : 
                    'bg-green-500 text-black'
                  }`}>
                    {inc.urgency}/10
                  </span>
                  <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-[9px] font-bold uppercase text-zinc-300">
                    {inc.category?.replace('_', ' ')}
                  </span>
                  {inc.policeInvolved ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-900/50 text-red-400">
                      🚔
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-green-900/50 text-green-400">
                      👥
                    </span>
                  )}
                </div>
                <p className="text-white text-[10px] leading-tight line-clamp-2">"{inc.message}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;