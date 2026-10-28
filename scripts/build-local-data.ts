import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface Problem {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  frequency: number;
  acceptanceRate: number;
  link: string;
  topics: string[];
  otherCompaniesCount: number;
}

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
  availableTimeframes: string[];
  timeframeCounts: Record<string, number>;
}

export interface Manifest {
  totalCompanies: number;
  totalUniqueProblems: number;
  allTopics: { topic: string; count: number }[];
  companies: CompanyManifestItem[];
}

export interface CrossCompanyEntry {
  companyName: string;
  companySlug: string;
  frequency: number;
  timeframes: string[];
}

const TIMEFRAME_MAP: Record<string, keyof CompanyProblemsByTimeframe> = {
  '1. Thirty Days.csv': 'thirtyDays',
  '2. Three Months.csv': 'threeMonths',
  '3. Six Months.csv': 'sixMonths',
  '4. More Than Six Months.csv': 'moreThanSixMonths',
  '5. All.csv': 'all',
};

const TIMEFRAME_ORDER: (keyof CompanyProblemsByTimeframe)[] = [
  'thirtyDays',
  'threeMonths',
  'sixMonths',
  'moreThanSixMonths',
  'all',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeAcceptanceRate(raw: any): number {
  if (typeof raw === 'string') {
    raw = parseFloat(raw.replace('%', '').trim());
  }
  if (typeof raw !== 'number' || isNaN(raw)) return 50.0;
  let val = raw;
  if (val > 0 && val <= 0.01) {
    val = val * 10000;
  } else if (val > 0.01 && val <= 1.0) {
    val = val * 100;
  }
  return Math.max(0, Math.min(100, Math.round(val * 10) / 10));
}

function normalizeDifficulty(diff: any): 'EASY' | 'MEDIUM' | 'HARD' {
  const d = String(diff || '').trim().toUpperCase();
  if (d === 'EASY' || d === 'MEDIUM' || d === 'HARD') return d;
  return 'MEDIUM';
}

function normalizeFrequency(freq: any): number {
  const f = typeof freq === 'number' ? freq : parseFloat(String(freq || '0').trim());
  if (isNaN(f)) return 0;
  return Math.max(0, Math.min(100, Math.round(f * 10) / 10));
}

function parseTopics(topicsRaw: any): string[] {
  if (!topicsRaw) return [];
  if (Array.isArray(topicsRaw)) return topicsRaw.map(String).map(s => s.trim()).filter(Boolean);
  return String(topicsRaw)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function extractProblemId(link: string, title: string): string {
  const m = String(link || '').match(/problems\/([^/?#]+)/);
  if (m && m[1]) return m[1].trim();
  return slugify(title);
}

async function buildLocalData() {
  const datasetDir = path.resolve(process.cwd(), 'dataset');
  const outDataDir = path.resolve(process.cwd(), 'public/data');
  const outCompaniesDir = path.resolve(outDataDir, 'companies');

  if (!fs.existsSync(datasetDir)) {
    console.error(`Error: dataset directory not found at ${datasetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outCompaniesDir, { recursive: true });

  const companyEntries = fs.readdirSync(datasetDir, { withFileTypes: true });
  const companyDirs = companyEntries
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b));

  console.log(`Found ${companyDirs.length} company directories in ./dataset`);

  // Global Cross-Company Index: problemSlug -> Map<companySlug, CrossCompanyEntry>
  const crossCompanyMap = new Map<string, Map<string, CrossCompanyEntry>>();
  const globalTopicCounts = new Map<string, number>();
  const globalUniqueProblems = new Set<string>();

  // Intermediate storage for companies
  const processedCompanies: Array<{
    name: string;
    slug: string;
    uniqueProblems: Map<string, Problem>;
    timeframeProblems: Record<keyof CompanyProblemsByTimeframe, Problem[]>;
    topicCounts: Map<string, number>;
  }> = [];

  // PASS 1: Read all CSV files per company
  for (const companyName of companyDirs) {
    const companyDir = path.join(datasetDir, companyName);
    const companySlug = slugify(companyName);

    const timeframeProblems: Record<keyof CompanyProblemsByTimeframe, Problem[]> = {
      thirtyDays: [],
      threeMonths: [],
      sixMonths: [],
      moreThanSixMonths: [],
      all: [],
    };

    const uniqueProblems = new Map<string, Problem>();
    const topicCounts = new Map<string, number>();

    const files = fs.readdirSync(companyDir);
    for (const file of files) {
      const timeframeKey = TIMEFRAME_MAP[file];
      if (!timeframeKey) continue;

      const filePath = path.join(companyDir, file);
      const csvContent = fs.readFileSync(filePath, 'utf-8');

      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
      });

      for (const row of parsed.data as any[]) {
        const title = String(row['Title'] || '').trim();
        if (!title) continue;

        const link = String(row['Link'] || '').trim();
        const id = extractProblemId(link, title);
        const difficulty = normalizeDifficulty(row['Difficulty']);
        const frequency = normalizeFrequency(row['Frequency']);
        const acceptanceRate = normalizeAcceptanceRate(row['Acceptance Rate']);
        const topics = parseTopics(row['Topics']);

        const problem: Problem = {
          id,
          title,
          difficulty,
          frequency,
          acceptanceRate,
          link: link || `https://leetcode.com/problems/${id}/`,
          topics,
          otherCompaniesCount: 0, // will be populated in Pass 2
        };

        timeframeProblems[timeframeKey].push(problem);

        // Keep highest frequency or newest info in unique map
        if (!uniqueProblems.has(id)) {
          uniqueProblems.set(id, problem);
        } else {
          const existing = uniqueProblems.get(id)!;
          if (problem.frequency > existing.frequency) {
            existing.frequency = problem.frequency;
          }
        }

        globalUniqueProblems.add(id);

        // Update cross-company tracking
        if (!crossCompanyMap.has(id)) {
          crossCompanyMap.set(id, new Map());
        }
        const companyEntryMap = crossCompanyMap.get(id)!;
        if (!companyEntryMap.has(companySlug)) {
          companyEntryMap.set(companySlug, {
            companyName,
            companySlug,
            frequency: problem.frequency,
            timeframes: [timeframeKey],
          });
        } else {
          const entry = companyEntryMap.get(companySlug)!;
          if (!entry.timeframes.includes(timeframeKey)) {
            entry.timeframes.push(timeframeKey);
          }
          if (problem.frequency > entry.frequency) {
            entry.frequency = problem.frequency;
          }
        }
      }
    }

    // Sort timeframe problem lists by frequency descending
    for (const key of TIMEFRAME_ORDER) {
      timeframeProblems[key].sort((a, b) => b.frequency - a.frequency);
    }

    // Count topics for this company based on unique problems
    for (const prob of uniqueProblems.values()) {
      for (const t of prob.topics) {
        topicCounts.set(t, (topicCounts.get(t) || 0) + 1);
        globalTopicCounts.set(t, (globalTopicCounts.get(t) || 0) + 1);
      }
    }

    processedCompanies.push({
      name: companyName,
      slug: companySlug,
      uniqueProblems,
      timeframeProblems,
      topicCounts,
    });
  }

  // PASS 2: Assign otherCompaniesCount and generate company JSON files
  const manifestCompanies: CompanyManifestItem[] = [];

  for (const comp of processedCompanies) {
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    for (const prob of comp.uniqueProblems.values()) {
      if (prob.difficulty === 'EASY') easyCount++;
      else if (prob.difficulty === 'MEDIUM') mediumCount++;
      else if (prob.difficulty === 'HARD') hardCount++;
    }

    // Update otherCompaniesCount on all problems
    for (const tfKey of TIMEFRAME_ORDER) {
      for (const prob of comp.timeframeProblems[tfKey]) {
        const companyEntries = crossCompanyMap.get(prob.id);
        const count = companyEntries ? companyEntries.size - 1 : 0;
        prob.otherCompaniesCount = Math.max(0, count);
      }
    }

    const availableTimeframes = TIMEFRAME_ORDER.filter(
      key => comp.timeframeProblems[key].length > 0
    );

    const timeframeCounts: Record<string, number> = {};
    for (const key of TIMEFRAME_ORDER) {
      timeframeCounts[key] = comp.timeframeProblems[key].length;
    }

    const topTopics = Array.from(comp.topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const companyManifestItem: CompanyManifestItem = {
      name: comp.name,
      slug: comp.slug,
      totalUniqueQuestions: comp.uniqueProblems.size,
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
      topTopics,
      availableTimeframes,
      timeframeCounts,
    };

    manifestCompanies.push(companyManifestItem);

    // Save individual company file
    const companyFileContent = {
      name: comp.name,
      slug: comp.slug,
      totalUniqueQuestions: comp.uniqueProblems.size,
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
      topTopics,
      availableTimeframes,
      timeframeCounts,
      problems: comp.timeframeProblems,
    };

    const outPath = path.join(outCompaniesDir, `${comp.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(companyFileContent), 'utf-8');
  }

  // Sort manifest companies by total unique questions descending
  manifestCompanies.sort((a, b) => b.totalUniqueQuestions - a.totalUniqueQuestions);

  const allTopicsSorted = Array.from(globalTopicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  const manifest: Manifest = {
    totalCompanies: manifestCompanies.length,
    totalUniqueProblems: globalUniqueProblems.size,
    allTopics: allTopicsSorted,
    companies: manifestCompanies,
  };

  fs.writeFileSync(
    path.join(outDataDir, 'manifest.json'),
    JSON.stringify(manifest),
    'utf-8'
  );

  // Convert crossCompanyMap to plain object
  // problemSlug -> Array<{ companyName, companySlug, frequency, timeframes }>
  const crossCompanyIndex: Record<string, CrossCompanyEntry[]> = {};
  for (const [probId, map] of crossCompanyMap.entries()) {
    const list = Array.from(map.values()).sort((a, b) => b.frequency - a.frequency);
    crossCompanyIndex[probId] = list;
  }

  fs.writeFileSync(
    path.join(outDataDir, 'cross-company-index.json'),
    JSON.stringify(crossCompanyIndex),
    'utf-8'
  );

  console.log(`\nLocal Data Generation Complete!`);
  console.log(`- Manifest saved to public/data/manifest.json (${manifestCompanies.length} companies)`);
  console.log(`- Total unique problems indexed: ${globalUniqueProblems.size}`);
  console.log(`- Company JSON files generated in public/data/companies/ (${manifestCompanies.length} files)`);
  console.log(`- Cross-company index saved to public/data/cross-company-index.json (${Object.keys(crossCompanyIndex).length} problems)`);
}

buildLocalData().catch(err => {
  console.error('Fatal error building local data:', err);
  process.exit(1);
});
