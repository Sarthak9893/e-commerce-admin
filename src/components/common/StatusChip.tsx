'use client';

import React from 'react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  // Order / General statuses
  DELIVERED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  COMPLETED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  ACTIVE: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  APPROVED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  SUCCESS: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PAID: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },

  SHIPPED: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  PROCESSING: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  CONFIRMED: { bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500' },

  PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  DRAFT: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },

  CANCELLED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  FAILED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  REJECTED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  REFUNDED: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  OUT_OF_STOCK: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  ARCHIVED: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600', dot: 'bg-slate-400' },
};

export function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  const normalized = (status || '').toUpperCase();
  const theme = statusColorMap[normalized] || {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${theme.bg} ${theme.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
      {normalized.replace(/_/g, ' ')}
    </span>
  );
}
