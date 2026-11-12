/**
 * @typedef {Object} DrawerProps
 * @property {boolean} open
 * @property {() => void} onClose
 * @property {React.ReactNode} children
 * @property {string} [title]
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ open, onClose, children, title }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    ref.current?.focus();
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
    <div className="fixed inset-0 z-40 flex justify-end bg-neutral-900/40 backdrop-blur-sm" role="presentation">
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Drawer'}
        tabIndex={-1}
        className="h-full w-full max-w-md overflow-y-auto border-l border-neutral-200 bg-white p-5 shadow-overlay outline-none"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-lg font-bold text-neutral-900">{title}</h3>}
          <button type="button" onClick={onClose} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Close drawer">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
