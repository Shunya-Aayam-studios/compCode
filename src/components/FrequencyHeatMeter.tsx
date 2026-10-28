'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FrequencyHeatMeterProps {
  frequency: number;
}

export const FrequencyHeatMeter: React.FC<FrequencyHeatMeterProps> = ({ frequency }) => {
  // Determine how many bars out of 5 to fill
  // 0 - 20: 1 bar
  // 21 - 40: 2 bars
  // 41 - 60: 3 bars
  // 61 - 80: 4 bars
  // 81 - 100: 5 bars
  let filledBars = 1;
  if (frequency >= 80) filledBars = 5;
  else if (frequency >= 60) filledBars = 4;
  else if (frequency >= 40) filledBars = 3;
  else if (frequency >= 20) filledBars = 2;

  // Color scheme based on frequency intensity
  let activeColor = 'bg-zinc-400';
  let textColor = 'text-zinc-400';

  if (frequency >= 80) {
    activeColor = 'bg-amber-400';
    textColor = 'text-amber-400 font-semibold';
  } else if (frequency >= 60) {
    activeColor = 'bg-orange-400';
    textColor = 'text-orange-400';
  } else if (frequency >= 40) {
    activeColor = 'bg-indigo-400';
    textColor = 'text-indigo-400';
  } else if (frequency >= 20) {
    activeColor = 'bg-blue-400';
    textColor = 'text-blue-400';
  }

  return (
    <div className="flex items-center gap-2">
      {/* 5-bar signal indicator */}
      <div className="flex items-end gap-0.5 h-3.5 w-6" title={`Frequency: ${frequency.toFixed(1)}%`}>
        {[1, 2, 3, 4, 5].map(barIndex => {
          const isFilled = barIndex <= filledBars;
          const heightPercent = barIndex * 20; // 20%, 40%, 60%, 80%, 100%
          return (
            <div
              key={barIndex}
              style={{ height: `${heightPercent}%` }}
              className={cn(
                'w-1 rounded-xs transition-all duration-300',
                isFilled
                  ? activeColor
                  : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-300'
              )}
            />
          );
        })}
      </div>

      {/* Numeric score */}
      <span className={cn('text-xs font-mono', textColor)}>
        {frequency.toFixed(1)}%
      </span>
    </div>
  );
};
