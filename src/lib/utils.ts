import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Difficulty, ProblemStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFrequency(freq: number): string {
  return `${freq.toFixed(1)}%`;
}

export function formatAcceptanceRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function formatTimeSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    badgeClass: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
    targetSeconds: number; // For interview timer
  }
> = {
  EASY: {
    label: 'Easy',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    targetSeconds: 20 * 60, // 20 mins
  },
  MEDIUM: {
    label: 'Medium',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    targetSeconds: 35 * 60, // 35 mins
  },
  HARD: {
    label: 'Hard',
    badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-500',
    borderClass: 'border-rose-500',
    targetSeconds: 45 * 60, // 45 mins
  },
};

export const STATUS_CONFIG: Record<
  ProblemStatus,
  {
    label: string;
    badgeClass: string;
    iconColor: string;
    next: ProblemStatus;
  }
> = {
  unsolved: {
    label: 'Unsolved',
    badgeClass: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/50',
    iconColor: 'text-zinc-500',
    next: 'solved',
  },
  solved: {
    label: 'Solved',
    badgeClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30 font-medium',
    iconColor: 'text-emerald-400',
    next: 'attempted',
  },
  attempted: {
    label: 'Attempted',
    badgeClass: 'text-amber-400 bg-amber-500/15 border-amber-500/30 font-medium',
    iconColor: 'text-amber-400',
    next: 'revision',
  },
  revision: {
    label: 'Needs Revision',
    badgeClass: 'text-purple-400 bg-purple-500/15 border-purple-500/30 font-medium',
    iconColor: 'text-purple-400',
    next: 'unsolved',
  },
};
