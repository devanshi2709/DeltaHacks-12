
import React, { useState } from 'react';
import UserMobileApp from './components/UserMobileApp';
import VolunteerDashboard from './components/VolunteerDashboard';
import CommunityOpsDashboard from './components/CommunityOpsDashboard';
import SmsSimulator from './components/SmsSimulator';
import FakeCall from './components/FakeCall';

type AppPersona = 'survivor' | 'volunteer' | 'ops';

const App: React.FC = () => {
  const [activePersona, setActivePersona] = useState<AppPersona>('survivor');
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [showDemoOverlay, setShowDemoOverlay] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900 overflow-hidden text-slate-900">
      
      {/* Persona Navigation Sidebar / Topbar */}
      {!showDemoOverlay && (
        <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-[100]">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
             <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">SafetyNet <span className="text-violet-600">HER</span></h2>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
             {[
               { id: 'survivor', label: 'Survivor App (SMS)', icon: '📱' },
               { id: 'volunteer', label: 'Volunteer App', icon: '👷‍♀️' },
               { id: 'ops', label: 'Community Ops', icon: '📊' }
             ].map((persona) => (
               <button
                 key={persona.id}
                 onClick={() => setActivePersona(persona.id as AppPersona)}
                 className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   activePersona === persona.id ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'
                 }`}
               >
                 <span>{persona.icon}</span>
                 {persona.label}
               </button>
             ))}
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judge Demo Mode</span>
          </div>
        </div>
      )}

      {/* Intro Overlay */}
      {showDemoOverlay && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex items-center justify-center p-8 text-center text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.4),transparent_50%)]"></div>
          </div>
          
          <div className="max-w-2xl relative z-10 animate-in fade-in zoom-in duration-1000">
             <div className="w-24 h-24 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-[2rem] mx-auto mb-10 flex items-center justify-center text-5xl font-black shadow-2xl rotate-3">S</div>
            <h1 className="text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              SafetyNet HER
            </h1>
            <p className="text-xl text-zinc-400 mb-12 leading-relaxed font-medium">
              A community mesh intelligence designed for <span className="text-violet-400 font-black italic underline decoration-violet-500/50 underline-offset-8">Her Safety</span>. Prevention-first crisis response.
            </p>
            <button 
              onClick={() => setShowDemoOverlay(false)}
              className="bg-white text-zinc-900 px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-violet-50 transition-all shadow-2xl hover:scale-105 active:scale-95"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Context Switching Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Dynamic Persona Viewport */}
        <div className="flex-1 min-w-0 bg-slate-50 h-full relative overflow-hidden">
          
          {/* Survivor Context */}
          {activePersona === 'survivor' && (
            <div className="h-full flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
               <div className="w-full max-w-[340px] h-[720px] relative">
                  <SmsSimulator 
                    onIncidentTriggered={(d) => console.log('Mesh Alert:', d)} 
                    onCallRequested={() => setIsFakeCallActive(true)} 
                  />
                  <p className="absolute -bottom-12 left-0 right-0 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     survivor interaction is 100% SMS-based.
                  </p>
               </div>
            </div>
          )}

          {/* Volunteer Context */}
          {activePersona === 'volunteer' && (
            <div className="h-full flex items-center justify-center p-8 bg-zinc-950 animate-in fade-in slide-in-from-right-10 duration-500">
               <div className="w-full max-w-[400px] h-[760px] rounded-[3rem] overflow-hidden border-[10px] border-zinc-900 shadow-2xl">
                  <VolunteerDashboard />
               </div>
            </div>
          )}

          {/* Ops Context */}
          {activePersona === 'ops' && (
            <div className="h-full animate-in fade-in slide-in-from-bottom-10 duration-500">
               <CommunityOpsDashboard />
            </div>
          )}

        </div>
      </div>

      {isFakeCallActive && (
        <FakeCall onEnd={() => setIsFakeCallActive(false)} />
      )}

      {/* Data Visual Ribbon */}
      <footer className="bg-white h-10 shrink-0 flex items-center justify-between px-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-t border-slate-100">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Mesh Status: <span className="text-slate-900">Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
             Predictive Certainty: <span className="text-violet-600">92.4%</span>
          </div>
          <div className="flex items-center gap-2">
             Active Nodes: <span className="text-slate-900">12 Beasley Hubs</span>
          </div>
        </div>
        <div>
          SafetyNet Protocol — Beasley_HAM_CA
        </div>
      </footer>
    </div>
  );
};

export default App;
