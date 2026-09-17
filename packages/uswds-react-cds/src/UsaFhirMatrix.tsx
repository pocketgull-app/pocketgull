import React, { useState } from 'react';
import { FhirRow } from './types.js';

export interface UsaFhirMatrixProps {
  rows: FhirRow[];
  onExportJson?: () => void;
  className?: string;
}

export const UsaFhirMatrix: React.FC<UsaFhirMatrixProps> = ({
  rows,
  onExportJson,
  className = '',
}) => {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            FHIR US Core R4 Interoperability Matrix
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Standardized HL7 FHIR US Core Implementation Guide (v3.1.1 / ONC HTI-1) mapping
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            {showJson ? 'View Structured Table' : 'View Raw JSON'}
          </button>
          {onExportJson && (
            <button
              type="button"
              onClick={onExportJson}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Export FHIR Bundle
            </button>
          )}
        </div>
      </div>

      {showJson ? (
        <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto max-h-96 border border-zinc-800">
          {JSON.stringify(
            {
              resourceType: 'Bundle',
              type: 'collection',
              timestamp: new Date().toISOString(),
              entry: rows.map((r) => ({
                resource: {
                  resourceType: r.resourceType,
                  meta: { profile: [r.profile] },
                  code: {
                    coding: [{ system: r.codingSystem, code: r.code, display: r.value }],
                  },
                },
              })),
            },
            null,
            2
          )}
        </pre>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <table className="usa-table w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                <th className="p-3 font-semibold">Resource Type</th>
                <th className="p-3 font-semibold">US Core Profile</th>
                <th className="p-3 font-semibold">Element / Target</th>
                <th className="p-3 font-semibold">Standard Value</th>
                <th className="p-3 font-semibold">Terminology & Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="p-3 font-mono font-medium text-blue-700 dark:text-blue-400">
                    {row.resourceType}
                  </td>
                  <td className="p-3 font-mono text-zinc-500 dark:text-zinc-400">
                    {row.profile}
                  </td>
                  <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {row.element}
                  </td>
                  <td className="p-3 text-zinc-700 dark:text-zinc-300">
                    <span className="inline-block px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-medium">
                      {row.value}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                    {row.codingSystem} <span className="font-bold text-zinc-800 dark:text-zinc-200">{row.code}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
