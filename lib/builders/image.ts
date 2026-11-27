import type { ImageParams } from '../schemas';
import { DEFAULT_NEGATIVES } from '../defaults';
import type { BuiltPrompt } from './video';

/** Assemble an image prompt for Muse. Pure function. */
export function buildImagePrompt(params: ImageParams): BuiltPrompt {
  const autoCompleted: string[] = [];
  let negativeZh = params.negativePrompt;
  let negativeEn = params.negativePrompt;
  if (!negativeZh && params.style === '写实') {
    negativeZh = DEFAULT_NEGATIVES.realisticImage.zh;
    negativeEn = DEFAULT_NEGATIVES.realisticImage.en;
    autoCompleted.push('negativePrompt');
  }

  const zh = [
    `${params.aspectRatio}，${params.style}风格。`,
    params.idea,
    params.subject && `主体：${params.subject}`,
    params.environment && `环境：${params.environment}`,
    params.lighting && `光线：${params.lighting}`,
    negativeZh && `负面提示词：${negativeZh}`,
  ]
    .filter(Boolean)
    .join('\n');

  const en = [
    `${params.aspectRatio}, ${params.style} style.`,
    params.idea,
    params.subject && `Subject: ${params.subject}`,
    params.environment && `Environment: ${params.environment}`,
    params.lighting && `Lighting: ${params.lighting}`,
    negativeEn && `Negative prompt: ${negativeEn}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { zh, en, autoCompleted };
}
