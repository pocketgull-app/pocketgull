import React from 'react';
import { StepItem } from './types.js';

export interface UsaStepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  steps: StepItem[];
  headingText?: string;
  className?: string;
}

export const UsaStepIndicator: React.FC<UsaStepIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  headingText = 'Intake & Triage Progress',
  className = '',
}) => {
  const actualTotal = totalSteps ?? steps.length;

  return (
    <div className={`usa-step-indicator ${className}`} aria-label="progress">
      <ol className="usa-step-indicator__segments flex list-none p-0 m-0 gap-2 mb-3">
        {steps.map((step) => {
          const isComplete = step.status === 'complete';
          const isCurrent = step.status === 'current';

          return (
            <li
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-colors ${
                isComplete
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : isCurrent
                  ? 'bg-blue-400 dark:bg-blue-400 ring-2 ring-blue-500/30'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="sr-only">
                Step {step.id}: {step.label} {isComplete ? '(completed)' : isCurrent ? '(current)' : '(incomplete)'}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="usa-step-indicator__header flex items-baseline gap-2">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Step {currentStep} of {actualTotal}:
        </span>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 m-0">
          {headingText}
        </h4>
      </div>
    </div>
  );
};
