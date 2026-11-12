/**
 * @typedef {Object} InputProps
 * @property {string} [label]
 * @property {string} [error]
 * @property {string} [hint]
 * @property {string} [className]
 * @property {string} [id]
 */

import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Input({ label, error, hint, className = '', id, ...props }) {
  const input = (
    <input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-all duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100',
        error && 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-100',
        className
      )}
      {...props}
    />
  );

  if (!label && !hint && !error) return input;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-neutral-800">
          {label}
        </label>
      )}
      {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
      {input}
      {error && (
        <p id={error ? `${id}-error` : undefined} aria-live="polite" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
