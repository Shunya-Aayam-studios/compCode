'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Manifest,
  CompanyData,
  CompanyManifestItem,
  Problem,
  TimeframeKey,
  CrossCompanyIndex,
  CrossCompanyEntry,
  UserProgressStore,
  ProblemUserData,
  ProblemStatus,
  Difficulty,
  PresetFilter,
} from '@/types';
import {
  loadUserData,
  saveUserData,
  updateStreakOnActivity,
  exportUserDataAsJSON,
  parseImportUserData,
  getDefaultUserData,
} from '@/lib/storage';
import { STATUS_CONFIG, DIFFICULTY_CONFIG } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface TimerState {
  problem: Problem | null;
  elapsedSeconds: number;
  targetSeconds: number;
  isRunning: boolean;
}

interface AppContextType {
  // Manifest & Company Data
  manifest: Manifest | null;
  isLoadingManifest: boolean;
  activeCompanySlug: string;
  activeCompanyData: CompanyData | null;
  isLoadingCompany: boolean;
  selectCompany: (slug: string) => void;

  // Timeframe
  activeTimeframe: TimeframeKey;
  setActiveTimeframe: (tf: TimeframeKey) => void;

  // Filters
  presetFilter: PresetFilter;
  setPresetFilter: (preset: PresetFilter) => void;
  blindMode: boolean;
  toggleBlindMode: () => void;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string | null) => void;
  selectedDifficulty: 'ALL' | Difficulty;
  setSelectedDifficulty: (d: 'ALL' | Difficulty) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  resetFilters: () => void;

  // User State
  userStore: UserProgressStore;
  getProblemUserData: (id: string) => ProblemUserData;
  cycleProblemStatus: (problem: Problem) => void;
  setProblemStatus: (problemId: string, status: ProblemStatus) => void;
  toggleBookmark: (problemId: string) => void;
  updateProblemNotes: (
    problemId: string,
    updates: Partial<Omit<ProblemUserData, 'status' | 'bookmarked'>>
  ) => void;
  togglePinCompany: (companySlug: string) => void;
  isCompanyPinned: (companySlug: string) => boolean;
  getCompanyStats: (company: CompanyManifestItem) => {
    solved: number;
    attempted: number;
    revision: number;
    percent: number;
  };

  // Cross Company
  crossCompanyIndex: CrossCompanyIndex | null;
  loadCrossCompanyIndex: () => Promise<CrossCompanyIndex>;
  getCrossCompanyEntries: (problemId: string) => CrossCompanyEntry[];

  // Timer
  timer: TimerState;
  startTimer: (problem: Problem) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => void;

  // Drawer
  drawerProblem: Problem | null;
  openDrawer: (problem: Problem) => void;
  closeDrawer: () => void;

  // Modals & Panels
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isOverlapModalOpen: boolean;
  setIsOverlapModalOpen: (open: boolean) => void;
  isImportExportOpen: boolean;
  setIsImportExportOpen: (open: boolean) => void;

  // Theme & Actions
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  triggerConfetti: () => void;
  exportData: () => void;
  importData: (jsonStr: string) => { success: boolean; error?: string };
  pickRandomProblem: () => Problem | null;
}

const AppContext = createContext<AppContextType | null>(null);

// In-memory cache for company data files
const companyCache = new Map<string, CompanyData>();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [isLoadingManifest, setIsLoadingManifest] = useState(true);
  const [activeCompanySlug, setActiveCompanySlug] = useState<string>('amazon');
  const [activeCompanyData, setActiveCompanyData] = useState<CompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeKey>('thirtyDays');

  // Filters
  const [presetFilter, setPresetFilter] = useState<PresetFilter>('all');
  const [blindMode, setBlindMode] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | Difficulty>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User state
  const [userStore, setUserStore] = useState<UserProgressStore>(getDefaultUserData);

  // Cross-company index
  const [crossCompanyIndex, setCrossCompanyIndex] = useState<CrossCompanyIndex | null>(null);

  // Timer
  const [timer, setTimer] = useState<TimerState>({
    problem: null,
    elapsedSeconds: 0,
    targetSeconds: 25 * 60,
    isRunning: false,
  });

  // Drawer
  const [drawerProblem, setDrawerProblem] = useState<Problem | null>(null);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Sync theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load manifest on mount
  useEffect(() => {
    async function init() {
      try {
        setIsLoadingManifest(true);
        const res = await fetch('/data/manifest.json');
        if (!res.ok) throw new Error('Failed to load manifest');
        const data: Manifest = await res.json();
        setManifest(data);

        // Load stored user data
        const stored = loadUserData();
        setUserStore(stored);
        setBlindMode(stored.blindMode);
        setTheme(stored.theme);

        if (stored.theme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }

        // Default company: either first pinned or 'amazon'
        const initialCompany = stored.pinnedCompanies[0] || 'amazon';
        loadCompany(initialCompany);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoadingManifest(false);
      }
    }
    init();
  }, []);

  // Fetch company data
  const loadCompany = useCallback(async (slug: string) => {
    if (companyCache.has(slug)) {
      const cached = companyCache.get(slug)!;
      setActiveCompanyData(cached);
      setActiveCompanySlug(slug);

      // Set most appropriate initial timeframe
      if (
        !cached.problems[activeTimeframe] ||
        cached.problems[activeTimeframe].length === 0
      ) {
        const firstAvailable =
          cached.availableTimeframes[0] || ('all' as TimeframeKey);
        setActiveTimeframe(firstAvailable);
      }
      return;
    }

    try {
      setIsLoadingCompany(true);
      const res = await fetch(`/data/companies/${slug}.json`);
      if (!res.ok) throw new Error(`Could not load company ${slug}`);
      const data: CompanyData = await res.json();
      companyCache.set(slug, data);
      setActiveCompanyData(data);
      setActiveCompanySlug(slug);

      // Default to thirtyDays if available, else first non-empty timeframe
      if (
        data.problems.thirtyDays &&
        data.problems.thirtyDays.length > 0
      ) {
        setActiveTimeframe('thirtyDays');
      } else if (data.availableTimeframes.length > 0) {
        setActiveTimeframe(data.availableTimeframes[0]);
      } else {
        setActiveTimeframe('all');
      }
    } catch (err) {
      console.error(`Error loading company ${slug}:`, err);
    } finally {
      setIsLoadingCompany(false);
    }
  }, [activeTimeframe]);

  const selectCompany = useCallback((slug: string) => {
    loadCompany(slug);
  }, [loadCompany]);

  // Load Cross-Company Index lazily
  const loadCrossCompanyIndex = useCallback(async () => {
    if (crossCompanyIndex) return crossCompanyIndex;
    try {
      const res = await fetch('/data/cross-company-index.json');
      const data: CrossCompanyIndex = await res.json();
      setCrossCompanyIndex(data);
      return data;
    } catch (err) {
      console.error('Failed to load cross company index:', err);
      return {};
    }
  }, [crossCompanyIndex]);

  // Start background prefetch of cross-company index after idle
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCrossCompanyIndex();
    }, 2000);
    return () => clearTimeout(timer);
  }, [loadCrossCompanyIndex]);

  const getCrossCompanyEntries = useCallback(
    (problemId: string): CrossCompanyEntry[] => {
      if (!crossCompanyIndex) return [];
      return crossCompanyIndex[problemId] || [];
    },
    [crossCompanyIndex]
  );

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Save to storage helper
  const commitUserStore = useCallback((updater: (prev: UserProgressStore) => UserProgressStore) => {
    setUserStore(prev => {
      const next = updater(prev);
      saveUserData(next);
      return next;
    });
  }, []);

  // Cycle Problem Status: unsolved -> solved -> attempted -> revision -> unsolved
  const cycleProblemStatus = useCallback(
    (problem: Problem) => {
      const id = problem.id;
      commitUserStore(prev => {
        const currentData = prev.problems[id] || {
          status: 'unsolved',
          bookmarked: false,
        };

        const nextStatus = STATUS_CONFIG[currentData.status].next;
        const now = Date.now();

        // Update streak on solve
        let nextStreak = prev.dailyStreak;
        let nextLastActive = prev.lastActiveDate;

        if (nextStatus === 'solved') {
          const streakUpdate = updateStreakOnActivity(
            prev.dailyStreak,
            prev.lastActiveDate
          );
          nextStreak = streakUpdate.newStreak;
          nextLastActive = streakUpdate.newLastActiveDate;
          triggerConfetti();

          // If timer was running for this problem, save elapsed time
          if (timer.problem?.id === id && timer.elapsedSeconds > 0) {
            currentData.timeSpentSeconds =
              (currentData.timeSpentSeconds || 0) + timer.elapsedSeconds;
          }
        }

        const updatedProblemData: ProblemUserData = {
          ...currentData,
          status: nextStatus,
          solvedAt: nextStatus === 'solved' ? now : currentData.solvedAt,
          lastAttemptedAt: now,
        };

        return {
          ...prev,
          dailyStreak: nextStreak,
          lastActiveDate: nextLastActive,
          problems: {
            ...prev.problems,
            [id]: updatedProblemData,
          },
        };
      });
    },
    [commitUserStore, timer, triggerConfetti]
  );

  const setProblemStatus = useCallback(
    (problemId: string, status: ProblemStatus) => {
      commitUserStore(prev => {
        const current = prev.problems[problemId] || {
          status: 'unsolved',
          bookmarked: false,
        };
        if (status === 'solved') {
          triggerConfetti();
        }
        return {
          ...prev,
          problems: {
            ...prev.problems,
            [problemId]: {
              ...current,
              status,
              solvedAt: status === 'solved' ? Date.now() : current.solvedAt,
              lastAttemptedAt: Date.now(),
            },
          },
        };
      });
    },
    [commitUserStore, triggerConfetti]
  );

  const toggleBookmark = useCallback(
    (problemId: string) => {
      commitUserStore(prev => {
        const current = prev.problems[problemId] || {
          status: 'unsolved',
          bookmarked: false,
        };
        return {
          ...prev,
          problems: {
            ...prev.problems,
            [problemId]: {
              ...current,
              bookmarked: !current.bookmarked,
            },
          },
        };
      });
    },
    [commitUserStore]
  );

  const updateProblemNotes = useCallback(
    (
      problemId: string,
      updates: Partial<Omit<ProblemUserData, 'status' | 'bookmarked'>>
    ) => {
      commitUserStore(prev => {
        const current = prev.problems[problemId] || {
          status: 'unsolved',
          bookmarked: false,
        };
        return {
          ...prev,
          problems: {
            ...prev.problems,
            [problemId]: {
              ...current,
              ...updates,
            },
          },
        };
      });
    },
    [commitUserStore]
  );

  const togglePinCompany = useCallback(
    (slug: string) => {
      commitUserStore(prev => {
        const exists = prev.pinnedCompanies.includes(slug);
        let nextPinned: string[];
        if (exists) {
          nextPinned = prev.pinnedCompanies.filter(s => s !== slug);
        } else {
          if (prev.pinnedCompanies.length >= 6) {
            // max 6 pinned
            nextPinned = [...prev.pinnedCompanies.slice(1), slug];
          } else {
            nextPinned = [...prev.pinnedCompanies, slug];
          }
        }
        return {
          ...prev,
          pinnedCompanies: nextPinned,
        };
      });
    },
    [commitUserStore]
  );

  const isCompanyPinned = useCallback(
    (slug: string) => {
      return userStore.pinnedCompanies.includes(slug);
    },
    [userStore.pinnedCompanies]
  );

  const getProblemUserData = useCallback(
    (id: string): ProblemUserData => {
      return (
        userStore.problems[id] || {
          status: 'unsolved',
          bookmarked: false,
        }
      );
    },
    [userStore.problems]
  );

  // Compute stats for a company based on user's solved problems
  const getCompanyStats = useCallback(
    (company: CompanyManifestItem) => {
      // Get all problem IDs in this company if cached
      const cached = companyCache.get(company.slug);
      let solved = 0;
      let attempted = 0;
      let revision = 0;

      if (cached && cached.problems.all) {
        for (const p of cached.problems.all) {
          const u = userStore.problems[p.id];
          if (u?.status === 'solved') solved++;
          else if (u?.status === 'attempted') attempted++;
          else if (u?.status === 'revision') revision++;
        }
      } else {
        // Fallback: estimate or iterate over all solved problems that appear in manifest
        // Since we don't have all IDs without fetching, we count from stored problems
        // If cached is not loaded, we can return 0 or cached count
      }

      const total = company.totalUniqueQuestions || 1;
      const percent = Math.min(100, Math.round((solved / total) * 100));

      return { solved, attempted, revision, percent };
    },
    [userStore.problems]
  );

  // Blind Mode toggle
  const toggleBlindMode = useCallback(() => {
    setBlindMode(prev => {
      const next = !prev;
      commitUserStore(store => ({ ...store, blindMode: next }));
      return next;
    });
  }, [commitUserStore]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      commitUserStore(store => ({ ...store, theme: next }));
      if (next === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
      return next;
    });
  }, [commitUserStore]);

  // Timer controls
  const startTimer = useCallback((problem: Problem) => {
    const target = DIFFICULTY_CONFIG[problem.difficulty].targetSeconds;
    setTimer({
      problem,
      elapsedSeconds: 0,
      targetSeconds: target,
      isRunning: true,
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, elapsedSeconds: 0 }));
  }, []);

  const stopTimer = useCallback(() => {
    setTimer({
      problem: null,
      elapsedSeconds: 0,
      targetSeconds: 25 * 60,
      isRunning: false,
    });
  }, []);

  // Drawer
  const openDrawer = useCallback((problem: Problem) => {
    setDrawerProblem(problem);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerProblem(null);
  }, []);

  const resetFilters = useCallback(() => {
    setPresetFilter('all');
    setSelectedTopic(null);
    setSelectedDifficulty('ALL');
    setSearchQuery('');
  }, []);

  // Export / Import
  const exportData = useCallback(() => {
    exportUserDataAsJSON(userStore);
  }, [userStore]);

  const importData = useCallback(
    (jsonStr: string) => {
      try {
        const parsed = parseImportUserData(jsonStr);
        saveUserData(parsed);
        setUserStore(parsed);
        setBlindMode(parsed.blindMode);
        setTheme(parsed.theme);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Invalid backup JSON' };
      }
    },
    []
  );

  // Pick Random Problem from current active timeframe + filters
  const pickRandomProblem = useCallback((): Problem | null => {
    if (!activeCompanyData) return null;
    const list = activeCompanyData.problems[activeTimeframe] || [];
    const unsolvedList = list.filter(p => {
      const u = getProblemUserData(p.id);
      return u.status === 'unsolved';
    });
    const pool = unsolvedList.length > 0 ? unsolvedList : list;
    if (pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }, [activeCompanyData, activeTimeframe, getProblemUserData]);

  // Global Keyboard shortcuts: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsOverlapModalOpen(false);
        setIsImportExportOpen(false);
        if (drawerProblem) {
          setDrawerProblem(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerProblem]);

  const value = useMemo(
    () => ({
      manifest,
      isLoadingManifest,
      activeCompanySlug,
      activeCompanyData,
      isLoadingCompany,
      selectCompany,
      activeTimeframe,
      setActiveTimeframe,
      presetFilter,
      setPresetFilter,
      blindMode,
      toggleBlindMode,
      selectedTopic,
      setSelectedTopic,
      selectedDifficulty,
      setSelectedDifficulty,
      searchQuery,
      setSearchQuery,
      resetFilters,
      userStore,
      getProblemUserData,
      cycleProblemStatus,
      setProblemStatus,
      toggleBookmark,
      updateProblemNotes,
      togglePinCompany,
      isCompanyPinned,
      getCompanyStats,
      crossCompanyIndex,
      loadCrossCompanyIndex,
      getCrossCompanyEntries,
      timer,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      stopTimer,
      drawerProblem,
      openDrawer,
      closeDrawer,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      isOverlapModalOpen,
      setIsOverlapModalOpen,
      isImportExportOpen,
      setIsImportExportOpen,
      theme,
      toggleTheme,
      triggerConfetti,
      exportData,
      importData,
      pickRandomProblem,
    }),
    [
      manifest,
      isLoadingManifest,
      activeCompanySlug,
      activeCompanyData,
      isLoadingCompany,
      selectCompany,
      activeTimeframe,
      presetFilter,
      blindMode,
      toggleBlindMode,
      selectedTopic,
      selectedDifficulty,
      searchQuery,
      resetFilters,
      userStore,
      getProblemUserData,
      cycleProblemStatus,
      setProblemStatus,
      toggleBookmark,
      updateProblemNotes,
      togglePinCompany,
      isCompanyPinned,
      getCompanyStats,
      crossCompanyIndex,
      loadCrossCompanyIndex,
      getCrossCompanyEntries,
      timer,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      stopTimer,
      drawerProblem,
      openDrawer,
      closeDrawer,
      isCommandPaletteOpen,
      isOverlapModalOpen,
      isImportExportOpen,
      theme,
      toggleTheme,
      triggerConfetti,
      exportData,
      importData,
      pickRandomProblem,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
