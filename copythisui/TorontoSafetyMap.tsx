
import React from 'react';

const TorontoSafetyMap: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0b1020] rounded-[2rem] overflow-hidden border border-slate-800 shadow-inner group">
      {/* Lake Ontario silhouette */}
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 800 600">
        <path d="M0 380 C200 420 320 450 520 430 C660 415 760 440 800 470 L800 600 L0 600 Z" fill="#0a1228" />
      </svg>

      {/* Base Grid Layer */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      ></div>

      {/* Stylized downtown grid & shoreline */}
      <svg className="absolute inset-0 w-full h-full text-slate-800 opacity-20" viewBox="0 0 800 600">
        <path d="M0 140 L800 140 M0 220 L800 220 M0 300 L800 300 M0 360 L800 360 M0 440 L800 440" stroke="currentColor" strokeWidth="1" />
        <path d="M120 0 L120 600 M220 0 L220 600 M320 0 L320 600 M420 0 L420 600 M520 0 L520 600 M620 0 L620 600" stroke="currentColor" strokeWidth="1" />
        <path d="M40 320 Q 320 360 720 340" stroke="#334155" strokeWidth="3" fill="none" />
        <path d="M260 60 Q 290 260 270 540" stroke="#334155" strokeWidth="3" fill="none" />
      </svg>

      {/* Heatmap Clusters around downtown */}
      <div className="absolute top-[33%] left-[27%] w-56 h-56 bg-rose-600/28 rounded-full blur-[80px]"></div>
      <div className="absolute top-[43%] left-[45%] w-76 h-76 bg-rose-500/22 rounded-full blur-[95px]"></div>
      <div className="absolute top-[24%] left-[63%] w-42 h-42 bg-amber-400/22 rounded-full blur-[70px]"></div>
      <div className="absolute top-[54%] left-[19%] w-50 h-50 bg-emerald-400/18 rounded-full blur-[80px]"></div>

      {/* Active Incident Markers */}
      <div className="absolute top-[34%] left-[30%] group/marker">
        <div className="w-3 h-3 bg-rose-500 rounded-full ring-4 ring-rose-500/20 animate-ping absolute"></div>
        <div className="w-3 h-3 bg-rose-500 rounded-full ring-4 ring-rose-500/20 relative"></div>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-10">
          <p className="text-[10px] font-black text-rose-500">URG 9: STALKING</p>
          <p className="text-[8px] text-white">Queen & Spadina</p>
        </div>
      </div>

      <div className="absolute top-[48%] left-[48%] group/marker">
        <div className="w-3 h-3 bg-violet-500 rounded-full ring-4 ring-violet-500/20 relative"></div>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-10">
          <p className="text-[10px] font-black text-violet-500">ESCORT REQUEST</p>
          <p className="text-[8px] text-white">Union Station</p>
        </div>
      </div>

      <div className="absolute top-[28%] left-[64%] group/marker">
        <div className="w-3 h-3 bg-amber-400 rounded-full ring-4 ring-amber-400/25 relative"></div>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-10">
          <p className="text-[10px] font-black text-amber-300">HARASSMENT</p>
          <p className="text-[8px] text-white">Distillery District</p>
        </div>
      </div>

      {/* More downtown markers to reflect higher activity */}
      {[
        { top: 37.5, left: 41.2, label: 'FOLLOWING', color: 'bg-rose-400', ring: 'ring-rose-400/25', place: 'Eaton Centre' },
        { top: 21.8, left: 46.6, label: 'HARASSMENT', color: 'bg-amber-400', ring: 'ring-amber-400/25', place: 'Yorkville' },
        { top: 31.4, left: 53.2, label: 'ESCORT', color: 'bg-violet-400', ring: 'ring-violet-400/25', place: 'PATH' },
        { top: 45.2, left: 59.1, label: 'INTOX', color: 'bg-emerald-400', ring: 'ring-emerald-400/25', place: 'St. Lawrence' },
        { top: 53.6, left: 29.5, label: 'FOLLOWING', color: 'bg-rose-500', ring: 'ring-rose-500/25', place: 'Harbourfront' },
        { top: 17.4, left: 33.8, label: 'ASSAULT', color: 'bg-rose-500', ring: 'ring-rose-500/30', place: 'Kensington' },
        { top: 58.9, left: 51.6, label: 'ESCORT', color: 'bg-violet-500', ring: 'ring-violet-500/25', place: 'Exhibition' },
        { top: 25.2, left: 23.7, label: 'HARASSMENT', color: 'bg-amber-500', ring: 'ring-amber-500/25', place: 'Little Italy' },
        { top: 63.3, left: 43.1, label: 'INTOX', color: 'bg-emerald-400', ring: 'ring-emerald-400/25', place: 'Billy Bishop' },
        { top: 41.7, left: 67.4, label: 'FOLLOWING', color: 'bg-rose-400', ring: 'ring-rose-400/25', place: 'Leslieville' },
        { top: 47.5, left: 71.1, label: 'HARASSMENT', color: 'bg-amber-400', ring: 'ring-amber-400/25', place: 'Riverside' },
        { top: 33.1, left: 15.6, label: 'ESCORT', color: 'bg-violet-400', ring: 'ring-violet-400/25', place: 'Trinity Bellwoods' },
        { top: 55.8, left: 65.2, label: 'ASSAULT', color: 'bg-rose-500', ring: 'ring-rose-500/25', place: 'Corktown' },
        { top: 19.5, left: 57.2, label: 'HARASSMENT', color: 'bg-amber-400', ring: 'ring-amber-400/25', place: 'Rosedale' },
        { top: 61.4, left: 23.3, label: 'FOLLOWING', color: 'bg-rose-500', ring: 'ring-rose-500/25', place: 'Fort York' },
        { top: 45.1, left: 37.2, label: 'INTOX', color: 'bg-emerald-400', ring: 'ring-emerald-400/25', place: 'Chinatown' },
      ].map((m, idx) => (
        <div
          key={idx}
          className="absolute group/marker"
          style={{ top: `${m.top}%`, left: `${m.left}%` }}
        >
          <div className={`w-3 h-3 ${m.color} rounded-full ring-4 ${m.ring} relative`}></div>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-10">
            <p className="text-[10px] font-black text-white">{m.label}</p>
            <p className="text-[8px] text-white">{m.place}</p>
          </div>
        </div>
      ))}

      {/* Map UI Overlay */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Risk Intensity</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="w-1/3 h-full bg-emerald-500"></div>
              <div className="w-1/3 h-full bg-amber-500"></div>
              <div className="w-1/3 h-full bg-rose-500"></div>
            </div>
            <span className="text-[9px] font-bold text-white uppercase">Critical</span>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 flex flex-col gap-2">
         <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-xl text-[10px] font-black text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
            DOWNTOWN HEATMAP LIVE
         </div>
      </div>

      {/* Landmark Labels */}
      <div className="absolute top-[12%] left-[52%] text-[10px] font-black text-slate-600 uppercase tracking-tighter pointer-events-none">Bloor St</div>
      <div className="absolute top-[78%] left-[36%] text-[10px] font-black text-slate-600 uppercase tracking-tighter pointer-events-none rotate-[-8deg]">Lakeshore Blvd</div>
      <div className="absolute top-[50%] left-[46%] text-[10px] font-black text-slate-500 uppercase tracking-tighter pointer-events-none">Union</div>
      <div className="absolute top-[33%] left-[30%] text-[10px] font-black text-slate-500 uppercase tracking-tighter pointer-events-none">Queen & Spadina</div>
      <div className="absolute top-[28%] left-[64%] text-[10px] font-black text-slate-500 uppercase tracking-tighter pointer-events-none">Distillery</div>
    </div>
  );
};

export default TorontoSafetyMap;
