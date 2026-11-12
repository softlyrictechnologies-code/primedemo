import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, CheckCircle2, Calculator, Download, Compass, Share2, Layers } from 'lucide-react';

export default function PropertyDetailModal({ plot, onClose, onTriggerToast }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(15);
  const [activeTab, setActiveTab] = useState('overview'); // overview | legal | emi | layout

  if (!plot) return null;

  // EMI Calculation Math
  const totalPrice = plot.priceLakhs * 100000;
  const downPayment = (totalPrice * downPaymentPercent) / 100;
  const loanAmount = totalPrice - downPayment;
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  
  const monthlyEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  // 5 Year ROI Estimate
  const appreciationPercent = parseFloat(plot.appreciationRate) || 14.5;
  const estimated5YrPriceLakhs = (plot.priceLakhs * Math.pow(1 + appreciationPercent / 100, 5)).toFixed(1);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plot.title,
        text: `Check out this verified plot in ${plot.location} on Prime Housing!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onTriggerToast("Plot link copied to clipboard!");
    }
  };

  const handleDownloadPdf = () => {
    onTriggerToast(`Downloading CMDA Verification Report for ${plot.title}...`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-2xl shadow-emerald-950/20 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#1B4D3E] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> VERIFIED PLOT
            </span>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              Ref ID: {plot.id.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Share Plot"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-[#111827] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Main Title & Quick Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" /> {plot.location}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              {plot.title}
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-1">
              {plot.subTitle}
            </p>
          </div>

          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <img
                src={plot.gallery[activeImageIndex] || plot.image}
                alt={plot.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
                {activeImageIndex + 1} / {plot.gallery.length} Photos
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {plot.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx ? 'border-[#1B4D3E] scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'overview', label: 'Overview & Features' },
              { id: 'legal', label: 'Legal & Verification Audit' },
              { id: 'emi', label: 'EMI & ROI Calculator' },
              { id: 'layout', label: 'Plot Layout Map' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1B4D3E] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Highlight Price & Sq.Ft Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-emerald-50/60 border border-emerald-200/60">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Price</p>
                  <p className="text-xl font-black text-[#1B4D3E]">{plot.formattedPrice}</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Rate per Sq.Ft</p>
                  <p className="text-lg font-extrabold text-[#111827]">₹{plot.pricePerSqft.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Area</p>
                  <p className="text-lg font-extrabold text-[#111827]">{plot.totalAreaSqft} sq.ft</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Dimensions</p>
                  <p className="text-lg font-extrabold text-[#111827]">{plot.dimensions}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider mb-2">About Plot</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {plot.description}
                </p>
              </div>

              {/* Key Infrastructure & Landmarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <h5 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1B4D3E]" /> Proximity & Connectivity
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {plot.landmarks.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <h5 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#1B4D3E]" /> Layout Amenities
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {plot.amenities.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LEGAL & VERIFICATION AUDIT */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                    Prime Housing 100% Legal Guarantee
                  </h4>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Verified by High Court Advocates & CMDA Registered Surveyors.
                  </p>
                </div>
                <button 
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 rounded-xl bg-white text-[#1B4D3E] text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Report PDF
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Planning Approval Authority</p>
                  <p className="font-extrabold text-[#111827] text-sm mt-1">{plot.approval}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-mono">{plot.approvalNo}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Patta & Revenue Status</p>
                  <p className="font-extrabold text-[#111827] text-sm mt-1">{plot.pattaStatus}</p>
                  <p className="text-emerald-700 font-semibold text-[11px] mt-0.5">✓ Zero Encumbrance (Nil EC)</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Water Table & Depth</p>
                  <p className="font-extrabold text-[#111827] text-sm mt-1">{plot.waterSource}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Approved Bank Loans</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {plot.bankLoans.map((bank, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-bold text-[11px]">
                        {bank}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMI & ROI CALCULATOR */}
          {activeTab === 'emi' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-3xl bg-slate-50 border border-slate-200">
                
                {/* Sliders */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Down Payment ({downPaymentPercent}%)</span>
                      <span className="text-[#1B4D3E]">₹{(downPayment / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full accent-[#1B4D3E] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Interest Rate ({interestRate}%)</span>
                      <span className="text-[#1B4D3E]">{interestRate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min="7.0"
                      max="12.0"
                      step="0.25"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full accent-[#1B4D3E] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Loan Tenure</span>
                      <span className="text-[#1B4D3E]">{tenureYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="1"
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className="w-full accent-[#1B4D3E] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Output Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Estimated Monthly EMI</p>
                    <p className="text-3xl font-black text-[#1B4D3E] tracking-tight mt-1">
                      ₹{monthlyEmi.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">/ month</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Loan Amount: ₹{(loanAmount / 100000).toFixed(2)} Lakhs
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" /> 5-Year Capital Appreciation:
                    </p>
                    <p className="text-lg font-black text-[#111827] mt-0.5">
                      Est. Value: ₹{estimated5YrPriceLakhs} Lakhs
                    </p>
                    <p className="text-[11px] text-slate-500">Based on historical Chennai corridor growth rate ({plot.appreciationRate}).</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE PLOT LAYOUT MAP */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">CMDA Master Plan Layout</h4>
                  <p className="text-sm font-extrabold mt-0.5">{plot.title} (Plot No. 42)</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {plot.facing}
                </span>
              </div>

              {/* SVG Layout Simulation */}
              <div className="relative h-72 w-full rounded-3xl bg-emerald-950/90 border border-emerald-800/60 p-4 flex items-center justify-center overflow-hidden">
                
                {/* Compass North Arrow */}
                <div className="absolute top-4 right-4 flex flex-col items-center bg-slate-900/80 p-2 rounded-xl border border-white/20 text-white text-[10px] font-bold">
                  <Compass className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span>NORTH</span>
                </div>

                {/* SVG Visual Plot Representation */}
                <svg className="w-full h-full max-w-md" viewBox="0 0 400 240">
                  {/* Road */}
                  <rect x="20" y="190" width="360" height="40" fill="#334155" rx="4" />
                  <text x="200" y="215" fill="#94A3B8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {plot.roadWidth}
                  </text>
                  <line x1="20" y1="210" x2="380" y2="210" stroke="#F1F5F9" strokeDasharray="6 6" strokeWidth="1" />

                  {/* Adjacent Plots */}
                  <rect x="20" y="30" width="90" height="150" fill="#0F172A" stroke="#334155" strokeWidth="2" rx="4" />
                  <text x="65" y="110" fill="#64748B" fontSize="10" textAnchor="middle">Plot 41</text>

                  {/* TARGET PLOT (HIGHLIGHTED EMERALD) */}
                  <rect x="120" y="30" width="160" height="150" fill="#1B4D3E" stroke="#34D399" strokeWidth="3" rx="8" />
                  <text x="200" y="90" fill="#A7F3D0" fontSize="14" fontWeight="bold" textAnchor="middle">PLOT NO. 42</text>
                  <text x="200" y="110" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">{plot.dimensions}</text>
                  <text x="200" y="130" fill="#6EE7B7" fontSize="11" textAnchor="middle">({plot.totalAreaSqft} sq.ft)</text>

                  {/* Neighboring plot */}
                  <rect x="290" y="30" width="90" height="150" fill="#0F172A" stroke="#334155" strokeWidth="2" rx="4" />
                  <text x="335" y="110" fill="#64748B" fontSize="10" textAnchor="middle">Plot 43</text>
                </svg>

              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Bottom Actions Bar */}
        <div className="sticky bottom-0 z-20 px-6 py-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-slate-400">Asking Price</p>
            <p className="text-xl font-black text-[#1B4D3E]">{plot.formattedPrice}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-700/30 transition-all hover:bg-brand-800"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
}
