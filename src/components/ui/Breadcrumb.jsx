/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [to]
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {item.to ? (
            <Link to={item.to} className="font-medium text-neutral-700 hover:text-brand-700">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-neutral-900">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="h-4 w-4 text-neutral-400" />}
        </React.Fragment>
      ))}
    </nav>
  );
}
