import type { DocumentParams } from '../schemas';
import type { BuiltPrompt } from './video';

/** Assemble a document-writing prompt for Muse. Pure function. */
export function buildDocumentPrompt(params: DocumentParams): BuiltPrompt {
  const zh = [
    `请写一份${params.docType}：${params.idea}`,
    params.audience && `目标读者：${params.audience}`,
    `语气：${params.tone}`,
    params.lengthHint && `篇幅：${params.lengthHint}`,
    params.mustInclude && `必须包含：${params.mustInclude}`,
    '要求：结构清晰，先给提纲再写正文；数据和引用要标明出处；不要编造不存在的事实。',
  ]
    .filter(Boolean)
    .join('\n');

  const en = [
    `Write a ${params.docType}: ${params.idea}`,
    params.audience && `Audience: ${params.audience}`,
    `Tone: ${params.tone}`,
    params.lengthHint && `Length: ${params.lengthHint}`,
    params.mustInclude && `Must include: ${params.mustInclude}`,
    'Requirements: clear structure, outline first then body; cite sources for data and quotes; never fabricate facts.',
  ]
    .filter(Boolean)
    .join('\n');

  return { zh, en, autoCompleted: [] };
}
