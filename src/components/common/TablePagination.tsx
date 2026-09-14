import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalEntries: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export function getPaginationPages(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalEntries,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
  itemLabel = 'entries',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startEntry = totalEntries === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry = Math.min(safePage * pageSize, totalEntries);

  const pages = getPaginationPages(safePage, totalPages);

  return (
    <div
      className={`px-4 sm:px-6 py-3.5 sm:py-4 border-t border-gray-100 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${className}`}
    >
      {/* Left: Showing entries & Page Size dropdown */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-500 dark:text-gray-400 font-normal">
        <span>
          Showing{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {startEntry}
          </span>{' '}
          to{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {endEntry}
          </span>{' '}
          of{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {totalEntries}
          </span>{' '}
          {itemLabel}
        </span>

        <span className="hidden sm:inline-block h-3.5 w-px bg-gray-200 dark:bg-white/10" />

        <div className="flex items-center gap-1.5">
          <span>Show:</span>
          <div className="relative inline-flex items-center">
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="appearance-none bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/15 rounded-full pl-3 pr-7 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-white/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className="bg-white dark:bg-[#161d27] text-gray-900 dark:text-white"
                >
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right: Pagination Navigation Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First Page button (<<) */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safePage <= 1}
          aria-label="First page"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/15 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page button (<) */}
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/15 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numbered Page Buttons */}
        {pages.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-6 h-8 flex items-center justify-center text-xs text-gray-400 select-none"
              >
                ...
              </span>
            );
          }
          const isActive = p === safePage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#00478f] dark:bg-primary text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page button (>) */}
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/15 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page button (>>) */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safePage >= totalPages}
          aria-label="Last page"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/15 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default TablePagination;
