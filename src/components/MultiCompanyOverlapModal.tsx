'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Problem, CompanyData } from '@/types';
import { DIFFICULTY_CONFIG, cn } from '@/lib/utils';
import {
  X,
  Layers,
  Building2,
  ExternalLink,
  Plus,
  Trash2,
  Shuffle,
  CheckCircle2,
  Flame,
  ArrowUpDown,
} from 'lucide-react';

interface OverlapProblem {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  link: string;
  topics: string[];
  companyFrequencies: Record<string, number>; // slug -> frequency
  combinedFrequency: number;
}

export const MultiCompanyOverlapModal: React.FC = () => {
  const {
    isOverlapModalOpen,
    setIsOverlapModalOpen,
    manifest,
    openDrawer,
    activeCompanySlug,
  } = useApp();

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([
    activeCompanySlug || 'amazon',
    'google',
  ]);
  const [companyDataMap, setCompanyDataMap] = useState<Record<string, CompanyData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch company data for selected slugs if not already loaded
  useEffect(() => {
    if (!isOverlapModalOpen) return;

    async function loadSelected() {
      setIsLoading(true);
      const toFetch = selectedSlugs.filter(s => !companyDataMap[s]);
      if (toFetch.length === 0) {
        setIsLoading(false);
        return;
      }

      const newMap = { ...companyDataMap };
      await Promise.all(
        toFetch.map(async slug => {
          try {
            const res = await fetch(`/data/companies/${slug}.json`);
            if (res.ok) {
              const data: CompanyData = await res.json();
              newMap[slug] = data;
            }
          } catch (err) {
            console.error('Failed to load company for overlap:', err);
          }
        })
      );
      setCompanyDataMap(newMap);
      setIsLoading(false);
    }

    loadSelected();
  }, [selectedSlugs, isOverlapModalOpen]);

  // Add company to comparison (max 3)
  const addCompany = (slug: string) => {
    if (selectedSlugs.includes(slug)) return;
    if (selectedSlugs.length >= 3) {
      setSelectedSlugs([selectedSlugs[0], selectedSlugs[1], slug]);
    } else {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const removeCompany = (slug: string) => {
    if (selectedSlugs.length <= 2) return; // keep at least 2
    setSelectedSlugs(selectedSlugs.filter(s => s !== slug));
  };

  // Compute common problems across all selected companies
  const overlapProblems = useMemo<OverlapProblem[]>(() => {
    if (selectedSlugs.length < 2) return [];

    // Verify all selected company datas are loaded
    for (const slug of selectedSlugs) {
      if (!companyDataMap[slug]) return [];
    }

    // Map: problemId -> Map<companySlug, Problem>
    const problemCompanyMap = new Map<string, Map<string, Problem>>();

    for (const slug of selectedSlugs) {
      const comp = companyDataMap[slug];
      const problems = comp.problems.all || [];

      for (const p of problems) {
        if (!problemCompanyMap.has(p.id)) {
          problemCompanyMap.set(p.id, new Map());
        }
        problemCompanyMap.get(p.id)!.set(slug, p);
      }
    }

    // Filter to only problems present in ALL selected companies
    const common: OverlapProblem[] = [];

    for (const [probId, cMap] of problemCompanyMap.entries()) {
      if (cMap.size === selectedSlugs.length) {
        // Asked in all selected companies!
        let totalFreq = 0;
        const companyFrequencies: Record<string, number> = {};
        let sampleProblem: Problem | null = null;

        for (const slug of selectedSlugs) {
          const p = cMap.get(slug)!;
          sampleProblem = p;
          companyFrequencies[slug] = p.frequency;
          totalFreq += p.frequency;
        }

        if (sampleProblem) {
          common.push({
            id: probId,
            title: sampleProblem.title,
            difficulty: sampleProblem.difficulty,
            link: sampleProblem.link,
            topics: sampleProblem.topics,
            companyFrequencies,
            combinedFrequency: Math.round((totalFreq / selectedSlugs.length) * 10) / 10,
          });
        }
      }
    }

    // Sort by combined frequency descending
    common.sort((a, b) => b.combinedFrequency - a.combinedFrequency);

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return common.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.topics.some(t => t.toLowerCase().includes(q))
      );
    }

    return common;
  }, [selectedSlugs, companyDataMap, searchFilter]);

  if (!isOverlapModalOpen) return null;

  const allCompanies = manifest?.companies || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOverlapModalOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-zinc-800 bg-[#101014] text-zinc-100 shadow-2xl flex flex-col z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Multi-Company Overlap Radar</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Identify high-leverage questions asked across 2 to 3 target companies
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOverlapModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Companies Selector Bar */}
        <div className="p-4 border-b border-zinc-800 bg-[#0d0d10] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Comparing:
            </span>

            {selectedSlugs.map((slug, idx) => {
              const comp = allCompanies.find(c => c.slug === slug);
              return (
                <div
                  key={slug}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-300 text-xs font-medium"
                >
                  <Building2 className="h-3 w-3" />
                  <span>{comp ? comp.name : slug}</span>
                  {selectedSlugs.length > 2 && (
                    <button
                      onClick={() => removeCompany(slug)}
                      className="ml-1 hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Dropdown to add 3rd company */}
            {selectedSlugs.length < 3 && (
              <select
                onChange={e => {
                  if (e.target.value) addCompany(e.target.value);
                  e.target.value = '';
                }}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add 3rd Company
                </option>
                {allCompanies
                  .filter(c => !selectedSlugs.includes(c.slug))
                  .slice(0, 50)
                  .map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.totalUniqueQuestions} Qs)
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {overlapProblems.length} Common Questions
            </span>
          </div>
        </div>

        {/* Filter Input */}
        <div className="px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/40">
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter common questions by title or topic..."
            className="w-full text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Overlap Problems Table */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center text-zinc-500 text-xs animate-pulse">
              Calculating company overlap index...
            </div>
          ) : overlapProblems.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              No common questions found between the selected companies matching filter.
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                    <th className="py-2.5 px-3">Question</th>
                    <th className="py-2.5 px-3 w-24">Difficulty</th>
                    <th className="py-2.5 px-3 w-28">Avg Freq</th>
                    {selectedSlugs.map(slug => {
                      const comp = allCompanies.find(c => c.slug === slug);
                      return (
                        <th key={slug} className="py-2.5 px-3 w-28 truncate">
                          {comp ? comp.name : slug}
                        </th>
                      );
                    })}
                    <th className="py-2.5 px-3 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {overlapProblems.slice(0, 100).map(prob => {
                    const diffConfig = DIFFICULTY_CONFIG[prob.difficulty];
                    return (
                      <tr
                        key={prob.id}
                        className="hover:bg-zinc-900/50 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-zinc-200 hover:text-violet-400">
                            {prob.title}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prob.topics.slice(0, 2).map(t => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase',
                              diffConfig.badgeClass
                            )}
                          >
                            {prob.difficulty}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-mono font-semibold text-amber-400">
                            {prob.combinedFrequency.toFixed(1)}%
                          </span>
                        </td>

                        {selectedSlugs.map(slug => (
                          <td key={slug} className="py-2.5 px-3 font-mono text-zinc-400">
                            {(prob.companyFrequencies[slug] || 0).toFixed(1)}%
                          </td>
                        ))}

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={prob.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-violet-400"
                              title="Open on LeetCode"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-500">
          <span>Showing top common questions across selected companies</span>
          <button
            onClick={() => setIsOverlapModalOpen(false)}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
