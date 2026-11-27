'use client';

import { useRouter } from 'next/navigation';
import { ScenarioPicker } from '@/components/scenario-picker';
import { Button } from '@/components/ui/button';
import { useStudioStore } from '@/stores/studio-store';

const EXAMPLES = [
  '拍一段雨夜江南水乡的散步视频，像手机随手拍',
  '火车从隧道驶出，眼前是雪山和云海',
  '在年货集市里挤着往前走的第一人称视角',
];

export default function HomePage() {
  const router = useRouter();
  const { scenario, setScenario, setVideoParams } = useStudioStore();

  const startWithExample = (idea: string) => {
    setScenario('video');
    setVideoParams({ idea });
    router.push('/studio');
  };

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">一句话想法，变成专业提示词</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          选一个场景，用大白话说出你想要什么，剩下的结构、参数和负面提示词交给这里拼好，再粘贴给 Muse。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">先选场景</h2>
        <ScenarioPicker value={scenario} onChange={setScenario} />
        <Button onClick={() => router.push('/studio')}>开始创作</Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">或者点一个示例试试</h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => startWithExample(ex)}
              className="min-h-[44px] rounded-full border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-500 dark:border-neutral-700"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
