'use client';

import type { Shot } from '@/lib/schemas';
import { validateTimeline } from '@/lib/validate';
import { Button } from './ui/button';

/**
 * Visual shot-list editor for the video scenario.
 * Validates continuity, overlap and total duration as the user edits.
 */
export function ShotEditor({
  shots,
  targetDuration,
  onChange,
}: {
  shots: Shot[];
  targetDuration: number;
  onChange: (shots: Shot[]) => void;
}) {
  const issues = validateTimeline(shots, targetDuration);

  const update = (i: number, patch: Partial<Shot>) =>
    onChange(shots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const add = () => {
    const lastEnd = shots.length ? shots[shots.length - 1].end : 0;
    onChange([
      ...shots,
      { start: lastEnd, end: Math.min(lastEnd + 2, targetDuration), camera: '', content: '' },
    ]);
  };

  const remove = (i: number) => onChange(shots.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {shots.map((shot, i) => (
        <div key={i} className="rounded-xl border border-neutral-300 p-3 dark:border-neutral-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">镜头 {i + 1}</span>
            <label className="text-xs">
              开始
              <input
                type="number"
                step="0.1"
                min="0"
                value={shot.start}
                onChange={(e) => update(i, { start: Number(e.target.value) })}
                className="ml-1 w-20 rounded border px-2 py-1 dark:bg-neutral-900"
              />
            </label>
            <label className="text-xs">
              结束
              <input
                type="number"
                step="0.1"
                min="0"
                value={shot.end}
                onChange={(e) => update(i, { end: Number(e.target.value) })}
                className="ml-1 w-20 rounded border px-2 py-1 dark:bg-neutral-900"
              />
            </label>
            <input
              value={shot.camera}
              onChange={(e) => update(i, { camera: e.target.value })}
              placeholder="机位，如：低机位仰拍"
              className="min-w-40 flex-1 rounded border px-2 py-1 text-sm dark:bg-neutral-900"
            />
            <Button type="button" variant="ghost" onClick={() => remove(i)}>
              删除
            </Button>
          </div>
          <textarea
            value={shot.content}
            onChange={(e) => update(i, { content: e.target.value })}
            placeholder="这一段画面发生什么"
            rows={2}
            className="mt-2 w-full rounded border px-2 py-1 text-sm dark:bg-neutral-900"
          />
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={add}>
        + 添加分镜
      </Button>

      {issues.length > 0 && (
        <ul className="list-disc space-y-1 rounded-xl border border-red-300 bg-red-50 p-3 pl-8 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {issues.map((issue, i) => (
            <li key={i}>{issue.zh}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
