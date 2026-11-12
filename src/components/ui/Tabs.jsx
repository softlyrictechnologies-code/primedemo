/**
 * @typedef {Object} TabItem
 * @property {string} label
 * @property {string} [value]
 * @property {number} [count]
 */

import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Tabs({ items = [], value, onChange, className = '' }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((tab) => {
        const active = value === tab.value || value === tab.label;

        return (
          <button
            key={tab.value || tab.label}
            type="button"
            onClick={() => onChange?.(tab.value || tab.label)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
              active ? 'bg-brand-700 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', active ? 'bg-white/20 text-white' : 'bg-white text-neutral-700')}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
