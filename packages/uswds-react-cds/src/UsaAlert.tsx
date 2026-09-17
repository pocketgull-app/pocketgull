import React from 'react';
import { AlertType } from './types.js';

export interface UsaAlertProps {
  type?: AlertType;
  heading?: string;
  children?: React.ReactNode;
  slim?: boolean;
  className?: string;
}

export const UsaAlert: React.FC<UsaAlertProps> = ({
  type = 'info',
  heading,
  children,
  slim = false,
  className = '',
}) => {
  const borderColors: Record<AlertType, string> = {
    info: 'border-l-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200',
    warning: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200',
    error: 'border-l-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-950 dark:text-red-200',
    success: 'border-l-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200',
  };

  const icons: Record<AlertType, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🛑',
    success: '✅',
  };

  return (
    <div
      className={`usa-alert usa-alert--${type} border-l-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 ${borderColors[type]} ${className}`}
      role={type === 'error' ? 'alert' : 'region'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base" aria-hidden="true">
          {icons[type]}
        </span>
        <div className="usa-alert__body flex-1 text-xs">
          {heading && (
            <h4 className="usa-alert__heading font-bold mb-1">
              {heading}
            </h4>
          )}
          <div className="usa-alert__text leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
