import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading data...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-indigo-600 animate-spin mb-3`} />
      {text && <p className="text-xs font-semibold text-slate-500">{text}</p>}
    </div>
  );
}

