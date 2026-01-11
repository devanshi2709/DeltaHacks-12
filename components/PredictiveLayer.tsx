// PredictiveLayer.tsx
import React from 'react';
import { MOCK_PREDICTIVE_INSIGHTS } from '../constants';

const PredictiveLayer: React.FC = () => {
  if (MOCK_PREDICTIVE_INSIGHTS.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 font-medium">
        No predictive insights available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">Predictive Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PREDICTIVE_INSIGHTS.map((insight, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                insight.risk === 'High' ? 'bg-red-100 text-red-600' :
                insight.risk === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {insight.risk} Risk
              </span>
              <span className="text-xs text-gray-400">{insight.when}</span>
            </div>
            <h3 className="text-md font-bold text-gray-800 mb-1">{insight.pattern}</h3>
            <p className="text-gray-500 text-sm mb-2"><strong>Location:</strong> {insight.where}</p>
            <p className="text-gray-500 text-sm mb-4"><strong>Prevention:</strong> {insight.prevention}</p>
            <button className="bg-violet-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-violet-700 transition">
              Assign Volunteer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictiveLayer;
