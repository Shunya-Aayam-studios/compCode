'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { PresetFilter, Difficulty } from '@/types';
import { cn } from '@/lib/utils';
import {
  Zap,
  EyeOff,
  Eye,
  RotateCcw,
  Star,
  Search,
  Filter,
  X,
  ListFilter,
} from 'lucide-react';

export const SmartPresetsBar: React.FC = () => {
  const {
    presetFilter,
    setPresetFilter,
    blindMode,
    toggleBlindMode,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedTopic,
    setSelectedTopic,
    searchQuery,
    setSearchQuery,
    resetFilters,
  } = useApp();

  const difficulties: Array<'ALL' | Difficulty> = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

  const hasActiveFilters =
    presetFilter !== 'all' ||
    selectedDifficulty !== 'ALL' ||
    Boolean(selectedTopic) ||
    Boolean(searchQuery);

  return (
    <div className="space-y-3">
      {/* Top Row: Presets & Blind Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-zinc-600 flex items-center gap-1 mr-1">
            <ListFilter className="h-3.5 w-3.5 text-violet-400" />
            <span>Smart Presets:</span>
          </span>

          {/* All */}
          <button
            onClick={() => setPresetFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
              presetFilter === 'all'
                ? 'bg-zinc-800 text-white border-zinc-700 light:bg-zinc-900 light:text-white'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/60 light:bg-zinc-100 light:text-zinc-600 light:border-zinc-300'
            )}
          >
            All Questions
          </button>

          {/* High-Yield Sprint */}
          <button
            onClick={() =>
              setPresetFilter(presetFilter === 'high-yield' ? 'all' : 'high-yield')
            }
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
              presetFilter === 'high-yield'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10 font-semibold'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-amber-400 hover:border-amber-500/30 light:bg-zinc-100 light:text-zinc-600 light:border-zinc-300'
            )}
            title="Top 25 highest-frequency unsolved questions from recent windows"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>High-Yield Sprint</span>
            <span className="text-[10px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
              Top 25
            </span>
          </button>

          {/* Needs Revision */}
          <button
            onClick={() =>
              setPresetFilter(presetFilter === 'needs-revision' ? 'all' : 'needs-revision')
            }
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
              presetFilter === 'needs-revision'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/10 font-semibold'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-purple-400 hover:border-purple-500/30 light:bg-zinc-100 light:text-zinc-600 light:border-zinc-300'
            )}
            title="Questions flagged for revision or solved over 7 days ago"
          >
            <RotateCcw className="h-3.5 w-3.5 text-purple-400" />
            <span>Needs Revision</span>
          </button>

          {/* Bookmarked */}
          <button
            onClick={() =>
              setPresetFilter(presetFilter === 'bookmarked' ? 'all' : 'bookmarked')
            }
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
              presetFilter === 'bookmarked'
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-sm shadow-yellow-500/10 font-semibold'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-yellow-400 hover:border-yellow-500/30 light:bg-zinc-100 light:text-zinc-600 light:border-zinc-300'
            )}
            title="Filter by bookmarked questions"
          >
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            <span>Bookmarked</span>
          </button>
        </div>

        {/* Right side: Blind Practice Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBlindMode}
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
              blindMode
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                : 'bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-400 hover:text-zinc-200'
            )}
            title="Hide topic tags until hovered to avoid spoiling algorithm patterns"
          >
            {blindMode ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-indigo-400" />
                <span>Blind Mode: ON</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-zinc-500" />
                <span>Blind Mode: OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Row: Difficulty Switcher, Search Input, Active Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty Segmented */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-200 border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-300 text-xs">
            {difficulties.map(d => {
              const isSelected = selectedDifficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium',
                    isSelected
                      ? 'bg-zinc-800 text-white dark:bg-zinc-800 dark:text-white light:bg-white light:text-zinc-900 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900'
                  )}
                >
                  {d === 'ALL' ? 'All Diff' : d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Active Topic Tag if set */}
          {selectedTopic && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs">
              <span>Topic: {selectedTopic}</span>
              <button
                onClick={() => setSelectedTopic(null)}
                className="hover:text-white p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Clear all filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 cursor-pointer ml-1"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Search Problem Table */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search problems in table..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white text-zinc-200 dark:text-zinc-200 light:text-zinc-800 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[10px] text-zinc-400 hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
