'use client';

import { useState } from 'react';
import type { BuiltPrompt } from '@/lib/builders';
import { Button } from './ui/button';

/** Live preview with zh/en tabs, copy and .md export. */
export function PromptPreview({
  built,
  scenario,
}: {
  built: BuiltPrompt;
  scenario: string;
}) {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [toast, setToast] = useState('');
  const text = lang === 'zh' ? built.zh : built.en;

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setToast('已复制，去粘贴给 Muse 吧');
    setTimeout(() => setToast(''), 2500);
  };

  const exportMd = () => {
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muse-prompt-${scenario}-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-neutral-300 dark:border-neutral-700">
      <div className="flex items-center gap-2 border-b border-neutral-200 p-3 dark:border-neutral-800">
        <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700">
          {(['zh', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`min-h-[36px] px-3 text-sm ${lang === l ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : ''}`}
            >
              {l === 'zh' ? '中文' : 'English'}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="secondary" onClick={copy}>
            复制
          </Button>
          <Button type="button" variant="ghost" onClick={exportMd}>
            导出 .md
          </Button>
        </div>
      </div>
      {built.autoCompleted.length > 0 && (
        <p className="border-b border-neutral-200 px-3 py-2 text-xs text-neutral-500 dark:border-neutral-800">
          已按最佳实践自动补全：{built.autoCompleted.join('、')}（可在表单里改）
        </p>
      )}
      <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap p-4 text-sm leading-relaxed">
        {text || '先在左侧填下你的想法，这里会实时生成提示词。'}
      </pre>
      {toast && (
        <div className="border-t border-neutral-200 px-3 py-2 text-sm text-green-700 dark:border-neutral-800 dark:text-green-400">
          {toast}
        </div>
      )}
    </div>
  );
}
