import type { GeneralParams } from '../schemas';
import type { BuiltPrompt } from './video';

/** Assemble a general-task prompt for Muse. Pure function. */
export function buildGeneralPrompt(params: GeneralParams): BuiltPrompt {
  const zh = [
    params.idea,
    params.context && `背景：${params.context}`,
    params.outputFormat && `期望产出：${params.outputFormat}`,
    params.constraints && `限制条件：${params.constraints}`,
    '要求：先确认你对任务的理解再动手；关键事实要查证后再写；做完说明结果和未解决的问题。',
  ]
    .filter(Boolean)
    .join('\n');

  const en = [
    params.idea,
    params.context && `Context: ${params.context}`,
    params.outputFormat && `Expected output: ${params.outputFormat}`,
    params.constraints && `Constraints: ${params.constraints}`,
    'Requirements: confirm your understanding of the task before starting; verify key facts before stating them; when done, report the result and anything left unresolved.',
  ]
    .filter(Boolean)
    .join('\n');

  return { zh, en, autoCompleted: [] };
}
