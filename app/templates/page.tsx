'use client';

import { useRouter } from 'next/navigation';
import { BUILTIN_TEMPLATES } from '@/templates/builtins';
import { useStudioStore } from '@/stores/studio-store';
import { Button } from '@/components/ui/button';

export default function TemplatesPage() {
  const router = useRouter();
  const { setScenario, setVideoParams } = useStudioStore();

  const apply = (id: string) => {
    const t = BUILTIN_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setScenario(t.scenario);
    if (t.videoParams) {
      setVideoParams({ ...t.videoParams, idea: t.ideaZh ?? '' });
    }
    router.push('/studio');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">模板库</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUILTIN_TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="flex flex-col rounded-xl border border-neutral-300 p-4 dark:border-neutral-700"
          >
            <div className="font-medium">{t.nameZh}</div>
            <p className="mt-1 flex-1 text-sm text-neutral-500">
              {t.descriptionZh}
            </p>
            <Button className="mt-3" variant="secondary" onClick={() => apply(t.id)}>
              套用模板
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
