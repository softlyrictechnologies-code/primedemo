/**
 * @typedef {Object} PaginationProps
 * @property {number} page
 * @property {number} totalPages
 * @property {(page: number) => void} onPageChange
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={cn(
            'h-10 w-10 rounded-lg text-sm font-semibold transition-colors',
            pageNumber === page ? 'bg-brand-700 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          )}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-50"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
