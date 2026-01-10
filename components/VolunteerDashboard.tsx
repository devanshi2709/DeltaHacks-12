
import React, { useState } from 'react';
import { MOCK_INCIDENTS, MOCK_VOLUNTEERS } from '../constants';
import { Urgency, Incident } from '../types';

const VolunteerDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);

  const handleAction = (id: string, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: newStatus } : inc
    ));
  };

  return (
    <div className="flex flex-col h-full bg-[#121214] text-white">
      {/* Mobile-style Volunteer Header */}
      <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Volunteer Dispatch</h1>
          <p className="text-sm font-bold flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Sarah M. (Online)
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-zinc-800 rounded-xl">
             <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-400">Open Incidents</h2>
          {incidents.filter(i => i.status === 'open' || i.status === 'accepted').map(incident => (
            <div key={incident.id} className="bg-zinc-900 border border-white/5 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden group">
              {incident.urgencyScore >= 8 && (
                <div className="absolute top-0 right-0 p-3">
                   <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-full border border-rose-500/20 animate-pulse">URG {incident.urgencyScore}</span>
                </div>
              )}
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                  {incident.category === 'FOLLOWED' ? '👣' : '🏃‍♀️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase text-zinc-500 tracking-wider leading-none mb-1">{incident.category}</p>
                  <p className="text-sm font-bold truncate">{incident.location.area} • {incident.time}</p>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed italic">"{incident.description}"</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {incident.status === 'open' ? (
                  <button 
                    onClick={() => handleAction(incident.id, 'accepted')}
                    className="col-span-2 bg-violet-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all active:scale-95 shadow-xl shadow-violet-600/20"
                  >
                    Accept Incident
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleAction(incident.id, 'on-scene')}
                      className="bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95"
                    >
                      On Scene
                    </button>
                    <button 
                      onClick={() => handleAction(incident.id, 'resolved')}
                      className="bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all active:scale-95"
                    >
                      Escalate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
           <div className="flex justify-between items-center">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Active Volunteers</h2>
             <span className="text-[10px] font-bold text-green-500 uppercase">Mesh Connected</span>
           </div>
           <div className="bg-zinc-900/50 rounded-3xl p-4 border border-white/5 space-y-3">
              {MOCK_VOLUNTEERS.map(v => (
                <div key={v.id} className="flex items-center justify-between p-2">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500">{v.name.charAt(0)}</div>
                      <div>
                        <p className="text-xs font-bold">{v.name}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">0.6 km • ⭐ {v.rating}</p>
                      </div>
                   </div>
                   <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${v.status === 'busy' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                      {v.status}
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* Volunteer Bottom Navigation */}
      <nav className="h-20 border-t border-white/5 flex items-center justify-around px-8 bg-zinc-950 shrink-0">
         <button className="text-violet-500 flex flex-col items-center gap-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <span className="text-[8px] font-black uppercase">Feed</span>
         </button>
         <button className="text-zinc-600 flex flex-col items-center gap-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            <span className="text-[8px] font-black uppercase">Map</span>
         </button>
         <button className="text-zinc-600 flex flex-col items-center gap-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-[8px] font-black uppercase">History</span>
         </button>
      </nav>
    </div>
  );
};

export default VolunteerDashboard;
