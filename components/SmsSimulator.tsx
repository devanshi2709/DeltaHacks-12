
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSmsUrgency } from '../services/geminiService';
import { SmsMessage } from '../types';

interface SmsSimulatorProps {
  onIncidentTriggered: (details: any) => void;
  onCallRequested: () => void;
}

type FlowStep = 'initial' | 'menu' | 'location' | 'action' | 'dispatching';

const SmsSimulator: React.FC<SmsSimulatorProps> = ({ onIncidentTriggered, onCallRequested }) => {
  const [messages, setMessages] = useState<SmsMessage[]>([
    { id: 'start', sender: 'system', text: "SafetyNet HER: You're safe to text here. Type 'UNSAFE' if you need help.", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<FlowStep>('initial');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender: 'user' | 'system', text: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(), sender, text, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    addMessage('user', text);
    setInputText('');
    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);
      const lowerText = text.toLowerCase();
      
      if (lowerText === 'unsafe' || step === 'initial') {
        setStep('menu');
        addMessage('system', "You're safe to text here. What’s happening?\n\n1) Someone following me\n2) Feeling threatened where I am\n3) Need to leave now\n4) Check-in / stay with me\n5) Emergency now\n\nReply 1-5");
      } 
      else if (step === 'menu') {
        setStep('location');
        addMessage('system', "Okay. I can help. Share location?\n\nReply:\nA) YES (send pin)\nB) NO (describe location)");
      }
      else if (step === 'location') {
        setStep('action');
        addMessage('system', "Quick options:\n\nA) Send volunteer escort\nB) Call me (fake urgent call)\nC) Stay on text & check in\nD) Emergency help\n\nReply A, B, C, or D");
      }
      else if (step === 'action') {
        if (text.toUpperCase() === 'B') {
          onCallRequested();
          addMessage('system', "✓ Call incoming now. Use this to exit safely.");
        } else {
          setStep('dispatching');
          addMessage('system', "✓ Volunteer dispatched: Sarah (ETA 4 min)\nMeet near: Tim Hortons (2 min away)\n\nCheck-in in 5 minutes. Reply OK if safe.");
          onIncidentTriggered({ id: '1042', text: "User needs escort", analysis: { urgency: 9, category: 'FOLLOWED' } });
        }
      }
      else {
        const analysis = await analyzeSmsUrgency(text);
        if (analysis) {
          addMessage('system', `Understood. ${analysis.recommended_action === 'phone_call' ? 'I can initiate a check-in call if you wish.' : 'A volunteer is monitoring this line.'}`);
        } else {
          addMessage('system', "I'm listening. Tell me what's happening.");
        }
      }
    }, 1200);
  };

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/19] bg-black rounded-[3.5rem] p-3 shadow-2xl border-[8px] border-zinc-800 ring-4 ring-zinc-700/20 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-700">
      {/* Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-end pr-4">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
      </div>
      
      <div className="flex-1 bg-black rounded-[2.5rem] overflow-hidden flex flex-col relative text-white">
        {/* Header */}
        <div className="pt-10 pb-3 border-b border-zinc-800/50 flex flex-col items-center shrink-0 bg-black/80 backdrop-blur-md z-40">
          <div className="w-full flex justify-between items-center px-4 mb-2">
            <button className="text-[#0A84FF] flex items-center gap-0.5">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
               <span className="text-sm font-medium">9</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <button className="text-[#0A84FF] text-sm font-medium opacity-0">Edit</button>
          </div>
          <p className="text-[11px] font-bold text-zinc-100">SafetyNet HER</p>
          <div className="flex items-center gap-1 opacity-60">
             <span className="text-[9px] text-zinc-400 font-medium">905-SAFE-HER</span>
             <svg className="w-2.5 h-2.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>

        {/* Message Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-6 space-y-3 bg-black scroll-smooth no-scrollbar">
          <div className="flex justify-center mb-6">
             <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Today 9:41 PM</span>
          </div>

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-300`}>
              <div className={`max-w-[80%] p-2.5 px-4 text-[14px] leading-[1.3] shadow-sm ${
                m.sender === 'user' 
                  ? 'bg-[#0A84FF] text-white rounded-[18px] rounded-br-[4px] font-medium' 
                  : 'bg-[#262629] text-white rounded-[18px] rounded-bl-[4px] font-medium'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-[#262629] p-2.5 px-4 rounded-[18px] rounded-bl-[4px] flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="px-3 pb-10 pt-2 bg-black flex gap-2 items-center">
          <button className="p-1 text-zinc-500 hover:text-white transition-colors">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <div className="flex-1 relative flex items-center">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="iMessage"
              className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-full py-2 px-4 pr-10 focus:outline-none text-[14px] text-white placeholder-zinc-600 transition-all focus:border-zinc-700"
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`absolute right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() ? 'bg-[#0A84FF] text-white' : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full"></div>
    </div>
  );
};

export default SmsSimulator;
