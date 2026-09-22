'use client';

import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = total && limit ? (page - 1) * limit + 1 : undefined;
  const endItem = total && limit ? Math.min(page * limit, total) : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200">
      <div className="text-xs text-slate-500">
        {total !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Showing <strong className="text-slate-700">{startItem}</strong> to{' '}
            <strong className="text-slate-700">{endItem}</strong> of{' '}
            <strong className="text-slate-700">{total}</strong> results
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-700">{page}</strong> of{' '}
            <strong className="text-slate-700">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
