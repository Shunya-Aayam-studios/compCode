'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CrossCompanyEntry } from '@/types';
import { Building2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrossCompanyPopoverProps {
  problemId: string;
  currentCompanySlug: string;
  count: number;
}

export const CrossCompanyPopover: React.FC<CrossCompanyPopoverProps> = ({
  problemId,
  currentCompanySlug,
  count,
}) => {
  const { getCrossCompanyEntries, selectCompany } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<CrossCompanyEntry[]>([]);

  const handleMouseEnter = () => {
    const list = getCrossCompanyEntries(problemId).filter(
      e => e.companySlug !== currentCompanySlug
    );
    setEntries(list);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  if (count <= 0) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={e => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-800/80 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700/60 transition-colors cursor-pointer"
        title="View other companies asking this problem"
      >
        <span>+{count} {count === 1 ? 'co.' : 'cos.'}</span>
      </button>

      {/* Popover / Tooltip */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-zinc-700/80 bg-[#16161a] p-3 shadow-xl backdrop-blur-md text-left select-none animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-violet-400" />
              <span>Other Target Companies</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Total {count}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {entries.length === 0 ? (
              <div className="text-[11px] text-zinc-500 py-1">
                Loading cross-company data...
              </div>
            ) : (
              entries.slice(0, 10).map(entry => (
                <div
                  key={entry.companySlug}
                  onClick={e => {
                    e.stopPropagation();
                    selectCompany(entry.companySlug);
                    setIsOpen(false);
                  }}
                  className="group flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-4 h-4 rounded bg-zinc-800 group-hover:bg-violet-600/30 text-[9px] font-bold text-zinc-400 group-hover:text-violet-300 flex items-center justify-center font-mono">
                      {entry.companyName.charAt(0)}
                    </span>
                    <span className="text-xs text-zinc-300 group-hover:text-white truncate">
                      {entry.companyName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-amber-400 flex-shrink-0">
                    {entry.frequency}% freq
                  </span>
                </div>
              ))
            )}
            {entries.length > 10 && (
              <div className="text-[10px] text-zinc-500 text-center pt-1 font-mono">
                +{entries.length - 10} more companies
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
