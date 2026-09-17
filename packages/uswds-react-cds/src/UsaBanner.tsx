import React, { useState } from 'react';
import { FederalBannerMode } from './types.js';

export interface UsaBannerProps {
  mode?: FederalBannerMode;
  onModeChange?: (mode: FederalBannerMode) => void;
  className?: string;
}

export const UsaBanner: React.FC<UsaBannerProps> = ({
  mode = 'community-partner',
  onModeChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className={`usa-banner ${className}`}
      aria-label="Official website identification and statutory legal status"
    >
      <div className="usa-accordion">
        <header className="usa-banner__header">
          <div className="usa-banner__inner">
            <div className="grid-col-auto">
              {mode === 'official-gov' ? (
                <div
                  className="usa-banner__header-flag mr-2 inline-flex items-center text-xs font-semibold text-blue-900 dark:text-blue-200"
                  aria-hidden="true"
                >
                  🇺🇸
                </div>
              ) : (
                <div
                  className="usa-banner__header-flag mr-2 inline-flex items-center text-xs font-semibold text-emerald-800 dark:text-emerald-300"
                  aria-hidden="true"
                >
                  ⚕️
                </div>
              )}
            </div>

            <div className="grid-col-fill tablet:grid-col-auto" aria-hidden="true">
              {mode === 'official-gov' ? (
                <>
                  <p className="usa-banner__header-text text-xs text-zinc-700 dark:text-zinc-300">
                    An official website of the United States government
                  </p>
                  <p className="usa-banner__header-action text-xs text-blue-700 dark:text-blue-400 underline">
                    Here’s how you know
                  </p>
                </>
              ) : (
                <>
                  <p className="usa-banner__header-text text-xs font-medium text-emerald-950 dark:text-emerald-200">
                    Independent Healthcare Practice &bull; Civilian VA Community Care Provider
                  </p>
                  <p className="usa-banner__header-action text-xs text-emerald-700 dark:text-emerald-400 underline">
                    Non-governmental entity (18 U.S.C. § 701 Demarcation)
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              className="usa-accordion__button usa-banner__button text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={isOpen}
              aria-controls="gov-banner-content"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="usa-banner__button-text">
                {isOpen ? 'Close explanation' : "Here's how you know"}
              </span>
            </button>
          </div>
        </header>

        {isOpen && (
          <div
            className="usa-banner__content usa-accordion__content border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300"
            id="gov-banner-content"
          >
            {mode === 'official-gov' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="usa-banner__guidance flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">🏛️</span>
                  <div className="usa-media-block__body">
                    <p>
                      <strong>Official websites use .gov</strong>
                      <br />
                      A <strong>.gov</strong> website belongs to an official government organization in the United States.
                    </p>
                  </div>
                </div>
                <div className="usa-banner__guidance flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">🔒</span>
                  <div className="usa-media-block__body">
                    <p>
                      <strong>Secure .gov websites use HTTPS</strong>
                      <br />
                      A lock icon or <strong>https://</strong> means you’ve safely connected to the .gov website. Share sensitive information only on official, secure websites.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="usa-banner__guidance flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">⚖️</span>
                  <div className="usa-media-block__body">
                    <p>
                      <strong>Non-Governmental Entity (18 U.S.C. § 701)</strong>
                      <br />
                      This workstation is operated by an independent civilian medical provider. It is <strong>NOT</strong> an agency of the federal government, nor does it issue government credentials or impersonate federal officers.
                    </p>
                  </div>
                </div>
                <div className="usa-banner__guidance flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">🎖️</span>
                  <div className="usa-media-block__body">
                    <p>
                      <strong>VA MISSION Act of 2018 (P.L. 115-182)</strong>
                      <br />
                      Authorized to provide clinical care to eligible Veterans via the VA Community Care Network (CCN). Design tokens adhere to open-source USWDS (CC0 1.0 Public Domain) for Veterans&apos; cognitive accessibility.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
