import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Plus, Heart, SlidersHorizontal, Menu, X, Sparkles, Building2, CheckCircle2, Shield } from 'lucide-react';

export default function Header({ savedCount, onOpenListModal, onOpenComparison, compareCount }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-white/85 backdrop-blur-xl border-b border-white/40 shadow-lg shadow-emerald-950/5' 
        : 'py-4 bg-white/70 backdrop-blur-md border-b border-white/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Subtitle */}
          <button 
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="group flex items-center gap-3 focus:outline-none text-left cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1B4D3E] to-[#2D6A56] p-0.5 shadow-lg shadow-[#1B4D3E]/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#1B4D3E] rounded-[14px] flex items-center justify-center text-white">
                <Building2 className="w-6 h-6 animate-pulse-glow text-emerald-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827]">
                  Prime <span className="text-[#1B4D3E]">Housing</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#1B4D3E] border border-emerald-300/50">
                  CHENNAI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide hidden sm:block">
                Verified Properties. Better Decisions.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
            <Link
              to="/properties"
              className="px-4 py-2 rounded-full text-xs font-bold text-[#111827] hover:bg-white hover:text-[#1B4D3E] hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              Buy Plots
            </Link>
            <Link
              to="/submit-land"
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:bg-white hover:text-[#1B4D3E] hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              Sell Land
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:bg-white hover:text-[#1B4D3E] hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
              About Us
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Contact Us
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Compare Badge Drawer Trigger */}
            {compareCount > 0 && (
              <button
                onClick={onOpenComparison}
                className="relative px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center gap-1.5 animate-bounce"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compare</span>
                <span className="w-5 h-5 rounded-full bg-[#1B4D3E] text-white text-[11px] font-black flex items-center justify-center">
                  {compareCount}
                </span>
              </button>
            )}

            {/* Saved Plots pill */}
            <div className="relative">
              <button 
                className="w-10 h-10 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-[#1B4D3E] hover:bg-emerald-50 hover:border-emerald-200 flex items-center justify-center transition-all shadow-sm"
                title="Saved Favorite Plots"
              >
                <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {savedCount}
                </span>
              )}
            </div>

            {/* Admin Console Shortcut */}
            <Link
              to="/admin/dashboard"
              className="w-10 h-10 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm"
              title="Admin Portal"
            >
              <Shield className="w-4 h-4" />
            </Link>

            {/* List Your Property CTA */}
            <button 
              type="button"
              onClick={onOpenListModal}
              className="px-4 sm:px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#143B30] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#1B4D3E]/25 transition-all duration-200 flex items-center gap-2 border border-emerald-700/50 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-300 stroke-[3]" />
              <span>List Your Property</span>
            </button>

            {/* Mobile Hamburger Menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">Navigation</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#1B4D3E] text-xs font-bold border border-slate-100 flex items-center gap-2 cursor-pointer text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1B4D3E]" />
                Buy Plots
              </Link>
              <Link
                to="/submit-land"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#1B4D3E] text-xs font-bold border border-slate-100 flex items-center gap-2 cursor-pointer text-left"
              >
                <Plus className="w-4 h-4 text-[#1B4D3E]" />
                Sell Land
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#1B4D3E] text-xs font-bold border border-slate-100 flex items-center gap-2 cursor-pointer text-left"
              >
                <MapPin className="w-4 h-4 text-[#1B4D3E]" />
                About Us
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#1B4D3E] text-xs font-bold border border-slate-100 flex items-center gap-2 cursor-pointer text-left"
              >
                <ShieldCheck className="w-4 h-4 text-[#1B4D3E]" />
                Contact Us
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Verified Properties in Chennai</span>
              <span className="font-bold text-[#1B4D3E]">OMR • ECR • Siruseri</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
