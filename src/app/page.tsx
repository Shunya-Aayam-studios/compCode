'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { CompanyHeader } from '@/components/CompanyHeader';
import { TimeframeSwitcher } from '@/components/TimeframeSwitcher';
import { SmartPresetsBar } from '@/components/SmartPresetsBar';
import { ProblemTable } from '@/components/ProblemTable';
import { MockInterviewTimer } from '@/components/MockInterviewTimer';
import { RevisionDrawer } from '@/components/RevisionDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { MultiCompanyOverlapModal } from '@/components/MultiCompanyOverlapModal';
import { ImportExportModal } from '@/components/ImportExportModal';

function MainWorkspace() {
  const { isLoadingManifest, isLoadingCompany } = useApp();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] dark:bg-[#09090b] light:bg-zinc-50">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Company Prep Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
          {isLoadingManifest ? (
            <div className="flex-1 flex items-center justify-center py-24 text-zinc-500 text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <span>Loading DSA Orbit local indexes...</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Company Intelligence Header */}
              <CompanyHeader />

              {/* Timeframe & Filters Section */}
              <div className="p-4 sm:p-6 space-y-4 max-w-7xl w-full mx-auto">
                {/* Timeframe Switcher Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TimeframeSwitcher />
                </div>

                {/* Smart Presets, Blind Mode, Difficulty, Search */}
                <SmartPresetsBar />

                {/* Main Problem Table */}
                <ProblemTable />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Mock Interview Timer */}
      <MockInterviewTimer />

      {/* Slide-Over Revision & Notes Drawer */}
      <RevisionDrawer />

      {/* Global Raycast-style Command Palette (Cmd + K) */}
      <CommandPalette />

      {/* Multi-Company Overlap Modal */}
      <MultiCompanyOverlapModal />

      {/* Local Data Backup & Transfer Modal */}
      <ImportExportModal />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainWorkspace />
    </AppProvider>
  );
}
