import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export function useAdminNotice() {
  const [notice, setNotice] = useState(null);
  const showNotice = useCallback((type, message) => {
    setNotice({ type, message, id: Date.now() });
  }, []);
  const clearNotice = useCallback(() => setNotice(null), []);
  return { notice, showNotice, clearNotice };
}

export default function AdminNotice({ notice, onClose }) {
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [notice, onClose]);

  if (!notice) return null;
  const isError = notice.type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div className="fixed right-4 top-20 z-[70] w-[min(420px,calc(100vw-2rem))]" role={isError ? 'alert' : 'status'} aria-live={isError ? 'assertive' : 'polite'}>
      <div className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${isError ? 'border-rose-200' : 'border-emerald-200'}`}>
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isError ? 'text-rose-600' : 'text-emerald-600'}`} />
        <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-slate-700">{notice.message}</p>
        <button type="button" onClick={onClose} aria-label="Dismiss notification" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
