/**
 * @typedef {Object} FieldProps
 * @property {string} [label]
 * @property {string} [hint]
 * @property {string} [error]
 * @property {string} [htmlFor]
 * @property {React.ReactNode} [children]
 */

import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Field({ label, hint, error, htmlFor, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={cn('block w-full text-sm text-neutral-700', className)}>
      {label && (
        <span className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-neutral-800">
          <span>{label}</span>
          {hint && <span className="text-[11px] text-neutral-500">{hint}</span>}
        </span>
      )}
      {children}
      {error && (
        <span id={htmlFor ? `${htmlFor}-error` : undefined} aria-live="polite" className="mt-1 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
