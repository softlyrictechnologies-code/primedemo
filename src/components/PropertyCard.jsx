import React from 'react';
import { ShieldCheck, MapPin, Heart, ArrowUpRight, SlidersHorizontal } from 'lucide-react';

export default function PropertyCard({ 
  plot, 
  onSelectPlot, 
  isSaved, 
  onToggleSave,
  isCompared,
  onToggleCompare 
}) {
  return (
    <div className="group relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-emerald-950/15 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
      
      {/* Top Image Container */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-t-[2rem]">
        
        {/* Background Land Image */}
        <img
          src={plot.image}
          alt={plot.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay for Text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>

        {/* TOP BADGES */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
          
          {/* VERIFIED Pill Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B4D3E] text-white text-[11px] font-extrabold tracking-wide uppercase shadow-lg shadow-[#1B4D3E]/40 border border-emerald-400/40"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300/30" />
            <span>VERIFIED</span>
          </div>

          {/* Action Buttons: Favorite & Compare */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(plot.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                isCompared 
                  ? 'bg-[#1B4D3E] text-white' 
                  : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
              title={isCompared ? "Remove from Compare" : "Compare Plot"}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(plot.id);
              }}
              className="p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white hover:text-red-500 transition-all shadow-md"
              title="Save Plot"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

        </div>

        {/* BOTTOM IMAGE BADGE (Approval & Type) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-10">
          <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-[11px] font-bold">
            {plot.type}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-400/30 text-[11px] font-bold text-emerald-300">
            {plot.approval}
          </span>
          {plot.isSoldOut && <span className="absolute left-0 top-[-2.5rem] rounded-full bg-rose-700 px-3 py-1 text-[11px] font-extrabold text-white">SOLD OUT</span>}
        </div>

      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Title & Location */}
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1 font-semibold">
            <span className="flex items-center gap-1 text-[#1B4D3E] font-bold">
              <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" /> {plot.location}
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {plot.appreciationRate}
            </span>
          </div>

          <h3 
            onClick={() => onSelectPlot(plot)}
            className="text-lg font-bold text-[#111827] group-hover:text-[#1B4D3E] transition-colors cursor-pointer line-clamp-1"
          >
            {plot.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {plot.subTitle}
          </p>
        </div>

        {/* Pricing Section - Samsung One UI Bold Typography */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Price</p>
            <p className="text-xl font-black text-[#111827] tracking-tight">
              {plot.formattedPrice}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Rate / Sq.Ft</p>
            <p className="text-sm font-extrabold text-[#1B4D3E]">
              ₹{plot.pricePerSqft.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500 font-normal">/ sqft</span>
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
          <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-medium">Area</p>
            <p className="font-bold text-slate-800 mt-0.5">{plot.totalAreaSqft} sq.ft</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-medium">Facing</p>
            <p className="font-bold text-slate-800 mt-0.5 truncate">{plot.facing}</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-medium">Road</p>
            <p className="font-bold text-slate-800 mt-0.5 truncate">{plot.roadWidth}</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center gap-2">
          
          <button
            onClick={() => onSelectPlot(plot)}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#111827] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </button>

        </div>

      </div>

    </div>
  );
}
