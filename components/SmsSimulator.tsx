
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSmsUrgency } from '../services/geminiService';
import { SmsMessage } from '@/services/types';

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

    // Simple state-machine for the demo flow
    setTimeout(async () => {
      setIsTyping(false);
      
      if (text.toUpperCase() === 'UNSAFE' || step === 'initial') {
        setStep('menu');
        addMessage('system', "You're safe to text here. What’s happening?\n1) Someone following me\n2) Feeling threatened where I am\n3) Need to leave now\n4) Check-in / stay with me\n5) Emergency now\n\nReply 1-5");
      } 
      else if (step === 'menu') {
        setStep('location');
        addMessage('system', "Okay. I can help.\n\nShare location? Reply:\nA) YES (send pin)\nB) NO (describe where you are)");
      }
      else if (step === 'location') {
        setStep('action');
        addMessage('system', "Quick options:\nA) Send volunteer escort\nB) Call me (fake urgent call)\nC) Stay on text & check in\nD) Emergency help\n\nReply A/B/C/D");
      }
      else if (step === 'action') {
        if (text.toUpperCase() === 'B') {
          onCallRequested();
          addMessage('system', "✓ Call incoming now. Use this to exit safely.");
        } else {
          setStep('dispatching');
          addMessage('system', "✓ Volunteer dispatched: Sarah (ETA 4 min)\nMeet near: Tim Hortons (2 min away)\n\nCheck-in in 5 minutes. Reply OK if safe.");
          onIncidentTriggered({ text: "User needs escort", analysis: { urgency: 9, category: 'FOLLOWED' } });
        }
      }
      else {
        // AI Fallback for anything else
        const analysis = await analyzeSmsUrgency(text);
        if (analysis) {
          addMessage('system', `We hear you. ${analysis.recommended_action === 'phone_call' ? 'Would you like a check-in call?' : 'A volunteer is monitoring your status.'}`);
        } else {
          addMessage('system', "I'm here. Can you tell me more?");
        }
      }
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border-4 border-zinc-800 shadow-2xl">
      {/* Dynamic Island style header */}
      <div className="bg-zinc-900 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-[10px] font-black italic">S</div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">SafetyNet HER</p>
            <p className="text-[9px] font-bold text-green-500 leading-none mt-1">Encrypted Line</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[8px] font-black text-zinc-500">LIVE</span>
        </div>
      </div>
      
      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 scroll-smooth no-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3 px-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-violet-600 text-white rounded-br-none font-medium' 
                : 'bg-white text-zinc-800 rounded-bl-none border border-zinc-200 shadow-sm'
            }`}>
              {m.text}
              <div className={`text-[8px] mt-1 text-right font-bold uppercase tracking-tighter ${m.sender === 'user' ? 'text-violet-200' : 'text-zinc-400'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 p-2 px-4 rounded-full flex gap-1 items-center animate-pulse">
              <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-zinc-100 flex gap-2 items-center">
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type here..."
            className="w-full bg-zinc-100 rounded-2xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium border-none"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center hover:bg-violet-700 transition active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsSimulator;
