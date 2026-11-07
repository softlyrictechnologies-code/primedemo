import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  if (status === undefined || status === null) {
    return <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">N/A</span>;
  }

  const normalized = String(status).toLowerCase().trim();

  const styles = {
    // Property statuses
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    archived: 'bg-slate-200 text-slate-800 border-slate-300',
    featured: 'bg-amber-50 text-amber-700 border-amber-200/80',

    // Inquiry statuses
    new: 'bg-blue-50 text-blue-700 border-blue-200/80 animate-pulse',
    contacted: 'bg-purple-50 text-purple-700 border-purple-200/80',
    scheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200/80',

    // Seller submission statuses
    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200/80',
    needs_revision: 'bg-orange-50 text-orange-700 border-orange-200/80',

    // User roles
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-black',
    buyer: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    seller: 'bg-sky-50 text-sky-700 border-sky-200/80',

    // Message status
    read: 'bg-slate-100 text-slate-600 border-slate-200',
    replied: 'bg-teal-50 text-teal-700 border-teal-200/80',

    // Booleans
    true: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    false: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const currentStyle = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  const label = typeof status === 'boolean' 
    ? (status ? 'Published' : 'Draft') 
    : normalized.replace(/_/g, ' ').toUpperCase();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wider uppercase ${currentStyle} ${className}`}>
      {label}
    </span>
  );
}

