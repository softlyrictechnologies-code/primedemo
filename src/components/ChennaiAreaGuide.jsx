import React from 'react';
import { TrendingUp, MapPin, Building2, Train, Waves, ShieldCheck, ArrowRight } from 'lucide-react';
import { CHENNAI_AREAS } from '../data/plotsData';

export default function ChennaiAreaGuide({ onSelectArea }) {
  const guides = [
    {
      id: 'OMR',
      title: 'OMR IT Expressway',
      tagline: 'The Tech & Employment Engine of Chennai',
      avgPrice: '₹4,850 / sqft',
      growth: '+14.5% YoY',
      icon: Building2,
      highlights: ['CMRL Metro Line 3 Corridor', 'TCS, Cognizant, Infosys Campuses', 'High Rental Demand'],
      bgGradient: 'from-emerald-900 to-slate-900'
    },
    {
      id: 'ECR',
      title: 'ECR Coastal Belt',
      tagline: 'Luxury Beachside Enclaves & Gated Estates',
      avgPrice: '₹7,200 / sqft',
      growth: '+18.2% YoY',
      icon: Waves,
      highlights: ['100m Beach Access', 'Fine Dining & Clubs', 'ECR 6-Lane Expressway Extension'],
      bgGradient: 'from-teal-950 to-slate-900'
    },
    {
      id: 'Siruseri',
      title: 'Siruseri SIPCOT Hub',
      tagline: 'Asia’s Largest IT Park Zone for High Growth',
      avgPrice: '₹4,200 / sqft',
      growth: '+13.8% YoY',
      icon: Train,
      highlights: ['SIPCOT Tech Park Expansion', 'Proposed Metro Terminal', 'Top Schools & Universities'],
      bgGradient: 'from-emerald-950 to-emerald-900'
    }
  ];

  return (
    <section className="py-12 bg-white/60 backdrop-blur-md rounded-[3rem] border border-white/80 my-12 p-6 sm:p-10 shadow-xl shadow-slate-200/40">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#1B4D3E] text-xs font-bold uppercase tracking-wider">
              HOTSPOT ANALYSIS 2026
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111827] mt-2 tracking-tight">
              Chennai High-Growth Corridors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Data-backed appreciation metrics & infrastructure developments in key zones.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSelectArea) onSelectArea('all');
              const el = document.getElementById('plots-results-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#143B30] text-white text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All Locations</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectArea(item.id)}
                className="group cursor-pointer rounded-[2rem] p-6 bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#1B4D3E] text-emerald-300 flex items-center justify-center shadow-md">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#1B4D3E] text-xs font-bold border border-emerald-200">
                      {item.growth}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#111827] group-hover:text-[#1B4D3E] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Sq.Ft Rate</span>
                    <span className="text-sm font-extrabold text-[#1B4D3E]">{item.avgPrice}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {item.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B4D3E] group-hover:underline">
                  <span>View Verified Plots in {item.id}</span>
                  <ArrowRight className="w-4 h-4 text-[#1B4D3E] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
