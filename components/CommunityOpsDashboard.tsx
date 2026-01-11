// CommunityOpsDashboard.tsx
import React from 'react';
import PredictiveLayer from './PredictiveLayer';
<<<<<<< HEAD
import LiveHeatMap from './LiveHeatMap';
import { MOCK_INCIDENTS } from '../constants';

const CommunityOpsDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b flex justify-between items-center shrink-0">
=======
import TorontoSafetyMap from './TorontoSafetyMap';

const CommunityOpsDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#fdfdfd] overflow-hidden">
      <header className="px-10 py-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
>>>>>>> origin/frontend
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Beasley Community Ops</h1>
          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.3em]">Mesh Intelligence Center</p>
        </div>
<<<<<<< HEAD
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400">Mesh Status</p>
            <p className="text-xs font-black text-green-500 uppercase">ACTIVE HUB</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Risk Tonight', val: 'HIGH', color: 'text-rose-500' },
            { label: 'Volunteers Active', val: '42', color: 'text-violet-600' },
            { label: 'Avg Response', val: '6m 20s', color: 'text-slate-900' },
            { label: 'Shelter Cap', val: '85%', color: 'text-emerald-500' }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</p>
            </div>
          ))}
        </div>

        {/* Heatmap & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Heatmap Section */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Neighborhood Hotspots</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase">Live Heatmap</span>
            </div>
            <div className="flex-1 rounded-[2rem] overflow-hidden">
              <LiveHeatMap 
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} 
                points={MOCK_INCIDENTS.map(i => i.location)} 
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Recent Activity</h3>
            <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
              {[
                { t: 'Resolved', d: 'Escort from campus complete', time: '12m ago' },
                { t: 'Warning', d: 'Stalking hotspot detected: James St', time: '24m ago' },
                { t: 'Log', d: '4 new volunteers checked in', time: '1h ago' },
                { t: 'Log', d: 'Shelter status synced', time: '2h ago' }
              ].map((log, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1 h-auto bg-slate-100 rounded-full group-hover:bg-violet-200 transition-colors"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-900">{log.t}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{log.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Download Mesh Report
            </button>
          </div>
        </div>

        {/* Predictive Layer */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Predictive Safety Forecasting</h3>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Generated by Gemini Pro</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Force Re-Analyze</button>
            </div>
          </div>
          <PredictiveLayer />
        </div>
=======
        <div className="flex gap-6 items-center">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Global Mesh Status</p>
              <p className="text-xs font-black text-emerald-500 uppercase flex items-center justify-end gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </p>
           </div>
           <button className="w-12 h-12 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl flex items-center justify-center text-slate-500 border border-slate-100 shadow-sm">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Predicted Tonight', val: 'HIGH RISK', color: 'text-rose-600', sub: 'Beasley Hub Sector 4' },
             { label: 'Mesh Nodes On-Duty', val: '42 Active', color: 'text-violet-600', sub: '92.4% Coverage' },
             { label: 'Avg Peer Response', val: '6m 20s', color: 'text-slate-900', sub: '12% Faster than 911' }
           ].map((kpi, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{kpi.label}</p>
                <p className={`text-3xl font-black tracking-tight ${kpi.color}`}>{kpi.val}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-2">{kpi.sub}</p>
             </div>
           ))}
        </div>

        {/* Heatmap Section */}
        <section>
          <div className="flex justify-between items-end mb-8 px-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Real-Time Risk Landscape</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Geospatial Feed • Hamilton/Toronto</p>
            </div>
            <div className="flex gap-3">
               <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Export Hotspots</button>
            </div>
          </div>
          <div className="h-[500px]">
            <TorontoSafetyMap />
          </div>
        </section>

        {/* Predictive Forecasting */}
        <section className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-2xl shadow-slate-100">
           <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Predictive Safety Intelligence</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Synthesized via Gemini-3-Pro Neural Engine</p>
              </div>
              <button className="p-4 bg-violet-50 text-violet-600 rounded-2xl hover:bg-violet-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
           </div>
           <PredictiveLayer />
        </section>

        {/* Recent Events / Log */}
        <section className="pb-10">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 px-4">Audit Trail</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { type: 'RESOLVED', desc: 'Walking escort from Bay Station safely completed by Volunteer Sarah.', time: '4m ago' },
                { type: 'DISPATCH', desc: 'Emergency mesh alert triggered in Beasley Sector 2. Priority 9.', time: '18m ago' }
              ].map((log, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-[1.8rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${log.type === 'RESOLVED' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900">{log.type}</p>
                      <p className="text-xs text-slate-500 font-medium leading-snug">{log.desc}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">{log.time}</span>
                </div>
              ))}
           </div>
        </section>
>>>>>>> origin/frontend
      </div>
    </div>
  );
};

export default CommunityOpsDashboard;
