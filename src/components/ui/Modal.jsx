/**
 * @typedef {Object} ModalProps
 * @property {boolean} open
 * @property {() => void} onClose
 * @property {React.ReactNode} children
 * @property {string} [title]
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Modal({ open, onClose, children, title, className = '' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.activeElement;
    const node = dialogRef.current;
    const focusable = node?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable?.[0];
    first?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        className={cn('w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-overlay', className)}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h3 className="text-lg font-bold text-neutral-900">{title}</h3>}
          <button type="button" onClick={onClose} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Close dialog">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
