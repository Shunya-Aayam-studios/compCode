'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileJson,
  RotateCcw,
} from 'lucide-react';

export const ImportExportModal: React.FC = () => {
  const {
    isImportExportOpen,
    setIsImportExportOpen,
    userStore,
    exportData,
    importData,
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportExportOpen) return null;

  const totalTrackedProblems = Object.keys(userStore.problems).length;
  const totalSolved = Object.values(userStore.problems).filter(
    p => p.status === 'solved'
  ).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      const res = importData(content);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Progress backup imported and applied successfully!',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to parse JSON backup file.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!importJsonText.trim()) return;
    const res = importData(importJsonText);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'Progress backup imported and applied successfully!',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to parse JSON backup.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsImportExportOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121215] text-zinc-100 shadow-2xl flex flex-col z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Local Progress Backup & Transfer
              </h2>
              <p className="text-xs text-zinc-400">
                100% offline local storage — backup or restore your state anytime
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsImportExportOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current State Stats */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-base font-bold font-mono text-emerald-400">
              {totalSolved}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase">Solved</div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-base font-bold font-mono text-zinc-200">
              {totalTrackedProblems}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase">Tracked</div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-base font-bold font-mono text-amber-400">
              {userStore.dailyStreak}d
            </div>
            <div className="text-[10px] text-zinc-500 uppercase">Streak</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {feedback && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Export Action */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-200">
                Export Progress to JSON
              </div>
              <div className="text-[11px] text-zinc-400">
                Download a clean JSON backup file containing all notes, status flags, and streaks
              </div>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/40 bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer flex-shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Action */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-200">
                  Import Progress from JSON
                </div>
                <div className="text-[11px] text-zinc-400">
                  Select a backup file or paste JSON contents below
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer flex-shrink-0"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            <textarea
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Or paste JSON backup content here..."
              rows={3}
              className="w-full text-xs font-mono rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />

            {importJsonText && (
              <button
                onClick={handleManualImport}
                className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
              >
                Apply Pasted JSON Backup
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            onClick={() => setIsImportExportOpen(false)}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
