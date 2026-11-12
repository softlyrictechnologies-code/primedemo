/**
 * @typedef {Object} SelectProps
 * @property {string} [label]
 * @property {string} [error]
 * @property {string} [hint]
 * @property {string} [className]
 * @property {string} [id]
 * @property {Array<{ value: string, label: string }>} [options]
 */

import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Select({ label, error, hint, className = '', id, options = [], ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-neutral-800">
          {label}
        </label>
      )}
      {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-900 shadow-sm transition-all duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error && 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-100',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} aria-live="polite" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
