import React, { useState } from 'react';
import { Search, MapPin, Building, IndianRupee, Sparkles, ShieldCheck, ArrowRight, Check, Compass, Layers } from 'lucide-react';
import { CHENNAI_AREAS, PROPERTY_TYPES, BUDGET_RANGES } from '../data/plotsData';

export default function LevitatingHero({ 
  searchKeyword, 
  setSearchKeyword, 
  selectedArea, 
  setSelectedArea, 
  selectedType, 
  setSelectedType, 
  selectedBudget, 
  setSelectedBudget,
  onPerformSearch 
}) {
  const [activeTab, setActiveTab] = useState('buy');

  const popularChips = [
    { label: 'OMR IT Corridor', area: 'OMR' },
    { label: 'ECR Beachside', area: 'ECR' },
    { label: 'Siruseri SIPCOT', area: 'Siruseri' },
    { label: 'Navalur Hub', area: 'Navalur' },
    { label: 'Tambaram GST', area: 'Tambaram' }
  ];

  return (
    <section className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      
      {/* Background Antigravity Floating Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl animate-orb-spin"></div>
        <div className="absolute top-32 right-12 w-80 h-80 rounded-full bg-teal-200/25 blur-3xl animate-pulse-glow"></div>
        <div className="absolute -bottom-10 left-1/3 w-72 h-72 rounded-full bg-emerald-400/15 blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Antigravity floating headline section */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-8 lg:mb-12">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/10 border border-[#1B4D3E]/20 backdrop-blur-md shadow-sm animate-float-gentle">
            <span className="w-2 h-2 rounded-full bg-[#1B4D3E] animate-ping"></span>
            <span className="text-xs font-extrabold text-[#1B4D3E] tracking-wider uppercase">
              CHENNAI REAL ESTATE PORTAL 2026
            </span>
            <ShieldCheck className="w-4 h-4 text-[#1B4D3E]" />
          </div>

          {/* Main Title - One UI Focus Header Style */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111827] tracking-tight leading-[1.12]">
            Discover Floating <span className="bg-gradient-to-r from-[#1B4D3E] via-emerald-700 to-[#1B4D3E] bg-clip-text text-transparent">Verified Plots</span> in Chennai
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            CMDA & DTCP cleared land with guaranteed clear titles across OMR, ECR, Siruseri, Navalur, and booming growth hubs.
          </p>

          {/* Tab Selector Pill (Buy / Investment / Gated Layouts) */}
          <div className="inline-flex p-1 rounded-full bg-white/80 border border-slate-200 backdrop-blur-md shadow-sm">
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'buy'
                  ? 'bg-[#1B4D3E] text-white shadow-md shadow-[#1B4D3E]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buy Residential Plots
            </button>
            <button
              onClick={() => setActiveTab('villa')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'villa'
                  ? 'bg-[#1B4D3E] text-white shadow-md shadow-[#1B4D3E]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Villa Communities
            </button>
            <button
              onClick={() => setActiveTab('commercial')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'commercial'
                  ? 'bg-[#1B4D3E] text-white shadow-md shadow-[#1B4D3E]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Commercial & Farm Land
            </button>
          </div>

        </div>

        {/* Levitating Hero Search Bar Container */}
        <div className="relative max-w-5xl mx-auto">

          {/* Floating Accents / Badges around Search Bar */}
          <div className="hidden lg:flex absolute -left-12 -top-8 items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl shadow-emerald-950/10 text-xs font-bold text-[#1B4D3E] animate-float-slow">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-[#1B4D3E]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold leading-none text-[#111827]">CMDA Approved</p>
              <p className="text-[10px] text-slate-500 font-normal">100% Legal Check</p>
            </div>
          </div>

          <div className="hidden lg:flex absolute -right-10 -bottom-6 items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl shadow-emerald-950/10 text-xs font-bold text-slate-800 animate-float-reverse">
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold leading-none text-[#111827]">14.8% YoY ROI</p>
              <p className="text-[10px] text-slate-500 font-normal">Chennai High Growth</p>
            </div>
          </div>

          {/* Levitating Pill Search Box */}
          <div className="bg-white/90 backdrop-blur-2xl p-3 sm:p-4 rounded-[2.5rem] border border-white/80 shadow-2xl shadow-emerald-950/12 transition-all duration-300 hover:shadow-emerald-950/20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
              
              {/* Keyword / Locality Search */}
              <div className="md:col-span-4 bg-slate-50/90 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 transition-all group focus-within:border-[#1B4D3E] focus-within:ring-2 focus-within:ring-[#1B4D3E]/20">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Location / Keyword
                </label>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#1B4D3E] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search OMR, ECR, Siruseri..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#111827] placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Area Segmented Dropdown */}
              <div className="md:col-span-3 bg-slate-50/90 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 transition-all focus-within:border-[#1B4D3E]">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Chennai Area
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1B4D3E]" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#111827] focus:outline-none cursor-pointer"
                  >
                    {CHENNAI_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name} {area.count ? `(${area.count})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div className="md:col-span-2 bg-slate-50/90 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 transition-all focus-within:border-[#1B4D3E]">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Plot Type
                </label>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#111827] focus:outline-none cursor-pointer"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget Dropdown */}
              <div className="md:col-span-3 lg:col-span-3 flex items-center gap-2">
                <div className="w-full bg-slate-50/90 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 transition-all focus-within:border-[#1B4D3E]">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Max Budget
                  </label>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#111827] focus:outline-none cursor-pointer"
                    >
                      {BUDGET_RANGES.map((b, idx) => (
                        <option key={idx} value={idx}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interactive Search Properties Action Button */}
                <button
                  type="button"
                  onClick={onPerformSearch}
                  className="h-[54px] px-6 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B30] active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-[#1B4D3E]/30 flex items-center justify-center gap-2 shrink-0 transition-all duration-200 group cursor-pointer"
                >
                  <Search className="w-5 h-5 text-emerald-300 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

            </div>
          </div>

          {/* Quick Hotspot Chips */}
          <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#1B4D3E]" /> Popular Chennai Corridors:
            </span>
            {popularChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedArea(chip.area);
                  onPerformSearch();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  selectedArea === chip.area
                    ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                    : 'bg-white/80 text-slate-700 hover:bg-emerald-50 hover:text-[#1B4D3E] border-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
