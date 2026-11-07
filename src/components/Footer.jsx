import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, MapPin, Phone, Mail, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { CHENNAI_STATS, REVIEWS } from '../data/plotsData';

export default function Footer({ onOpenListModal }) {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/80 backdrop-blur-2xl relative overflow-hidden">
      
      {/* Testimonials Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-100">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#1B4D3E] text-xs font-extrabold uppercase">
            TRUSTED BY 8,500+ CHENNAI BUYERS
          </span>
          <h3 className="text-2xl font-black text-[#111827]">What Land Buyers Say</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(rev.rating)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                "{rev.comment}"
              </p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-[#111827]">{rev.name}</p>
                  <p className="text-[10px] text-slate-400">{rev.role}</p>
                </div>
                <span className="text-[10px] font-bold text-[#1B4D3E] bg-emerald-50 px-2 py-0.5 rounded-full">
                  {rev.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <button 
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#1B4D3E] text-white flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-[#111827]">
                  Prime <span className="text-[#1B4D3E]">Housing</span>
                </span>
                <p className="text-[11px] font-medium text-slate-500">Verified Properties. Better Decisions.</p>
              </div>
            </button>

            <p className="text-xs text-slate-600 leading-relaxed">
              Chennai's premier antigravity real estate platform for CMDA & DTCP approved land parcels in OMR, ECR, Siruseri, Navalur, and high-growth investment zones.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs font-bold text-[#1B4D3E]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#1B4D3E]" /> 100% Legal Check
              </span>
              <span>•</span>
              <span>0% Hidden Fees</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs font-semibold">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Navigation & Links</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link to="/properties" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>Browse All Chennai Plots</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/submit-land" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>List Your Land / Sell Property</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>About Our Company</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>Contact & Support</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Chennai Corridors */}
          <div className="md:col-span-2 space-y-3 text-xs font-semibold">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Key Corridors</h4>
            <ul className="space-y-2 text-slate-600">
              <li>OMR Tech Expressway</li>
              <li>ECR Coastal Belt</li>
              <li>Siruseri SIPCOT Hub</li>
              <li>Navalur Residential</li>
              <li>Tambaram & GST Road</li>
              <li>Porur & DLF Cybercity</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Chennai Land Advisory</h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <p className="font-bold text-[#111827]">Prime Housing Verification Desk</p>
              <p className="text-[#1B4D3E] font-extrabold flex items-center gap-1.5 text-sm">
                <Phone className="w-4 h-4" /> +91 044 4890 2026
              </p>
              <p className="text-slate-500 text-[11px] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> support@primehousing.in
              </p>
              <p className="text-slate-500 text-[11px] pt-1">
                Anna Salai / OMR Toll Plaza, Chennai
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Rights Notice */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 font-medium">
          <p>© 2026 Prime Housing Chennai. All rights reserved. Verified under CMDA & DTCP Guidelines.</p>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('plots-results-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#1B4D3E] cursor-pointer"
            >
              CMDA Verification Protocol
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={onOpenListModal}
              className="hover:text-[#1B4D3E] cursor-pointer"
            >
              Sell Land
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
