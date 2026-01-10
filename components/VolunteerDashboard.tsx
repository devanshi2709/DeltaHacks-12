
import React, { useState } from 'react';
import { MOCK_INCIDENTS, MOCK_VOLUNTEERS } from '../constants';
import { Urgency } from '@/services/types';
import PredictiveLayer from './PredictiveLayer';

const VolunteerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'predictive'>('live');

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">S</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">SafetyNet HER Dashboard</h1>
            <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Monitoring Active: Beasley District
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('live')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'live' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             Live Response
           </button>
           <button 
             onClick={() => setActiveTab('predictive')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'predictive' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             Predictive Insights
           </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'live' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-lg font-bold text-gray-700">Active Incidents</h2>
                {MOCK_INCIDENTS.map(incident => (
                  <div key={incident.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                      incident.urgency === Urgency.CRITICAL ? 'bg-red-100 text-red-600' : 
                      incident.urgency === Urgency.HIGH ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{incident.category}</span>
                        <span className="text-xs text-gray-400">{incident.time} • {incident.location.area}</span>
                      </div>
                      <p className="text-gray-800 font-medium mb-4">{incident.description}</p>
                      <div className="flex gap-2">
                        <button className="bg-violet-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-violet-700 transition">Dispatch Volunteer</button>
                        <button className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition">Contact User</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-700">Available Volunteers</h2>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  {MOCK_VOLUNTEERS.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{v.name}</p>
                          <p className="text-[10px] text-gray-400">{v.skills[0]} • ⭐ {v.rating}</p>
                        </div>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${v.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                  ))}
                  <button className="w-full py-3 text-violet-600 font-bold text-sm border-2 border-dashed border-violet-100 rounded-xl hover:bg-violet-50 transition">
                    + Add Volunteer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PredictiveLayer />
        )}
      </main>
    </div>
  );
};

export default VolunteerDashboard;
