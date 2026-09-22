'use client';

import React from 'react';
import { HiArrowUpRight, HiArrowDownRight } from 'react-icons/hi2';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  icon: React.ElementType;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const colorStyles = {
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600',
    border: 'border-rose-100',
  },
  sky: {
    iconBg: 'bg-sky-50 text-sky-600',
    border: 'border-sky-100',
  },
};

export function StatsCard({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon: Icon,
  color = 'indigo',
}: StatsCardProps) {
  const styles = colorStyles[color];
  const isPositive = typeof change === 'number' && change >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>

      {typeof change === 'number' && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
              isPositive
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-rose-700 bg-rose-50'
            }`}
          >
            {isPositive ? (
              <HiArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <HiArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-slate-400">{changePeriod}</span>
        </div>
      )}
    </div>
  );
}
