
import React, { useState } from 'react';
import UserMobileApp from './components/UserMobileApp';
import VolunteerDashboard from './components/VolunteerDashboard';
import FakeCall from './components/FakeCall';

const App: React.FC = () => {
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [showDemoOverlay, setShowDemoOverlay] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900 overflow-hidden">
      {/* Pitch Intro Overlay */}
      {showDemoOverlay && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex items-center justify-center p-8 text-center text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.4),transparent_50%)]"></div>
          </div>
          
          <div className="max-w-2xl relative z-10 animate-in fade-in zoom-in duration-1000">
             <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl font-black shadow-2xl rotate-3">S</div>
            <h1 className="text-6xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              SafetyNet HER
            </h1>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed font-medium">
              A proactive intelligence network designed for <span className="text-violet-400 font-black italic">Her Safety</span>. Community-powered prevention, AI-driven intervention.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setShowDemoOverlay(false)}
                className="w-full sm:w-auto bg-white text-zinc-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-50 transition-all shadow-2xl hover:scale-105 active:scale-95"
              >
                Launch Command Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Command Center Layout */}
      <div className="flex-1 flex flex-col lg:flex-row h-screen max-h-screen overflow-hidden p-4 lg:p-6 gap-6">
        
        {/* User Endpoint Column (The Simulator) */}
        <div className="hidden lg:flex w-[320px] 2xl:w-[380px] shrink-0 flex-col h-full gap-4 animate-in fade-in slide-in-from-left-4 duration-1000">
          <div className="bg-zinc-900/50 rounded-[2.5rem] p-6 border border-zinc-800 relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
               <h3 className="font-black text-zinc-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"></span>
                Mobile Endpoint
               </h3>
               <span className="text-[8px] font-black text-zinc-600 uppercase">Hamilton_Node_01</span>
            </div>
            
            <div className="flex-1 w-full min-h-0 flex items-center justify-center">
              <UserMobileApp 
                onIncidentTriggered={(d) => console.log('Incident Alert Received:', d)} 
                onCallRequested={() => setIsFakeCallActive(true)}
              />
            </div>

            <div className="w-full mt-4 pt-4 border-t border-zinc-800/50">
               <p className="text-[9px] text-zinc-500 font-bold uppercase text-center leading-relaxed">
                 Discrete interface designed for <br/> high-stress survival scenarios.
               </p>
            </div>
          </div>
        </div>

        {/* Intelligence & Dispatch Column (The Dashboard) */}
        <div className="flex-1 min-w-0 h-full animate-in fade-in slide-in-from-right-4 duration-1000 [animation-delay:200ms]">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsFakeCallActive(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition"
          >
            📞 CALL ME
          </button>
        </div>

        <VolunteerDashboard />
        </div>
      </div>

      {isFakeCallActive && (
        <FakeCall onEnd={() => setIsFakeCallActive(false)} />
      )}

      {/* Data Visualization Ribbon */}
      <footer className="bg-zinc-950 h-8 shrink-0 flex items-center justify-between px-10 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] border-t border-zinc-900">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <span className="text-zinc-800">Mesh Status:</span> <span className="text-green-600">Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-800">Active Volunteers:</span> <span className="text-violet-500">42</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-800">Predictive Confidence:</span> <span className="text-pink-500">92%</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-zinc-800">SafetyNet Protocol v2.5.0_ALPHA</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
