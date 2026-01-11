// CommunityOpsDashboard.tsx
import React from 'react';
import PredictiveLayer from './PredictiveLayer';
import LiveHeatMap from './LiveHeatMap';
import { MOCK_INCIDENTS } from '../constants';

const CommunityOpsDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">Beasley Community Ops</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">System Coordination Console</p>
        </div>
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
      </div>
    </div>
  );
};

export default CommunityOpsDashboard;
