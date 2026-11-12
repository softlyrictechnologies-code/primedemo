import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowRight, Building2, TrendingUp } from 'lucide-react';
import { db } from '../firebase.js';

export default function ChennaiAreaGuide({ onSelectArea }) {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let active = true;
    getDocs(query(collection(db, 'locations'), where('active', '==', true)))
      .then((snapshot) => {
        if (active) setLocations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      })
      .catch((error) => console.error('Could not load active location guides:', error));
    return () => { active = false; };
  }, []);

  if (!locations.length) return null;

  return (
    <section className="my-12 rounded-[3rem] border border-white/80 bg-white/60 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-md sm:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1B4D3E]">Location Guides</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#111827] sm:text-4xl">Explore Chennai locations</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Area details and pricing maintained by the Prime Housing team.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {locations.map((item) => {
            const highlights = Array.isArray(item.highlights) ? item.highlights : String(item.highlights || '').split(',').map((value) => value.trim()).filter(Boolean);
            return (
              <button key={item.id} type="button" onClick={() => onSelectArea?.(item.name || item.id)} className="flex flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4D3E] text-emerald-300"><Building2 className="h-6 w-6" /></span>
                    {item.appreciationRate && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1B4D3E]">{item.appreciationRate}</span>}
                  </div>
                  <div><h3 className="text-xl font-black text-[#111827]">{item.name}</h3><p className="mt-1 text-xs font-medium text-slate-500">{item.description}</p></div>
                  {item.avgPriceSqft != null && <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3"><span className="text-[11px] font-bold uppercase text-slate-400">Avg Sq.Ft Rate</span><span className="text-sm font-extrabold text-[#1B4D3E]">₹{Number(item.avgPriceSqft).toLocaleString('en-IN')}</span></div>}
                  {highlights.length > 0 && <ul className="space-y-1.5 text-xs text-slate-600">{highlights.map((highlight, index) => <li key={`${item.id}-${index}`} className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-600" /><span>{highlight}</span></li>)}</ul>}
                </div>
                <span className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-[#1B4D3E]">View listings in {item.name}<ArrowRight className="h-4 w-4" /></span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
