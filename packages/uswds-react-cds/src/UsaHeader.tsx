import React from 'react';
import { FederalBannerMode } from './types.js';

export interface UsaHeaderProps {
  title?: string;
  agency?: string;
  mode?: FederalBannerMode;
  onExit?: () => void;
  className?: string;
}

export const UsaHeader: React.FC<UsaHeaderProps> = ({
  title = 'U.S. Federal Health Workstation',
  agency = 'VA Community Care & Clinical Decision Support Suite',
  mode = 'community-partner',
  onExit,
  className = '',
}) => {
  return (
    <header className={`usa-header usa-header--extended border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${className}`}>
      <div className="usa-navbar flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="usa-logo flex items-center gap-3" id="extended-logo">
          <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-sm" aria-hidden="true">
            PG
          </div>
          <div>
            <em className="usa-logo__text not-italic font-bold text-base text-zinc-900 dark:text-zinc-100 block leading-tight">
              {title}
            </em>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
              {agency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" aria-hidden="true" />
            <span>988 Lifeline &bull; Dial 988, Press 1 for Veterans</span>
          </div>

          <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            🔒 US Domestic Geofence (CONUS)
          </div>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-1 text-xs font-medium rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              Exit Federal View
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
