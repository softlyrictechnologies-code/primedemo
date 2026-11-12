/**
 * @typedef {Object} ButtonProps
 * @property {string} [children]
 * @property {'primary'|'secondary'|'ghost'|'danger'} [variant]
 * @property {'sm'|'md'|'lg'} [size]
 * @property {boolean} [loading]
 * @property {boolean} [disabled]
 * @property {string} [className]
 * @property {React.ButtonHTMLAttributes<HTMLButtonElement>['type']} [type]
 * @property {React.ButtonHTMLAttributes<HTMLButtonElement>['onClick']} [onClick]
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-card',
  secondary: 'bg-white text-brand-800 border border-brand-200 hover:bg-brand-50',
  ghost: 'bg-transparent text-brand-800 hover:bg-brand-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 min-h-11',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
