import { UserProgressStore, ProblemUserData, ProblemStatus } from '@/types';

const STORAGE_KEY = 'dsa_orbit_user_data_v1';

const DEFAULT_PINNED = ['amazon', 'google', 'meta', 'microsoft', 'apple', 'uber'];

export function getDefaultUserData(): UserProgressStore {
  return {
    version: 1,
    updatedAt: '',
    pinnedCompanies: DEFAULT_PINNED,
    blindMode: false,
    theme: 'dark',
    dailyStreak: 1,
    lastActiveDate: '',
    problems: {},
  };
}

export function loadUserData(): UserProgressStore {
  if (typeof window === 'undefined') {
    return getDefaultUserData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];

    if (!raw) {
      const def: UserProgressStore = {
        ...getDefaultUserData(),
        updatedAt: new Date().toISOString(),
        lastActiveDate: today,
      };
      saveUserData(def);
      return def;
    }
    const parsed = JSON.parse(raw) as UserProgressStore;
    if (!parsed || typeof parsed !== 'object' || !parsed.problems) {
      return getDefaultUserData();
    }

    // Check streak
    const lastActive = parsed.lastActiveDate || today;

    if (lastActive && lastActive !== today) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffDays = Math.round(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays > 1) {
        // streak broken
        parsed.dailyStreak = 0;
      }
    }

    return {
      ...getDefaultUserData(),
      ...parsed,
      pinnedCompanies: Array.isArray(parsed.pinnedCompanies)
        ? parsed.pinnedCompanies
        : DEFAULT_PINNED,
    };
  } catch (err) {
    console.warn('Failed to load user progress from localStorage:', err);
    return getDefaultUserData();
  }
}

export function saveUserData(data: UserProgressStore): void {
  if (typeof window === 'undefined') return;
  try {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save user progress to localStorage:', err);
  }
}

export function updateStreakOnActivity(currentStreak: number, lastActiveDate: string): {
  newStreak: number;
  newLastActiveDate: string;
} {
  const today = new Date().toISOString().split('T')[0];
  if (lastActiveDate === today) {
    return { newStreak: Math.max(1, currentStreak), newLastActiveDate: today };
  }

  if (!lastActiveDate) {
    return { newStreak: 1, newLastActiveDate: today };
  }

  const lastDate = new Date(lastActiveDate);
  const currentDate = new Date(today);
  const diffDays = Math.round(
    (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
  );

  if (diffDays === 1) {
    return { newStreak: currentStreak + 1, newLastActiveDate: today };
  } else {
    return { newStreak: 1, newLastActiveDate: today };
  }
}

export function exportUserDataAsJSON(data: UserProgressStore): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dsa-orbit-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportUserData(jsonStr: string): UserProgressStore {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON file format.');
  }

  const problems = parsed.problems || parsed.progress || {};
  if (typeof problems !== 'object') {
    throw new Error('Missing problems progress object.');
  }

  return {
    version: parsed.version || 1,
    updatedAt: new Date().toISOString(),
    pinnedCompanies: Array.isArray(parsed.pinnedCompanies)
      ? parsed.pinnedCompanies
      : DEFAULT_PINNED,
    blindMode: Boolean(parsed.blindMode),
    theme: parsed.theme === 'light' ? 'light' : 'dark',
    dailyStreak: Number(parsed.dailyStreak) || 1,
    lastActiveDate: parsed.lastActiveDate || new Date().toISOString().split('T')[0],
    problems,
  };
}
