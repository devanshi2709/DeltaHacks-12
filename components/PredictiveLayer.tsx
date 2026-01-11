
import React, { useState, useEffect } from 'react';
import { getPredictiveInsights } from '../services/geminiService';
import { MOCK_INCIDENTS } from '../constants';
import { PredictiveInsight } from '../types';

const PredictiveLayer: React.FC = () => {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      const data = await getPredictiveInsights(MOCK_INCIDENTS);
      setInsights(data);
      setLoading(false);
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Gemini is analyzing neighborhood patterns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-violet-500 hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-violet-100 rounded-lg">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </span>
              <h3 className="font-bold text-gray-800">{insight.pattern}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400 font-medium">Risk:</span> <span className="text-red-500 font-semibold">{insight.risk}</span></p>
              <p><span className="text-gray-400 font-medium">When:</span> <span className="text-gray-700">{insight.when}</span></p>
              <p><span className="text-gray-400 font-medium">Where:</span> <span className="text-gray-700">{insight.where}</span></p>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-violet-700 font-semibold mb-1">Preventive Action:</p>
                <p className="text-gray-600 italic leading-relaxed">"{insight.prevention}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-violet-900 text-white p-6 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Automated Risk Protocol Activated</h2>
            <p className="text-violet-200">Based on Friday night predictions, 6 extra volunteers have been pre-dispatched to Main St district.</p>
          </div>
          <button className="bg-white text-violet-900 px-6 py-3 rounded-full font-bold hover:bg-violet-50 transition whitespace-nowrap">
            View Live Deployment
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-600 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default PredictiveLayer;
