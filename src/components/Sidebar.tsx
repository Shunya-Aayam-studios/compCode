'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CompanyManifestItem } from '@/types';
import {
  Search,
  Pin,
  PinOff,
  Building2,
  ChevronRight,
  Target,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const {
    manifest,
    activeCompanySlug,
    selectCompany,
    userStore,
    togglePinCompany,
    isCompanyPinned,
    getCompanyStats,
  } = useApp();

  const [companySearch, setCompanySearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'top'>('all');

  const allCompanies = manifest?.companies || [];

  // Pinned companies list
  const pinnedCompanies = useMemo(() => {
    return userStore.pinnedCompanies
      .map(slug => allCompanies.find(c => c.slug === slug))
      .filter((c): c is CompanyManifestItem => Boolean(c));
  }, [userStore.pinnedCompanies, allCompanies]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    let list = allCompanies;
    if (filterMode === 'top') {
      list = list.slice(0, 30);
    }
    if (!companySearch.trim()) return list;
    const query = companySearch.toLowerCase().trim();
    return list.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query)
    );
  }, [allCompanies, companySearch, filterMode]);

  return (
    <aside className="w-72 lg:w-80 flex-shrink-0 flex flex-col h-[calc(100vh-3.5rem)] border-r border-zinc-800/80 bg-[#0c0c0e]/95 dark:bg-[#0c0c0e]/95 light:bg-zinc-50 light:border-zinc-200 select-none">
      {/* Target Companies (Pinned) */}
      <div className="p-3 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 uppercase tracking-wider">
            <Target className="h-3.5 w-3.5 text-violet-400" />
            <span>Target Companies</span>
            <span className="text-[10px] font-mono text-zinc-500">
              ({pinnedCompanies.length}/6)
            </span>
          </div>
        </div>

        {pinnedCompanies.length === 0 ? (
          <div className="px-2 py-3 rounded-lg border border-dashed border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-center text-xs text-zinc-500">
            Pin up to 6 target companies using the pin icon
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {pinnedCompanies.map(comp => {
              const isActive = comp.slug === activeCompanySlug;
              const stats = getCompanyStats(comp);
              const radius = 10;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset =
                circumference - (stats.percent / 100) * circumference;

              return (
                <div
                  key={comp.slug}
                  onClick={() => selectCompany(comp.slug)}
                  className={cn(
                    'group relative flex items-center justify-between p-2 rounded-lg border text-left cursor-pointer transition-all',
                    isActive
                      ? 'bg-violet-500/10 border-violet-500/40 text-white shadow-sm shadow-violet-500/10'
                      : 'bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border-zinc-800 dark:border-zinc-800 light:border-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    {/* Radial Progress Ring */}
                    <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-6 h-6 transform -rotate-90">
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="transparent"
                          className="text-zinc-800 dark:text-zinc-800 light:text-zinc-200"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="text-violet-400 transition-all duration-500"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-mono font-bold text-zinc-400">
                        {stats.percent}%
                      </span>
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-medium truncate text-zinc-200 dark:text-zinc-200 light:text-zinc-800">
                        {comp.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {comp.totalUniqueQuestions} Qs
                      </div>
                    </div>
                  </div>

                  {/* Unpin button on hover */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      togglePinCompany(comp.slug);
                    }}
                    title="Unpin target"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-all"
                  >
                    <PinOff className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search & Filter Header */}
      <div className="p-3 pb-2 space-y-2 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={companySearch}
            onChange={e => setCompanySearch(e.target.value)}
            placeholder="Filter 470 companies..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white text-zinc-200 dark:text-zinc-200 light:text-zinc-800 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          {companySearch && (
            <button
              onClick={() => setCompanySearch('')}
              className="absolute right-2.5 top-2 text-[10px] text-zinc-400 hover:text-zinc-200"
            >
              clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] px-1 text-zinc-400">
          <span>{filteredCompanies.length} companies</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                filterMode === 'all'
                  ? 'bg-zinc-800 text-zinc-200 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('top')}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                filterMode === 'top'
                  ? 'bg-zinc-800 text-zinc-200 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Top 30
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Company List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
        {filteredCompanies.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No companies matching &quot;{companySearch}&quot;
          </div>
        ) : (
          filteredCompanies.map(comp => {
            const isActive = comp.slug === activeCompanySlug;
            const isPinned = isCompanyPinned(comp.slug);

            return (
              <div
                key={comp.slug}
                onClick={() => selectCompany(comp.slug)}
                className={cn(
                  'group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors',
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 font-medium border border-violet-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 dark:hover:bg-zinc-900/60 light:hover:bg-zinc-100 border border-transparent'
                )}
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <div
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold uppercase font-mono',
                      isActive
                        ? 'bg-violet-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200'
                    )}
                  >
                    {comp.name.charAt(0)}
                  </div>
                  <span className="truncate">{comp.name}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-zinc-200 px-1.5 py-0.5 rounded">
                    {comp.totalUniqueQuestions}
                  </span>

                  {/* Pin button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      togglePinCompany(comp.slug);
                    }}
                    title={isPinned ? 'Unpin' : 'Pin to Targets'}
                    className={cn(
                      'p-1 rounded transition-colors',
                      isPinned
                        ? 'text-violet-400 opacity-100'
                        : 'opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    <Pin className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
