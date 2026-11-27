'use client';

import { useState } from 'react';
import { Button } from './ui/button';

export const FIELD_LABELS: Record<string, string> = {
  negativePrompt: '负面提示词',
  audio: '音频',
  lighting: '光线',
  tone: '语气',
  lengthHint: '篇幅',
  constraints: '限制条件',
  interests: '偏好',
  subject: '主体',
  environment: '环境',
  cameraMovement: '镜头',
};

type Status = 'idle' | 'loading' | 'done' | 'error';

/**
 * Smart completion button.
 * Calls /api/complete with the current field values; the API only returns
 * values for fields that are empty, so user input is never overwritten.
 * On failure everything the user typed stays untouched and retry is offered.
 */
export function SmartComplete({
  scenario,
  getFields,
  apply,
}: {
  scenario: string;
  getFields: () => Record<string, string>;
  apply: (completions: Record<string, string>) => void;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const run = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, fields: getFields() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        completions: Record<string, string>;
        source: 'llm' | 'rules';
      };
      const keys = Object.keys(data.completions);
      if (keys.length === 0) {
        setMessage('没有需要补全的空字段。');
      } else {
        apply(data.completions);
        const names = keys.map((k) => FIELD_LABELS[k] ?? k).join('、');
        setMessage(
          `已补全：${names}${data.source === 'rules' ? '（按最佳实践规则补全）' : ''}，都可以直接改。`,
        );
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setMessage('补全失败，你填的内容都还在，可以重试。');
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-neutral-400 p-3 dark:border-neutral-600">
      <div className="flex items-center gap-3">
        <Button type="button" onClick={run} disabled={status === 'loading'}>
          {status === 'loading' ? '正在补全…' : '智能补全空字段'}
        </Button>
        {status === 'error' && (
          <Button type="button" variant="secondary" onClick={run}>
            重试
          </Button>
        )}
      </div>
      {status === 'loading' && (
        <div className="mt-3 animate-pulse space-y-2" aria-hidden>
          <div className="h-3 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      )}
      {message && (
        <p
          className={`mt-2 text-sm ${status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
