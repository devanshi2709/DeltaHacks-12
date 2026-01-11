import React, { useState } from 'react';
import { MOCK_INCIDENTS, MOCK_VOLUNTEERS } from '../constants';
import PredictiveLayer from './PredictiveLayer';
import { Incident } from '@/services/types';

const VolunteerDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [activeTab, setActiveTab] = useState<'live' | 'predictive'>('live');

  const handleAction = (id: string, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: newStatus } : inc
    ));
  };

  return (
    <div className="flex flex-col h-full bg-[#121214] text-white">
      <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Volunteer Dispatch</h1>
          <p className="text-sm font-bold flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Sarah M. (Online)
          </p>
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

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'live' && (
          <section className="space-y-8">
            <h2 className="text-lg font-bold text-gray-700">Active Incidents</h2>

            {incidents.map(incident => (
              <div 
                key={incident.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {incident.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {incident.time} • {incident.locationName}
                    </span>
                  </div>

                  {incident.userMessage && (
                    <p className="text-gray-800 font-medium mb-4">
                      {incident.userMessage}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(incident.id, 'accepted')}
                      className="bg-violet-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-violet-700 transition"
                    >
                      Accept
                    </button>
                    <button 
                      className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
                    >
                      Contact User
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'predictive' && (
          <PredictiveLayer incidents={incidents}/>
        )}
      </main>
    </div>
  );
};

export default VolunteerDashboard;
 