/**
 * @typedef {Object} EmptyStateProps
 * @property {string} [title]
 * @property {string} [description]
 * @property {React.ReactNode} [action]
 * @property {React.ReactNode} [icon]
 */

import React from 'react';

export default function EmptyState({ title = 'No results found', description = 'There is no data available yet.', action, icon }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        {icon || <div className="h-6 w-6 rounded-md bg-brand-200" />}
      </div>
      <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
