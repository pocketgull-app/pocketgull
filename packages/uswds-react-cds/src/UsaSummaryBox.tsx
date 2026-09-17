import React from 'react';

export interface UsaSummaryBoxProps {
  heading: string;
  children?: React.ReactNode;
  className?: string;
}

export const UsaSummaryBox: React.FC<UsaSummaryBoxProps> = ({
  heading,
  children,
  className = '',
}) => {
  return (
    <div
      className={`usa-summary-box p-4 rounded-xl border-l-4 border-l-blue-600 border border-zinc-200 dark:border-zinc-800 bg-blue-50/40 dark:bg-blue-950/20 ${className}`}
      role="region"
      aria-labelledby="summary-box-key-information"
    >
      <div className="usa-summary-box__body">
        <h3
          className="usa-summary-box__heading text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2"
          id="summary-box-key-information"
        >
          {heading}
        </h3>
        <div className="usa-summary-box__text text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
};
