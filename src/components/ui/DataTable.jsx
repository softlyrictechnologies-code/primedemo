/**
 * @typedef {Object} DataTableProps
 * @property {Array<Object>} rows
 * @property {Array<{ key: string, label: string, render?: (row:any) => React.ReactNode }>} columns
 * @property {number} [page]
 * @property {number} [totalPages]
 * @property {(page: number) => void} [onPageChange]
 * @property {string} [searchTerm]
 * @property {(value: string) => void} [onSearch]
 */

import React from 'react';
import { Search } from 'lucide-react';
import Pagination from './Pagination';

export default function DataTable({ rows = [], columns = [], page = 1, totalPages = 1, onPageChange, searchTerm = '', onSearch }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
      {onSearch && (
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
            className="w-full border-0 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            placeholder="Search"
            aria-label="Search table"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-700">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-neutral-500">
                  No data available.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id || index} className="border-t border-neutral-200">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-top text-neutral-700">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="border-t border-neutral-200 px-4 py-3">
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
