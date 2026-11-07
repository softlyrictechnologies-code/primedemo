import React, { useState } from 'react';
import { MapPin, ShieldCheck, X, Eye, Navigation, Layers, Compass } from 'lucide-react';

export default function InteractiveMapModal({ plots, onSelectPlot }) {
  const [selectedMapPlot, setSelectedMapPlot] = useState(plots[0] || null);

  return (
    <div className="relative w-full h-[550px] rounded-[2.5rem] bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl my-6 flex flex-col md:flex-row">
      
      {/* Map Interactive Canvas (Stylized SVG / Visual Map) */}
      <div className="relative flex-1 bg-[#0F172A] p-4 flex items-center justify-center overflow-hidden select-none">
        
        {/* Decorative Grid Lines representing Chennai Corridors (OMR, ECR, GST) */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 600">
          {/* OMR Main Expressway */}
          <path d="M 150 50 Q 300 250 500 550" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="8 8" />
          <text x="320" y="270" fill="#34D399" fontSize="12" fontWeight="bold">OMR IT CORRIDOR</text>

          {/* ECR Coastal Road */}
          <path d="M 450 50 Q 550 250 720 550" fill="none" stroke="#06B6D4" strokeWidth="4" />
          <text x="560" y="280" fill="#67E8F9" fontSize="12" fontWeight="bold">EAST COAST ROAD (ECR)</text>

          {/* GST Road */}
          <path d="M 50 100 Q 120 300 250 550" fill="none" stroke="#64748B" strokeWidth="3" />
          <text x="130" y="320" fill="#94A3B8" fontSize="11">GST ROAD</text>

          {/* Ocean Bay of Bengal */}
          <rect x="680" y="0" width="120" height="600" fill="#0284C7" opacity="0.2" />
          <text x="700" y="300" fill="#38BDF8" fontSize="14" fontWeight="bold" transform="rotate(90, 720, 300)">BAY OF BENGAL</text>
        </svg>

        {/* Map Legend / Compass */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white text-xs space-y-1">
          <p className="font-extrabold text-emerald-400 flex items-center gap-1">
            <Compass className="w-4 h-4" /> CHENNAI SPATIAL MAP
          </p>
          <p className="text-[10px] text-slate-400">Click pins to inspect CMDA plot layouts</p>
        </div>

        {/* Interactive Plot Pins floating on map canvas */}
        <div className="relative w-full h-full max-w-2xl max-h-[450px]">
          {plots.map((p, idx) => {
            // Calculate pseudo coordinates for demonstration on canvas
            const topPositions = ['25%', '45%', '55%', '20%', '65%', '75%', '40%', '80%'];
            const leftPositions = ['35%', '65%', '42%', '48%', '70%', '25%', '30%', '45%'];
            
            const top = topPositions[idx % topPositions.length];
            const left = leftPositions[idx % leftPositions.length];
            const isSelected = selectedMapPlot?.id === p.id;

            return (
              <div
                key={p.id}
                style={{ top, left }}
                onClick={() => setSelectedMapPlot(p)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-black shadow-xl flex items-center gap-1 border transition-all ${
                  isSelected
                    ? 'bg-[#1B4D3E] text-white border-emerald-400 ring-4 ring-emerald-500/30'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-[#1B4D3E]'
                }`}>
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-[#1B4D3E]'}`} />
                  <span>{p.formattedPrice}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Plot Drawer on Right */}
      {selectedMapPlot && (
        <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-5 flex flex-col justify-between text-white space-y-4 shrink-0">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> CMDA Approved
              </span>
              <span>{selectedMapPlot.area}</span>
            </div>

            <img
              src={selectedMapPlot.image}
              alt={selectedMapPlot.title}
              className="w-full h-32 object-cover rounded-2xl mb-3 border border-slate-700"
            />

            <h4 className="font-extrabold text-sm line-clamp-2">{selectedMapPlot.title}</h4>
            <p className="text-xs text-slate-400 mt-1">{selectedMapPlot.location}</p>

            <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Price</p>
                <p className="text-lg font-black text-emerald-400">{selectedMapPlot.formattedPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Area</p>
                <p className="text-xs font-bold text-white">{selectedMapPlot.totalAreaSqft} sqft</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlot(selectedMapPlot)}
            className="w-full py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B30] text-white text-xs font-bold shadow-lg shadow-[#1B4D3E]/40 flex items-center justify-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-300" /> View Full Plot Details
          </button>
        </div>
      )}

    </div>
  );
}
