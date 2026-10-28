'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Building2, BookOpen, Dna, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaletteTab = 'all' | 'companies' | 'problems' | 'topics';

interface PaletteItem {
  id: string;
  type: 'company' | 'problem' | 'topic';
  title: string;
  subtitle: string;
  badge?: string;
  payload: any;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    manifest,
    selectCompany,
    setSelectedTopic,
    openDrawer,
    crossCompanyIndex,
    loadCrossCompanyIndex,
  } = useApp();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<PaletteTab>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      loadCrossCompanyIndex();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen, loadCrossCompanyIndex]);

  // Compute matched items
  const items = useMemo<PaletteItem[]>(() => {
    if (!manifest) return [];
    const q = query.toLowerCase().trim();
    const result: PaletteItem[] = [];

    // 1. Companies
    if (activeTab === 'all' || activeTab === 'companies') {
      const matchedCompanies = manifest.companies
        .filter(c => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q))
        .slice(0, activeTab === 'companies' ? 25 : 8)
        .map(c => ({
          id: `comp-${c.slug}`,
          type: 'company' as const,
          title: c.name,
          subtitle: `${c.totalUniqueQuestions} questions • ${c.easy}E / ${c.medium}M / ${c.hard}H`,
          badge: 'Company',
          payload: c.slug,
        }));
      result.push(...matchedCompanies);
    }

    // 2. DSA Topics
    if (activeTab === 'all' || activeTab === 'topics') {
      const matchedTopics = manifest.allTopics
        .filter(t => !q || t.topic.toLowerCase().includes(q))
        .slice(0, activeTab === 'topics' ? 25 : 6)
        .map(t => ({
          id: `topic-${t.topic}`,
          type: 'topic' as const,
          title: t.topic,
          subtitle: `Appears across ${t.count.toLocaleString()} company question sets`,
          badge: 'Topic DNA',
          payload: t.topic,
        }));
      result.push(...matchedTopics);
    }

    // 3. LeetCode Problems (from crossCompanyIndex if query is present)
    if (q && (activeTab === 'all' || activeTab === 'problems') && crossCompanyIndex) {
      const matchedProblems: PaletteItem[] = [];
      for (const [probId, companies] of Object.entries(crossCompanyIndex)) {
        const formattedTitle = probId
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        if (probId.includes(q) || formattedTitle.toLowerCase().includes(q)) {
          const topCompanyNames = companies
            .slice(0, 3)
            .map(c => c.companyName)
            .join(', ');

          matchedProblems.push({
            id: `prob-${probId}`,
            type: 'problem' as const,
            title: formattedTitle,
            subtitle: `Asked at ${companies.length} companies (${topCompanyNames}${
              companies.length > 3 ? '...' : ''
            })`,
            badge: `${companies.length} Companies`,
            payload: {
              id: probId,
              title: formattedTitle,
              difficulty: 'MEDIUM', // placeholder
              frequency: companies[0]?.frequency || 50,
              acceptanceRate: 50,
              link: `https://leetcode.com/problems/${probId}/`,
              topics: [],
              otherCompaniesCount: Math.max(0, companies.length - 1),
            },
          });
        }
        if (matchedProblems.length >= (activeTab === 'problems' ? 25 : 8)) break;
      }
      result.push(...matchedProblems);
    }

    return result;
  }, [manifest, query, activeTab, crossCompanyIndex]);

  // Adjust selection bounds
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = items[selectedIndex];
      if (current) {
        executeItem(current);
      }
    }
  };

  const executeItem = (item: PaletteItem) => {
    if (item.type === 'company') {
      selectCompany(item.payload);
      setIsCommandPaletteOpen(false);
    } else if (item.type === 'topic') {
      setSelectedTopic(item.payload);
      setIsCommandPaletteOpen(false);
    } else if (item.type === 'problem') {
      openDrawer(item.payload);
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCommandPaletteOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Palette Modal */}
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] text-zinc-100 shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/40">
          <Search className="h-5 w-5 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type to search companies, problems, or DSA topics..."
            className="flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-700/60 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-800/80 bg-[#0d0d10] text-xs">
          {(['all', 'companies', 'problems', 'topics'] as PaletteTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedIndex(0);
              }}
              className={cn(
                'px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer',
                activeTab === tab
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              let Icon = Building2;
              if (item.type === 'topic') Icon = Dna;
              if (item.type === 'problem') Icon = BookOpen;

              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'group flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-violet-600/15 border border-violet-500/30 text-white'
                      : 'hover:bg-zinc-900/60 text-zinc-300 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-violet-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="truncate">
                      <div className="text-sm font-medium truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-violet-400">
                        <span>Select</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-950/60 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 font-mono text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-[10px]">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-[10px]">esc</kbd>
              <span>close</span>
            </span>
          </div>

          <span className="font-mono">{items.length} items</span>
        </div>
      </div>
    </div>
  );
};
