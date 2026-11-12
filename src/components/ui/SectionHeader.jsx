/**
 * @typedef {Object} SectionHeaderProps
 * @property {string} [eyebrow]
 * @property {string} [title]
 * @property {string} [description]
 * @property {React.ReactNode} [action]
 */

import React from 'react';

export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p>}
        {title && <h2 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">{title}</h2>}
        {description && <p className="mt-2 max-w-2xl text-sm text-neutral-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
