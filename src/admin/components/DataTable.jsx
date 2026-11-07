import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, SlidersHorizontal } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  searchPlaceholder = 'Search records...',
  searchKeys = [], // array of object keys to search within
  filterComponent = null,
  emptyMessage = 'No matching records found',
  defaultSortKey = null,
  defaultSortDirection = 'asc',
  rowKey = 'id',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Filter data based on search input
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      }
      // If no search keys specified, search across all top-level string/number values
      return Object.values(item).some((val) => {
        return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, searchKeys]);

  // 2. Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Handle nested or undefined
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Paginate
  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  const handleSort = (key, sortable = true) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Top Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter slot and Page Size */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {filterComponent}

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-medium hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[300px] flex-1">
        {isLoading ? (
          <LoadingSpinner text="Loading records from Firestore..." size="lg" className="py-20" />
        ) : paginatedData.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
              <Inbox className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-700 mb-1">{emptyMessage}</p>
            <p className="text-xs text-slate-400 max-w-xs">
              {searchQuery ? 'Try clearing your search query or adjusting your filters.' : 'There are currently no items in this collection.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    onClick={() => col.sortable !== false && handleSort(col.key, col.sortable !== false)}
                    className={`px-4 sm:px-6 py-3.5 select-none ${
                      col.sortable !== false ? 'cursor-pointer hover:text-slate-900 transition-colors' : ''
                    } ${col.headerClassName || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-slate-400">
                          {sortKey === col.key ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                            )
                          ) : (
                            <SlidersHorizontal className="w-2.5 h-2.5 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedData.map((row, rowIdx) => {
                const uniqueKey = row[rowKey] || row.id || row.docId || rowIdx;
                return (
                  <tr
                    key={uniqueKey}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key || colIdx}
                        className={`px-4 sm:px-6 py-4 align-middle ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalRecords > 0 && (
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{(safeCurrentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(safeCurrentPage * pageSize, totalRecords)}</span> of{' '}
            <span className="font-bold text-slate-800">{totalRecords}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-700">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

