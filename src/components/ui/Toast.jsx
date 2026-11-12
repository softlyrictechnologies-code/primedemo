/**
 * @typedef {Object} ToastProps
 * @property {string} [title]
 * @property {string} [message]
 * @property {'success'|'error'} [variant]
 * @property {boolean} [open]
 * @property {() => void} [onClose]
 */

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const variants = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export default function Toast({ title, message, variant = 'success', open = false, onClose }) {
  if (!open) return null;

  const Icon = variant === 'success' ? CheckCircle2 : XCircle;

  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-60 w-full max-w-sm rounded-xl border p-4 shadow-overlay backdrop-blur-sm">
      <div className={variants[variant]}>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5" />
          <div className="flex-1">
            {title && <p className="text-sm font-bold">{title}</p>}
            {message && <p className="mt-1 text-sm">{message}</p>}
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-full p-1 text-current hover:bg-black/5" aria-label="Close notification">
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
