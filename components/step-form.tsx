'use client';

import { Button } from './ui/button';

/**
 * Step-by-step form shell: progress bar, back/next, per-step validation.
 * The studio page supplies the steps; this component only handles navigation.
 */
export function StepForm({
  steps,
  current,
  onStepChange,
  canNext,
  nextHint,
}: {
  steps: { title: string; content: React.ReactNode }[];
  current: number;
  onStepChange: (n: number) => void;
  canNext: boolean;
  nextHint?: string;
}) {
  const isLast = current === steps.length - 1;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>
          第 {current + 1} / {steps.length} 步：{steps[current].title}
        </span>
        <span className="text-neutral-500">
          {Math.round(((current + 1) / steps.length) * 100)}%
        </span>
      </div>
      <div className="mb-4 h-2 rounded bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-2 rounded bg-neutral-900 transition-all dark:bg-white"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div>{steps[current].content}</div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={current === 0}
          onClick={() => onStepChange(current - 1)}
        >
          上一步
        </Button>
        {!isLast && (
          <Button
            type="button"
            disabled={!canNext}
            onClick={() => onStepChange(current + 1)}
          >
            下一步
          </Button>
        )}
        {!canNext && nextHint && (
          <span className="text-sm text-red-600 dark:text-red-400">{nextHint}</span>
        )}
      </div>
    </div>
  );
}
