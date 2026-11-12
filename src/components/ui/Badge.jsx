/**
 * @typedef {Object} BadgeProps
 * @property {React.ReactNode} [children]
 * @property {'default'|'success'|'warning'|'danger'|'info'} [variant]
 * @property {string} [className]
 */

import React from 'react';

const variants = {
  default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  success: 'bg-success-bg text-success-text border-success-border',
  warning: 'bg-warning-bg text-warning-text border-warning-border',
  danger: 'bg-danger-bg text-danger-text border-danger-border',
  info: 'bg-info-bg text-info-text border-info-border',
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
}
