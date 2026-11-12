/**
 * @typedef {Object} StatCardProps
 * @property {string} [label]
 * @property {string|number} [value]
 * @property {string} [helper]
 * @property {React.ReactNode} [icon]
 */

import React from 'react';
import Card from './Card';

export default function StatCard({ label, value, helper, icon }) {
  return (
    <Card hoverable className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
          <p className="mt-3 text-3xl font-black text-neutral-900">{value}</p>
        </div>
        {icon && <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{icon}</div>}
      </div>
      {helper && <p className="mt-3 text-xs text-neutral-600">{helper}</p>}
    </Card>
  );
}
