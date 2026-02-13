import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SortConfig, SortField, SortOrder, PaginationConfig } from '../../lib/types';

interface Props {
  sort: SortConfig;
  onSortChange: (field: SortField, order: SortOrder) => void;
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  className?: string;
}

export function MovieListControls({
  sort,
  onSortChange,
  pagination,
  onPageChange,
  className
}: Props) {
  const totalPages = Math.ceil(pagination.total / pagination.perPage);
  const showPagination = pagination.total > pagination.perPage;

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = event.target.value.split('-') as [SortField, SortOrder];
    onSortChange(field, order);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4 py-4", className)}>
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-500" />
        <select
          value={`${sort.field}-${sort.order}`}
          onChange={handleSortChange}
          className={cn(
            "pl-2 pr-8 py-1 text-sm rounded-md border border-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          )}
        >
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="added-desc">Recently Added</option>
          <option value="added-asc">Oldest Added</option>
          <option value="year-desc">Newest Movies</option>
          <option value="year-asc">Oldest Movies</option>
        </select>
      </div>

      {showPagination && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={cn(
              "p-1 rounded-md text-gray-500",
              "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === totalPages}
            className={cn(
              "p-1 rounded-md text-gray-500",
              "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}