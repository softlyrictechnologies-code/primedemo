/**
 * @typedef {Object} ErrorStateProps
 * @property {string} [title]
 * @property {string} [message]
 * @property {() => void} [onRetry]
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', message = 'Please try again.', onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-red-900">{title}</h3>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button variant="secondary" onClick={onRetry}>Retry</Button>
        </div>
      )}
    </div>
  );
}
