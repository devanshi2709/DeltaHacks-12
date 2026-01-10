
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSmsUrgency } from '../services/geminiService';
import { SmsMessage } from '@/services/types';

interface SmsSimulatorProps {
  onIncidentTriggered: (details: any) => void;
  onCallRequested: () => void;
}

const SmsSimulator: React.FC<SmsSimulatorProps> = ({ onIncidentTriggered, onCallRequested }) => {
  const [messages, setMessages] = useState<SmsMessage[]>([
    { id: '1', sender: 'system', text: "SafetyNet HER: You're safe to text here. How can we help?", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
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

    const text = inputText;
    addMessage('user', text);
    setInputText('');
    setIsTyping(true);

    if (text.toUpperCase() === 'CALL ME') {
      setTimeout(() => {
        addMessage('system', "Incoming safety call from SafetyNet... Answer to receive your 'out' script.");
        onCallRequested();
        setIsTyping(false);
      }, 1000);
      return;
    }

    const analysis = await analyzeSmsUrgency(text);
    setIsTyping(false);

    if (analysis) {
      if (analysis.urgency >= 7) {
        addMessage('system', `📍 Tracking your location. Urgent response triggered. Nearest safe space: Tim Hortons (0.2mi). Volunteer dispatched.`);
        onIncidentTriggered({ text, analysis });
      } else {
        addMessage('system', `We hear you. ${analysis.recommended_action === 'phone_call' ? 'Would you like a check-in call?' : 'A volunteer is monitoring your status.'}`);
      }
    } else {
      addMessage('system', "I'm here to support you. Can you tell me more about what's happening?");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
      <div className="bg-gray-800 p-4 text-white text-center font-bold flex items-center justify-between">
        <div className="w-10"></div>
        <span>(905) SAFE-HER</span>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
              m.sender === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
            }`}>
              <p className="text-sm">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.sender === 'user' ? 'text-violet-200' : 'text-gray-400'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 p-2 rounded-full px-4 text-xs text-gray-500 animate-pulse">
              Gemini is analyzing...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type 'UNSAFE' or 'CALL ME'..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
        />
        <button 
          onClick={handleSend}
          className="bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  );
};

export default SmsSimulator;
