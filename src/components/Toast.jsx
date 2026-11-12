import React, { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-6 duration-300">
      <div className="px-5 py-3 rounded-full bg-slate-900/90 text-white backdrop-blur-2xl border border-white/20 shadow-2xl shadow-emerald-950/30 flex items-center gap-3 text-xs font-bold">
        <div className="w-6 h-6 rounded-full bg-[#1B4D3E] flex items-center justify-center text-emerald-300 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span>{message}</span>
        <button 
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
