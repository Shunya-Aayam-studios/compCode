'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DIFFICULTY_CONFIG, STATUS_CONFIG, formatTimeSeconds, cn } from '@/lib/utils';
import { ProblemStatus } from '@/types';
import {
  X,
  ExternalLink,
  Star,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Code2,
  BookOpen,
  Cpu,
  Layers,
} from 'lucide-react';

export const RevisionDrawer: React.FC = () => {
  const {
    drawerProblem,
    closeDrawer,
    userStore,
    getProblemUserData,
    updateProblemNotes,
    setProblemStatus,
    toggleBookmark,
    activeCompanyData,
  } = useApp();

  const [intuition, setIntuition] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [notes, setNotes] = useState('');
  const [revealIntuition, setRevealIntuition] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Sync state whenever drawerProblem changes
  useEffect(() => {
    if (drawerProblem) {
      const u = getProblemUserData(drawerProblem.id);
      setIntuition(u.intuition || '');
      setTimeComplexity(u.timeComplexity || '');
      setSpaceComplexity(u.spaceComplexity || '');
      setNotes(u.notes || '');
      setRevealIntuition(false);
      setSavedToast(false);
    }
  }, [drawerProblem, getProblemUserData]);

  if (!drawerProblem) return null;

  const problem = drawerProblem;
  const userData = getProblemUserData(problem.id);
  const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];

  const handleSave = () => {
    updateProblemNotes(problem.id, {
      intuition,
      timeComplexity,
      spaceComplexity,
      notes,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleStatusChange = (newStatus: ProblemStatus) => {
    setProblemStatus(problem.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#111114] border-l border-zinc-800 text-zinc-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider',
                    diffConfig.badgeClass
                  )}
                >
                  {problem.difficulty}
                </span>

                <span className="text-xs font-mono text-zinc-400">
                  Freq: {problem.frequency.toFixed(1)}%
                </span>

                {problem.otherCompaniesCount > 0 && (
                  <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                    +{problem.otherCompaniesCount} cos
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight truncate">
                {problem.title}
              </h2>

              <div className="flex items-center gap-2">
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium"
                >
                  <span>Open on LeetCode</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Bookmark Star */}
              <button
                onClick={() => toggleBookmark(problem.id)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
                title={userData.bookmarked ? 'Bookmarked' : 'Add Bookmark'}
              >
                <Star
                  className={cn(
                    'h-4 w-4',
                    userData.bookmarked
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-zinc-500'
                  )}
                />
              </button>

              {/* Close Button */}
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
            {/* Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Preparation Status
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['unsolved', 'solved', 'attempted', 'revision'] as ProblemStatus[]).map(
                  st => {
                    const cfg = STATUS_CONFIG[st];
                    const isCurrent = userData.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={cn(
                          'py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer',
                          isCurrent
                            ? cn(cfg.badgeClass, 'ring-1 ring-inset')
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                        )}
                      >
                        {cfg.label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Topics Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Algorithms & Topics
              </label>
              <div className="flex flex-wrap gap-1.5">
                {problem.topics.map(t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Intuition / Spoiler Hint */}
            <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Key Intuition / Spoiler Hint</span>
                </div>
                <button
                  onClick={() => setRevealIntuition(prev => !prev)}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  {revealIntuition ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span>Blur hint</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Reveal hint</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={intuition}
                  onChange={e => setIntuition(e.target.value)}
                  placeholder="Record the core trick, invariant, or recurrence relation here..."
                  rows={3}
                  className={cn(
                    'w-full text-xs rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-all resize-none',
                    !revealIntuition && intuition.trim().length > 0
                      ? 'filter blur-sm select-none'
                      : ''
                  )}
                />
                {!revealIntuition && intuition.trim().length > 0 && (
                  <div
                    onClick={() => setRevealIntuition(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs rounded-lg cursor-pointer text-xs font-medium text-amber-300 hover:text-amber-200"
                  >
                    Click to unblur spoiler hint
                  </div>
                )}
              </div>
            </div>

            {/* Time & Space Complexity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-blue-400" />
                  <span>Time Complexity</span>
                </label>
                <input
                  type="text"
                  value={timeComplexity}
                  onChange={e => setTimeComplexity(e.target.value)}
                  placeholder="e.g. O(N log N)"
                  className="w-full text-xs font-mono rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Space Complexity</span>
                </label>
                <input
                  type="text"
                  value={spaceComplexity}
                  onChange={e => setSpaceComplexity(e.target.value)}
                  placeholder="e.g. O(1) or O(N)"
                  className="w-full text-xs font-mono rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Personal Solution / Markdown Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                <span>Personal Solution / Markdown Notes</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Write your edge case checklists, template snippets, or approach tradeoffs here..."
                rows={8}
                className="w-full text-xs font-mono rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors custom-scrollbar"
              />
            </div>

            {/* Performance History */}
            {userData.timeSpentSeconds !== undefined && userData.timeSpentSeconds > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-xs text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  Recorded mock interview time:{' '}
                  <strong className="text-zinc-200 font-mono">
                    {formatTimeSeconds(userData.timeSpentSeconds)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
            <div>
              {savedToast && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Notes saved locally!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={closeDrawer}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-violet-500/40 bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
