import React, { useState } from 'react';
import { MedicalNexusOpinion, FederalBannerMode } from './types.js';

export interface VaNexusOpinionCardProps {
  opinion: MedicalNexusOpinion;
  mode?: FederalBannerMode;
  onCopy?: () => void;
  className?: string;
}

export const VaNexusOpinionCard: React.FC<VaNexusOpinionCardProps> = ({
  opinion,
  mode = 'community-partner',
  onCopy,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `VA MEDICAL NEXUS STATEMENT (38 CFR § 4.87 / 38 U.S.C. § 1119 PACT Act)
Condition: ${opinion.condition}
Statutory Finding: ${opinion.serviceConnectionLikelihood}
Evidence: ${opinion.objectiveEvidence.join('; ')}
Clinical Rationale: ${opinion.rationale}
Integrity Seal: SHA256:${opinion.sha256Attestation}`;

    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onCopy?.();
    }).catch(() => {});
  };

  return (
    <div className={`p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm print:border-zinc-300 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              VA Disability Rating & Medical Nexus Opinion
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              38 CFR § 4.87
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Objective evidentiary finding for the Board of Veterans&apos; Appeals (BVA) & Regional Office
          </p>
        </div>

        <button
          type="button"
          id="btn-copy-nexus-statement"
          onClick={handleCopy}
          className="print:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:ring-2 focus:ring-blue-500"
        >
          {copied ? '✓ Copied to Clipboard' : '📋 Copy Nexus Statement'}
        </button>
      </div>

      <div className="mt-3 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
        <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
          <span className="font-bold text-blue-950 dark:text-blue-200 block mb-1">
            Statutory Evidentiary Standard:
          </span>
          <p className="font-medium text-blue-900 dark:text-blue-300">
            {opinion.serviceConnectionLikelihood}
          </p>
        </div>

        <div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
            Objective Diagnostic Corroboration:
          </span>
          <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
            {opinion.objectiveEvidence.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
            Medical Rationale & Toxic Inhalation Nexus:
          </span>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-wrap-pretty">
            {opinion.rationale}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
          <span>Part 11 Seal: SHA256:{opinion.sha256Attestation}</span>
          <span className="hidden sm:inline">
            {mode === 'official-gov' ? 'VA Form 21-0960 Grounded' : 'Civilian CCN Record'}
          </span>
        </div>
      </div>
    </div>
  );
};
