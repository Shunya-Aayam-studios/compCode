export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Problem {
  id: string; // slug, e.g. "two-sum"
  title: string;
  difficulty: Difficulty;
  frequency: number; // 0.0 - 100.0
  acceptanceRate: number; // 0.0 - 100.0
  link: string;
  topics: string[];
  otherCompaniesCount: number;
}

export type TimeframeKey =
  | 'thirtyDays'
  | 'threeMonths'
  | 'sixMonths'
  | 'moreThanSixMonths'
  | 'all';

export interface CompanyProblemsByTimeframe {
  thirtyDays: Problem[];
  threeMonths: Problem[];
  sixMonths: Problem[];
  moreThanSixMonths: Problem[];
  all: Problem[];
}

export interface CompanyManifestItem {
  name: string;
  slug: string;
  totalUniqueQuestions: number;
  easy: number;
  medium: number;
  hard: number;
  topTopics: { topic: string; count: number }[];
  availableTimeframes: TimeframeKey[];
  timeframeCounts: Record<TimeframeKey, number>;
}

export interface Manifest {
  totalCompanies: number;
  totalUniqueProblems: number;
  allTopics: { topic: string; count: number }[];
  companies: CompanyManifestItem[];
}

export interface CompanyData {
  name: string;
  slug: string;
  totalUniqueQuestions: number;
  easy: number;
  medium: number;
  hard: number;
  topTopics: { topic: string; count: number }[];
  availableTimeframes: TimeframeKey[];
  timeframeCounts: Record<TimeframeKey, number>;
  problems: CompanyProblemsByTimeframe;
}

export interface CrossCompanyEntry {
  companyName: string;
  companySlug: string;
  frequency: number;
  timeframes: string[];
}

export type CrossCompanyIndex = Record<string, CrossCompanyEntry[]>;

export type ProblemStatus = 'unsolved' | 'solved' | 'attempted' | 'revision';

export interface ProblemUserData {
  status: ProblemStatus;
  bookmarked: boolean;
  notes?: string;
  intuition?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  timeSpentSeconds?: number;
  solvedAt?: number | null; // timestamp ms
  lastAttemptedAt?: number | null; // timestamp ms
}

export interface UserProgressStore {
  version: number;
  updatedAt: string;
  pinnedCompanies: string[]; // company slugs, max 6
  blindMode: boolean;
  theme: 'dark' | 'light';
  dailyStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  problems: Record<string, ProblemUserData>; // problemId -> user data
}

export type PresetFilter = 'all' | 'high-yield' | 'needs-revision' | 'bookmarked' | 'unsolved';
