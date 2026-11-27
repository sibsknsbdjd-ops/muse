'use client';

import { scenarioIds, type ScenarioId } from '@/lib/schemas';
import { cn } from '@/lib/utils';

const LABELS: Record<ScenarioId, { zh: string; descZh: string }> = {
  video: { zh: 'AI 视频生成', descZh: '分镜、时间轴、镜头语言，字段最完整' },
  image: { zh: 'AI 图片生成', descZh: '主体、光线、风格与负面提示词' },
  document: { zh: '文档写作', descZh: '报告、文章、方案的结构化写作要求' },
  trip: { zh: '行程规划', descZh: '逐日行程，区分已订、待选和想法' },
  general: { zh: '通用任务', descZh: '兜底场景，自由描述你的任务' },
};

export function ScenarioPicker({
  value,
  onChange,
}: {
  value: ScenarioId;
  onChange: (s: ScenarioId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {scenarioIds.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'min-h-[44px] rounded-xl border p-4 text-left transition-colors',
            value === id
              ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
              : 'border-neutral-300 hover:border-neutral-500 dark:border-neutral-700',
          )}
        >
          <div className="font-medium">{LABELS[id].zh}</div>
          <div className="mt-1 text-xs opacity-70">{LABELS[id].descZh}</div>
        </button>
      ))}
    </div>
  );
}
