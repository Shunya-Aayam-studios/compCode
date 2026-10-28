'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { TimeframeKey } from '@/types';
import { cn } from '@/lib/utils';
import { Flame, Clock, Calendar, History, Globe } from 'lucide-react';

interface TimeframeOption {
  key: TimeframeKey;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const TIMEFRAMES: TimeframeOption[] = [
  {
    key: 'thirtyDays',
    label: 'Last 30 Days',
    shortLabel: '30 Days',
    icon: <Flame className="h-3.5 w-3.5 text-amber-500" />,
  },
  {
    key: 'threeMonths',
    label: '3 Months',
    shortLabel: '3M',
    icon: <Clock className="h-3.5 w-3.5 text-blue-400" />,
  },
  {
    key: 'sixMonths',
    label: '6 Months',
    shortLabel: '6M',
    icon: <Calendar className="h-3.5 w-3.5 text-indigo-400" />,
  },
  {
    key: 'moreThanSixMonths',
    label: '> 6 Months',
    shortLabel: '> 6M',
    icon: <History className="h-3.5 w-3.5 text-purple-400" />,
  },
  {
    key: 'all',
    label: 'All Time',
    shortLabel: 'All',
    icon: <Globe className="h-3.5 w-3.5 text-emerald-400" />,
  },
];

export const TimeframeSwitcher: React.FC = () => {
  const { activeCompanyData, activeTimeframe, setActiveTimeframe } = useApp();

  if (!activeCompanyData) return null;

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-200/60 border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-300 w-full sm:w-auto overflow-x-auto custom-scrollbar">
      {TIMEFRAMES.map(({ key, label, shortLabel, icon }) => {
        const isActive = activeTimeframe === key;
        const count = activeCompanyData.timeframeCounts[key] || 0;
        const isDisabled = count === 0;

        return (
          <button
            key={key}
            onClick={() => !isDisabled && setActiveTimeframe(key)}
            disabled={isDisabled}
            className={cn(
              'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'bg-zinc-800 text-white dark:bg-zinc-800 dark:text-white light:bg-white light:text-zinc-900 shadow-sm border border-zinc-700/60 light:border-zinc-300 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900 hover:bg-zinc-900/40',
              isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent'
            )}
          >
            <span className="flex items-center gap-1.5">
              {icon}
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </span>
            <span
              className={cn(
                'font-mono text-[10px] px-1.5 py-0.2 rounded-full',
                isActive
                  ? 'bg-zinc-700 text-zinc-200 light:bg-zinc-100 light:text-zinc-800'
                  : 'bg-zinc-900 text-zinc-500 light:bg-zinc-300 light:text-zinc-600'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
