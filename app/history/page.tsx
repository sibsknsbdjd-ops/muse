'use client';

import { useStudioStore } from '@/stores/studio-store';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { history, removeHistory, clearHistory } = useStudioStore();

  if (history.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">历史记录</h1>
        <p className="text-neutral-500">
          还没有保存过提示词。在创作页点“保存到历史”，这里就能找到、复用和删除。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">历史记录</h1>
        <Button variant="ghost" onClick={clearHistory}>
          清空全部
        </Button>
      </div>
      {history.map((h) => (
        <div
          key={h.id}
          className="rounded-xl border border-neutral-300 p-4 dark:border-neutral-700"
        >
          <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
            <span>
              {h.scenario} · {new Date(h.createdAt).toLocaleString()}
            </span>
            <Button variant="ghost" onClick={() => removeHistory(h.id)}>
              删除
            </Button>
          </div>
          <pre className="whitespace-pre-wrap text-sm">{h.zh}</pre>
          <Button
            className="mt-3"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(h.zh)}
          >
            复制中文版
          </Button>
        </div>
      ))}
    </div>
  );
}
