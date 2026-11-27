'use client';

import { useStudioStore } from '@/stores/studio-store';
import { Button } from '@/components/ui/button';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { clearCloudPrompts, deleteCloudPrompt } from '@/lib/sync';

/** Delete/clear locally first (instant UI), then mirror to the cloud. */
async function withCloud(fn: (supabase: ReturnType<typeof createClient>, userId: string) => Promise<void>) {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    try {
      await fn(supabase, data.user.id);
    } catch {
      // Cloud mirror failed; next full sync will reconcile deletions
      // only for entries still present locally, so a failed cloud delete
      // may reappear after re-login. Local state stays authoritative here.
    }
  }
}

export default function HistoryPage() {
  const { history, removeHistory, clearHistory } = useStudioStore();

  const remove = (id: string) => {
    removeHistory(id);
    void withCloud((supabase) => deleteCloudPrompt(supabase, id));
  };

  const clear = () => {
    clearHistory();
    void withCloud((supabase, userId) => clearCloudPrompts(supabase, userId));
  };

  if (history.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">历史记录</h1>
        <p className="text-neutral-500">
          还没有保存过提示词。在创作页点“保存到历史”，这里就能找到、复用和删除。登录后会自动同步到云端。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">历史记录</h1>
        <Button variant="ghost" onClick={clear}>
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
            <Button variant="ghost" onClick={() => remove(h.id)}>
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
