import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action may be irreversible.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // danger | warning | info | success
  isLoading = false,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      icon: <AlertTriangle className="w-6 h-6" />,
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-200',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      icon: <AlertTriangle className="w-6 h-6" />,
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-200',
    },
    info: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      icon: <Info className="w-6 h-6" />,
      confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-indigo-200',
    },
    success: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: <CheckCircle className="w-6 h-6" />,
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-emerald-200',
    },
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150" role="presentation">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900 mb-1">{title}</h3>
              <p id="confirm-dialog-message" className="text-xs text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${style.confirmBtn}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

