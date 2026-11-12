/**
 * @typedef {Object} CardProps
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {boolean} [hoverable]
 */

import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Card({ children, className = '', hoverable = false }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-4 shadow-card',
        hoverable && 'card-hover',
        className
      )}
    >
      {children}
    </div>
  );
}
