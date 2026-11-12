/**
 * @typedef {Object} StatusBadgeProps
 * @property {string} [status]
 * @property {string} [className]
 */

import React from 'react';

const map = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  sold_out: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  new: 'bg-sky-50 text-sky-700 border-sky-200',
  contacted: 'bg-violet-50 text-violet-700 border-violet-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-neutral-200 text-neutral-700 border-neutral-300',
};

const labelMap = {
  published: 'Published',
  draft: 'Draft',
  sold_out: 'Sold Out',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  new: 'New',
  contacted: 'Contacted',
  converted: 'Converted',
  closed: 'Closed',
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function StatusBadge({ status = 'draft', className = '' }) {
  const value = map[status] || map.draft;
  const label = labelMap[status] || status;

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', value, className)}>
      {label}
    </span>
  );
}
