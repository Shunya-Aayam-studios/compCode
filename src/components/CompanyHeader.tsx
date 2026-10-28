'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  Dna,
  Pin,
  PinOff,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  FilterX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const CompanyHeader: React.FC = () => {
  const {
    activeCompanyData,
    isLoadingCompany,
    userStore,
    isCompanyPinned,
    togglePinCompany,
    selectedTopic,
    setSelectedTopic,
  } = useApp();

  // Compute solved counts for this company
  const stats = useMemo(() => {
    if (!activeCompanyData) {
      return {
        total: 0,
        solved: 0,
        easyTotal: 0,
        easySolved: 0,
        medTotal: 0,
        medSolved: 0,
        hardTotal: 0,
        hardSolved: 0,
        percent: 0,
      };
    }

    const allProblems = activeCompanyData.problems.all || [];
    let easySolved = 0;
    let medSolved = 0;
    let hardSolved = 0;
    let totalSolved = 0;

    for (const p of allProblems) {
      const u = userStore.problems[p.id];
      if (u?.status === 'solved') {
        totalSolved++;
        if (p.difficulty === 'EASY') easySolved++;
        else if (p.difficulty === 'MEDIUM') medSolved++;
        else if (p.difficulty === 'HARD') hardSolved++;
      }
    }

    const total = activeCompanyData.totalUniqueQuestions || 1;
    const percent = Math.min(100, Math.round((totalSolved / total) * 100));

    return {
      total,
      solved: totalSolved,
      easyTotal: activeCompanyData.easy,
      easySolved,
      medTotal: activeCompanyData.medium,
      medSolved,
      hardTotal: activeCompanyData.hard,
      hardSolved,
      percent,
    };
  }, [activeCompanyData, userStore.problems]);

  if (isLoadingCompany || !activeCompanyData) {
    return (
      <div className="p-6 border-b border-zinc-800 bg-[#121215]/50 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mb-4" />
        <div className="h-16 w-full bg-zinc-800/60 rounded" />
      </div>
    );
  }

  const isPinned = isCompanyPinned(activeCompanyData.slug);

  // SVG Progress Ring
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (stats.percent / 100) * circumference;

  return (
    <div className="p-5 lg:p-6 border-b border-zinc-800/80 bg-[#101013] dark:bg-[#101013] light:bg-white light:border-zinc-200 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Company Identity & Main Progress Ring */}
        <div className="flex items-center gap-4">
          {/* Radial Completion Ring */}
          <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-zinc-800/80 dark:text-zinc-800/80 light:text-zinc-200"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-violet-500 transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-sm font-bold font-mono text-zinc-100 dark:text-zinc-100 light:text-zinc-900 leading-none">
                {stats.percent}%
              </span>
              <span className="text-[9px] text-zinc-500 uppercase font-medium mt-0.5">
                Done
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white dark:text-white light:text-zinc-900 flex items-center gap-2">
                {activeCompanyData.name}
              </h1>
              <button
                onClick={() => togglePinCompany(activeCompanyData.slug)}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                  isPinned
                    ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                )}
                title={isPinned ? 'Remove from Target Companies' : 'Pin to Target Companies'}
              >
                {isPinned ? (
                  <>
                    <PinOff className="h-3 w-3" />
                    <span>Pinned</span>
                  </>
                ) : (
                  <>
                    <Pin className="h-3 w-3" />
                    <span>Pin Target</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400 font-mono">
              <span>
                <strong className="text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-semibold">
                  {stats.solved}
                </strong>{' '}
                of {stats.total} Solved
              </span>
              <span className="text-zinc-700 dark:text-zinc-700 light:text-zinc-300">•</span>
              <span className="text-zinc-400">
                {activeCompanyData.availableTimeframes.length} Windows Recorded
              </span>
            </div>
          </div>
        </div>

        {/* Right: Segmented Difficulty Breakdown */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Easy */}
          <div className="flex-1 sm:w-28 p-2.5 rounded-lg border border-zinc-800/90 dark:border-zinc-800/90 light:border-zinc-200 bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-zinc-50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-emerald-400">Easy</span>
              <span className="font-mono text-zinc-400 text-[11px]">
                {stats.easySolved}/{stats.easyTotal}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${
                    stats.easyTotal > 0
                      ? (stats.easySolved / stats.easyTotal) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="flex-1 sm:w-28 p-2.5 rounded-lg border border-zinc-800/90 dark:border-zinc-800/90 light:border-zinc-200 bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-zinc-50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-amber-400">Medium</span>
              <span className="font-mono text-zinc-400 text-[11px]">
                {stats.medSolved}/{stats.medTotal}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${
                    stats.medTotal > 0
                      ? (stats.medSolved / stats.medTotal) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="flex-1 sm:w-28 p-2.5 rounded-lg border border-zinc-800/90 dark:border-zinc-800/90 light:border-zinc-200 bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-zinc-50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-rose-400">Hard</span>
              <span className="font-mono text-zinc-400 text-[11px]">
                {stats.hardSolved}/{stats.hardTotal}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{
                  width: `${
                    stats.hardTotal > 0
                      ? (stats.hardSolved / stats.hardTotal) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Topic DNA Bar */}
      <div className="mt-5 pt-4 border-t border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 tracking-wide">
            <Dna className="h-3.5 w-3.5 text-violet-400" />
            <span>Company Topic DNA</span>
            <span className="text-[11px] font-normal text-zinc-500">
              (Top recurring interview patterns)
            </span>
          </div>
          {selectedTopic && (
            <button
              onClick={() => setSelectedTopic(null)}
              className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 cursor-pointer"
            >
              <FilterX className="h-3 w-3" />
              <span>Clear Topic Filter</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
          {activeCompanyData.topTopics.slice(0, 12).map(({ topic, count }) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() =>
                  setSelectedTopic(isSelected ? null : topic)
                }
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer',
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-500/20'
                    : 'bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-300 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:border-zinc-700 hover:bg-zinc-800'
                )}
              >
                <span>{topic}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1 rounded-full',
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-400'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
