import React, { useState } from 'react';
import { PencilLine, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

export default function WebsiteContent() {
  const [content, setContent] = useState({
    heroTitle: 'Discover verified plots in Chennai',
    intro: 'Prime Housing connects landowners and buyers through a transparent, responsive property marketplace.',
    phone: '+91 044 4890 2026',
    email: 'support@primehousing.in',
    location: 'Chennai, Tamil Nadu',
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">Website content</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Homepage and company content</h2>
          </div>
          <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-indigo-700 border border-indigo-200">
            <PencilLine className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Content editor</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Hero headline</label>
              <input value={content.heroTitle} onChange={(event) => setContent((current) => ({ ...current, heroTitle: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Company introduction</label>
              <textarea value={content.intro} onChange={(event) => setContent((current) => ({ ...current, intro: event.target.value }))} rows="5" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Live contact information</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Phone className="h-4 w-4 text-indigo-600" />
              <input value={content.phone} onChange={(event) => setContent((current) => ({ ...current, phone: event.target.value }))} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Mail className="h-4 w-4 text-indigo-600" />
              <input value={content.email} onChange={(event) => setContent((current) => ({ ...current, email: event.target.value }))} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <input value={content.location} onChange={(event) => setContent((current) => ({ ...current, location: event.target.value }))} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-4xl border border-slate-200 bg-linear-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100">Featured section</p>
            <h3 className="mt-2 text-2xl font-black">Homepage content snapshot</h3>
          </div>
          <Sparkles className="h-8 w-8 text-indigo-100" />
        </div>
        <p className="mt-4 max-w-2xl text-sm text-indigo-50">{content.heroTitle}</p>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">{content.intro}</p>
      </div>
    </div>
  );
}
