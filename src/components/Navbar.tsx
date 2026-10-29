"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Orbit,
  Flame,
  Search,
  Shuffle,
  Layers,
  Download,
  Sun,
  Moon,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    manifest,
    userStore,
    setIsCommandPaletteOpen,
    setIsOverlapModalOpen,
    setIsImportExportOpen,
    theme,
    toggleTheme,
    pickRandomProblem,
    openDrawer,
    activeCompanyData,
  } = useApp();

  // Calculate total solved
  const totalSolved = Object.values(userStore.problems).filter(
    (p) => p.status === "solved",
  ).length;

  const handlePickRandom = () => {
    const randomProb = pickRandomProblem();
    if (randomProb) {
      openDrawer(randomProb);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#09090b]/90 light:bg-white/95 light:border-zinc-200 transition-colors">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Global Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
              <Orbit className="h-4 w-4 animate-spin-slow" />
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white dark:text-white light:text-zinc-900 text-base">
                  Comp Code
                </span>
                <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400 border border-violet-500/20">
                  BETA
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-xs text-zinc-400">
            <span className="flex items-center gap-1 font-mono">
              <span className="text-zinc-200 dark:text-zinc-200 light:text-zinc-700 font-semibold">
                {manifest ? manifest.totalCompanies : 470}
              </span>{" "}
              Companies
            </span>
            <span className="text-zinc-700 dark:text-zinc-700 light:text-zinc-300">
              •
            </span>
            <span className="flex items-center gap-1 font-mono">
              <span className="text-zinc-200 dark:text-zinc-200 light:text-zinc-700 font-semibold">
                {manifest
                  ? manifest.totalUniqueProblems.toLocaleString()
                  : "3,396"}
              </span>{" "}
              Problems
            </span>
          </div>
        </div>

        {/* Center: Search Trigger (Cmd + K) */}
        <div className="flex items-center">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 hover:border-zinc-700 dark:hover:border-zinc-700 light:hover:border-zinc-300 text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 text-xs transition-all w-52 sm:w-72 justify-between group cursor-pointer shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-violet-400 transition-colors" />
              <span className="truncate">Search companies, problems...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-700/60 dark:border-zinc-700/60 light:border-zinc-300 bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-white px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: User Stats, Overlap radar, Pick random, Backup, Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Daily Streak */}
          <div
            title={`Daily Streak: ${userStore.dailyStreak} day(s)`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-medium"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="font-mono">{userStore.dailyStreak}d</span>
          </div>

          {/* Solved count */}
          <div
            title={`Total Solved: ${totalSolved}`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-mono">{totalSolved} Solved</span>
          </div>

          {/* Overlap Radar */}
          <button
            onClick={() => setIsOverlapModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 hover:border-violet-500/50 hover:bg-violet-500/10 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-violet-300 text-xs font-medium transition-colors cursor-pointer"
            title="Multi-Company Question Overlap"
          >
            <Layers className="h-3.5 w-3.5 text-violet-400" />
            <span className="hidden md:inline">Company Overlap</span>
          </button>

          {/* Pick Random */}
          <button
            onClick={handlePickRandom}
            disabled={!activeCompanyData}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
            title="Pick a random unsolved question from active list"
          >
            <Shuffle className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden xl:inline">Pick One</span>
          </button>

          {/* Import / Export Backup */}
          <button
            onClick={() => setIsImportExportOpen(true)}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
            title="Import or Export Progress JSON"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden lg:inline">Backup</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 text-xs transition-colors cursor-pointer"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-violet-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
