'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DIFFICULTY_CONFIG, formatTimeSeconds, cn } from '@/lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Minimize2,
  Maximize2,
  Timer as TimerIcon,
  Flame,
} from 'lucide-react';

export const MockInterviewTimer: React.FC = () => {
  const { timer, pauseTimer, resumeTimer, resetTimer, stopTimer, setProblemStatus, userStore, updateProblemNotes } =
    useApp();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!timer.problem) return null;

  const problem = timer.problem;
  const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];
  const targetSeconds = timer.targetSeconds;
  const elapsed = timer.elapsedSeconds;
  const progressPercent = Math.min(100, Math.round((elapsed / targetSeconds) * 100));
  const isOvertime = elapsed > targetSeconds;

  const handleMarkSolved = () => {
    // Save time spent
    const current = userStore.problems[problem.id];
    const prevTime = current?.timeSpentSeconds || 0;
    updateProblemNotes(problem.id, {
      timeSpentSeconds: prevTime + elapsed,
    });
    setProblemStatus(problem.id, 'solved');
    stopTimer();
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-2xl border border-zinc-700/80 bg-[#121216]/95 backdrop-blur-xl shadow-2xl transition-all duration-300',
        isMinimized ? 'w-64 p-3' : 'w-84 sm:w-96 p-4'
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <TimerIcon className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {isMinimized ? 'Interview Timer' : problem.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isMinimized ? 'Expand Timer' : 'Minimize Timer'}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={stopTimer}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
            title="Close Timer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="space-y-3">
          {/* Difficulty and target goal */}
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider',
                diffConfig.badgeClass
              )}
            >
              {problem.difficulty} • Target: {Math.floor(targetSeconds / 60)}m
            </span>
            {isOvertime && (
              <span className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
                <Flame className="h-3 w-3" /> Overtime
              </span>
            )}
          </div>

          {/* Large Stopwatch Display */}
          <div className="flex items-baseline justify-center gap-2 py-1">
            <span
              className={cn(
                'text-3xl sm:text-4xl font-bold font-mono tracking-tight',
                isOvertime ? 'text-rose-400' : 'text-zinc-100'
              )}
            >
              {formatTimeSeconds(elapsed)}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              / {formatTimeSeconds(targetSeconds)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                isOvertime ? 'bg-rose-500' : 'bg-amber-400'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              {timer.isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-amber-300" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={resetTimer}
                className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Solved Action */}
            <button
              onClick={handleMarkSolved}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-emerald-500/10"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Solved</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimized view content */}
      {isMinimized && (
        <div className="flex items-center justify-between pt-1">
          <span
            className={cn(
              'text-lg font-bold font-mono',
              isOvertime ? 'text-rose-400' : 'text-zinc-200'
            )}
          >
            {formatTimeSeconds(elapsed)}
          </span>
          <div className="flex items-center gap-1">
            {timer.isRunning ? (
              <button
                onClick={pauseTimer}
                className="p-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                <Pause className="h-3 w-3" />
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
              >
                <Play className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={handleMarkSolved}
              className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
              title="Mark Solved"
            >
              <CheckCircle2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
