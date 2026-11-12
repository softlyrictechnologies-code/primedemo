import React, { useEffect, useState } from 'react';
import { Filter, ArrowUpDown, ShieldCheck, Grid, Map } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function QuickFiltersBar({
  selectedArea,
  setSelectedArea,
  sortBy,
  setSortBy,
  onlyCmdaApproved,
  setOnlyCmdaApproved,
  totalResultsCount,
  viewMode,
  setViewMode
}) {
  const [areaOptions, setAreaOptions] = useState([{ id: 'all', name: 'All Locations' }]);

  useEffect(() => {
    let isMounted = true;

    async function loadAreas() {
      try {
        const snap = await getDocs(query(collection(db, 'locations'), where('active', '==', true)));
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        const entries = items
          .filter((item) => !item.type || item.type === 'location')
          .map((item) => ({ id: String(item.name || item.id), name: item.name || item.id }))
          .filter((item) => item.name)
          .filter((item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index);

        if (isMounted) {
          setAreaOptions([{ id: 'all', name: 'All Locations' }, ...entries]);
        }
      } catch (error) {
        console.error('Failed to load location chips from Firestore:', error);
      }
    }

    loadAreas();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] border border-white/80 shadow-lg shadow-slate-200/50 mb-8 space-y-4">
      
      {/* Top Row: Area Chips & View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Area Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#1B4D3E]" /> Area:
          </span>
          {areaOptions.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedArea === area.id
                  ? 'bg-[#1B4D3E] text-white shadow-md shadow-[#1B4D3E]/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{area.name}</span>
              {area.hot && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          ))}
        </div>

        {/* View Mode Toggle (Grid vs Map) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="inline-flex p-1 bg-slate-100 rounded-full border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1B4D3E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-[#1B4D3E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Filter Controls: CMDA Toggle, Sort By, Results Counter */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* CMDA Only Filter */}
        <div className="flex items-center gap-3">
          <label 
            onClick={() => setOnlyCmdaApproved(!onlyCmdaApproved)}
            className="cursor-pointer inline-flex items-center gap-2 select-none group"
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              onlyCmdaApproved 
                ? 'bg-[#1B4D3E] border-[#1B4D3E] text-white' 
                : 'bg-white border-slate-300 group-hover:border-[#1B4D3E]'
            }`}>
              {onlyCmdaApproved && <ShieldCheck className="w-3.5 h-3.5" />}
            </div>
            <span className="font-bold text-slate-700 group-hover:text-[#1B4D3E]">
              CMDA / DTCP Approved Only
            </span>
          </label>
        </div>

        {/* Results Counter & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-[#111827]">{totalResultsCount}</strong> Verified Plots
          </span>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="sqft-asc">Rate/Sq.ft: Low to High</option>
              <option value="appreciation">Highest Appreciation</option>
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
