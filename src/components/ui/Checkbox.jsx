/**
 * @typedef {Object} CheckboxProps
 * @property {string} [label]
 * @property {boolean} [checked]
 * @property {boolean} [disabled]
 * @property {string} [className]
 * @property {string} [id]
 * @property {React.InputHTMLAttributes<HTMLInputElement>['onChange']} [onChange]
 */

import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Checkbox({ label, checked, disabled, className = '', id, onChange, ...props }) {
  return (
    <label htmlFor={id} className={cn('flex items-center gap-2 text-sm text-neutral-700', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-200"
        {...props}
      />
      {label && <span className="font-medium">{label}</span>}
    </label>
  );
}
