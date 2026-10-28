'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Problem, Difficulty, ProblemStatus } from '@/types';
import { DIFFICULTY_CONFIG, STATUS_CONFIG, cn } from '@/lib/utils';
import { FrequencyHeatMeter } from '@/components/FrequencyHeatMeter';
import { CrossCompanyPopover } from '@/components/CrossCompanyPopover';
import {
  CheckCircle2,
  CircleDot,
  Flag,
  Circle,
  Star,
  ExternalLink,
  Timer,
  FileEdit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shuffle,
  Inbox,
} from 'lucide-react';

type SortColumn = 'frequency' | 'acceptanceRate' | 'difficulty' | 'status' | 'title';
type SortDirection = 'asc' | 'desc';

export const ProblemTable: React.FC = () => {
  const {
    activeCompanyData,
    activeTimeframe,
    presetFilter,
    blindMode,
    selectedTopic,
    selectedDifficulty,
    searchQuery,
    userStore,
    getProblemUserData,
    cycleProblemStatus,
    toggleBookmark,
    startTimer,
    openDrawer,
    pickRandomProblem,
  } = useApp();

  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('frequency');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Difficulty rank for sorting
  const difficultyRank: Record<Difficulty, number> = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
  };

  const statusRank: Record<ProblemStatus, number> = {
    unsolved: 1,
    attempted: 2,
    revision: 3,
    solved: 4,
  };

  // Base problem list
  const baseProblems = useMemo(() => {
    if (!activeCompanyData) return [];

    // High Yield Sprint Preset: Combine 30 Days and 3 Months
    if (presetFilter === 'high-yield') {
      const p30 = activeCompanyData.problems.thirtyDays || [];
      const p3m = activeCompanyData.problems.threeMonths || [];
      const map = new Map<string, Problem>();
      for (const p of [...p30, ...p3m]) {
        if (!map.has(p.id) || p.frequency > map.get(p.id)!.frequency) {
          map.set(p.id, p);
        }
      }
      return Array.from(map.values());
    }

    return activeCompanyData.problems[activeTimeframe] || [];
  }, [activeCompanyData, activeTimeframe, presetFilter]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    let list = [...baseProblems];

    // Preset filters
    if (presetFilter === 'high-yield') {
      // Unsolved top 25 highest frequency
      list = list
        .filter(p => {
          const u = getProblemUserData(p.id);
          return u.status === 'unsolved';
        })
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 25);
    } else if (presetFilter === 'needs-revision') {
      list = list.filter(p => {
        const u = getProblemUserData(p.id);
        if (u.status === 'revision') return true;
        // Or solved > 7 days ago
        if (u.status === 'solved' && u.solvedAt) {
          const diffDays = (Date.now() - u.solvedAt) / (1000 * 3600 * 24);
          return diffDays >= 7;
        }
        return false;
      });
    } else if (presetFilter === 'bookmarked') {
      list = list.filter(p => getProblemUserData(p.id).bookmarked);
    } else if (presetFilter === 'unsolved') {
      list = list.filter(p => getProblemUserData(p.id).status === 'unsolved');
    }

    // Difficulty filter
    if (selectedDifficulty !== 'ALL') {
      list = list.filter(p => p.difficulty === selectedDifficulty);
    }

    // Topic filter
    if (selectedTopic) {
      list = list.filter(p => p.topics.includes(selectedTopic));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.topics.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'frequency') {
        comparison = a.frequency - b.frequency;
      } else if (sortColumn === 'acceptanceRate') {
        comparison = a.acceptanceRate - b.acceptanceRate;
      } else if (sortColumn === 'difficulty') {
        comparison = difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
      } else if (sortColumn === 'status') {
        const uA = getProblemUserData(a.id).status;
        const uB = getProblemUserData(b.id).status;
        comparison = statusRank[uA] - statusRank[uB];
      } else if (sortColumn === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [
    baseProblems,
    presetFilter,
    selectedDifficulty,
    selectedTopic,
    searchQuery,
    sortColumn,
    sortDirection,
    getProblemUserData,
  ]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [presetFilter, selectedDifficulty, selectedTopic, searchQuery, activeTimeframe, activeCompanyData]);

  // Paginated slice
  const totalItems = filteredProblems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProblems.slice(start, start + pageSize);
  }, [filteredProblems, currentPage, pageSize]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-violet-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-violet-400" />
    );
  };

  // Status icon renderer
  const renderStatusButton = (problem: Problem) => {
    const u = getProblemUserData(problem.id);
    const status = u.status;

    let icon = <Circle className="h-4 w-4 text-zinc-600 hover:text-zinc-400" />;
    let tooltip = 'Status: Unsolved (Click to cycle: Solved -> Attempted -> Revision)';

    if (status === 'solved') {
      icon = <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/20" />;
      tooltip = 'Status: Solved (Click to mark Attempted)';
    } else if (status === 'attempted') {
      icon = <CircleDot className="h-4 w-4 text-amber-400 fill-amber-500/20" />;
      tooltip = 'Status: Attempted (Click to mark Needs Revision)';
    } else if (status === 'revision') {
      icon = <Flag className="h-4 w-4 text-purple-400 fill-purple-500/20" />;
      tooltip = 'Status: Needs Revision (Click to reset Unsolved)';
    }

    return (
      <button
        onClick={e => {
          e.stopPropagation();
          cycleProblemStatus(problem);
        }}
        className="p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
        title={tooltip}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Table Action Header: Summary & Pick Random */}
      <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
        <div>
          Showing{' '}
          <strong className="text-zinc-200 dark:text-zinc-200 light:text-zinc-800">
            {totalItems}
          </strong>{' '}
          {totalItems === 1 ? 'question' : 'questions'}
          {presetFilter === 'high-yield' && (
            <span className="text-amber-400 ml-2 font-mono">
              ⚡ High-Yield Sprint Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const p = pickRandomProblem();
              if (p) openDrawer(p);
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-violet-400 cursor-pointer font-medium"
          >
            <Shuffle className="h-3 w-3" />
            <span>Random Problem</span>
          </button>
        </div>
      </div>

      {/* Main Table Surface */}
      <div className="rounded-xl border border-zinc-800/90 dark:border-zinc-800/90 light:border-zinc-200 bg-[#0d0d10] dark:bg-[#0d0d10] light:bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-950/60 dark:bg-zinc-950/60 light:bg-zinc-50 text-zinc-400 select-none">
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center justify-center gap-1 group mx-auto cursor-pointer"
                    title="Sort by Status"
                  >
                    <span>#</span>
                    {getSortIcon('status')}
                  </button>
                </th>

                <th className="py-2.5 px-2 w-8 text-center">★</th>

                <th className="py-2.5 px-3 min-w-[280px]">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1.5 font-medium group cursor-pointer text-zinc-300 dark:text-zinc-300 light:text-zinc-700"
                  >
                    <span>Problem Title</span>
                    {getSortIcon('title')}
                  </button>
                </th>

                <th className="py-2.5 px-3 w-28">
                  <button
                    onClick={() => handleSort('difficulty')}
                    className="flex items-center gap-1.5 font-medium group cursor-pointer text-zinc-300 dark:text-zinc-300 light:text-zinc-700"
                  >
                    <span>Difficulty</span>
                    {getSortIcon('difficulty')}
                  </button>
                </th>

                <th className="py-2.5 px-3 w-36">
                  <button
                    onClick={() => handleSort('frequency')}
                    className="flex items-center gap-1.5 font-medium group cursor-pointer text-zinc-300 dark:text-zinc-300 light:text-zinc-700"
                  >
                    <span>Frequency</span>
                    {getSortIcon('frequency')}
                  </button>
                </th>

                <th className="py-2.5 px-3 w-28">
                  <button
                    onClick={() => handleSort('acceptanceRate')}
                    className="flex items-center gap-1.5 font-medium group cursor-pointer text-zinc-300 dark:text-zinc-300 light:text-zinc-700"
                  >
                    <span>Acceptance</span>
                    {getSortIcon('acceptanceRate')}
                  </button>
                </th>

                <th className="py-2.5 px-3 min-w-[200px]">Topics</th>

                <th className="py-2.5 px-3 w-24 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800/60 dark:divide-zinc-800/60 light:divide-zinc-200">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-8 w-8 text-zinc-600" />
                      <p className="text-sm font-medium">No problems matching current filters</p>
                      <p className="text-xs text-zinc-500">
                        Try clearing active filters or switching timeframes
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((problem, index) => {
                  const u = getProblemUserData(problem.id);
                  const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];

                  return (
                    <tr
                      key={problem.id}
                      className="group hover:bg-zinc-900/40 dark:hover:bg-zinc-900/40 light:hover:bg-zinc-50 transition-colors"
                    >
                      {/* Status Column */}
                      <td className="py-2.5 px-3 text-center">
                        {renderStatusButton(problem)}
                      </td>

                      {/* Bookmark Star */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleBookmark(problem.id);
                          }}
                          className="p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                          title={u.bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                        >
                          <Star
                            className={cn(
                              'h-3.5 w-3.5 transition-colors',
                              u.bookmarked
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-zinc-600 hover:text-zinc-400'
                            )}
                          />
                        </button>
                      </td>

                      {/* Problem Title + Cross Company Badge + LeetCode Link */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-900 hover:text-violet-400 dark:hover:text-violet-400 transition-colors flex items-center gap-1.5 group/link"
                          >
                            <span>{problem.title}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 text-zinc-500 transition-opacity" />
                          </a>

                          {/* Cross Company Badge Popover */}
                          {problem.otherCompaniesCount > 0 && activeCompanyData && (
                            <CrossCompanyPopover
                              problemId={problem.id}
                              currentCompanySlug={activeCompanyData.slug}
                              count={problem.otherCompaniesCount}
                            />
                          )}
                        </div>
                      </td>

                      {/* Difficulty Pill */}
                      <td className="py-2.5 px-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider',
                            diffConfig.badgeClass
                          )}
                        >
                          {problem.difficulty}
                        </span>
                      </td>

                      {/* Frequency Heat Meter */}
                      <td className="py-2.5 px-3">
                        <FrequencyHeatMeter frequency={problem.frequency} />
                      </td>

                      {/* Acceptance Rate */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                          {problem.acceptanceRate.toFixed(1)}%
                        </span>
                      </td>

                      {/* Topics (with Blind Practice Mode spoiler cover) */}
                      <td className="py-2.5 px-3">
                        {blindMode ? (
                          <div className="group/spoiler relative inline-block">
                            <div className="filter blur-sm select-none opacity-40 group-hover/spoiler:blur-none group-hover/spoiler:opacity-100 transition-all flex flex-wrap gap-1">
                              {problem.topics.slice(0, 3).map(topic => (
                                <span
                                  key={topic}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400 group-hover/spoiler:opacity-0 pointer-events-none font-medium">
                              Hover to reveal
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {problem.topics.slice(0, 3).map(topic => (
                              <span
                                key={topic}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-200 text-zinc-400 dark:text-zinc-400 light:text-zinc-700 border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-300 whitespace-nowrap"
                              >
                                {topic}
                              </span>
                            ))}
                            {problem.topics.length > 3 && (
                              <span className="text-[10px] text-zinc-500 font-mono self-center">
                                +{problem.topics.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons: Timer, Notes/Revision Drawer */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Timer Button */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              startTimer(problem);
                            }}
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title="Start Mock Interview Timer"
                          >
                            <Timer className="h-3.5 w-3.5" />
                          </button>

                          {/* Notes Drawer Button */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              openDrawer(problem);
                            }}
                            className={cn(
                              'p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer',
                              u.notes || u.intuition
                                ? 'text-violet-400'
                                : 'text-zinc-400 hover:text-zinc-200'
                            )}
                            title="Open Revision Notes & Intuition"
                          >
                            <FileEdit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between p-3 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-950/40 dark:bg-zinc-950/40 light:bg-zinc-50 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded px-2 py-1 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-800 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={1000}>All</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
