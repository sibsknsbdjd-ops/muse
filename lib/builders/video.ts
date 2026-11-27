import type { VideoParams } from '../schemas';
import { DEFAULT_NEGATIVES } from '../defaults';

export interface BuiltPrompt {
  zh: string;
  en: string;
  /** Keys of sections that were auto-completed from defaults. */
  autoCompleted: string[];
}

const STYLE_EN: Record<string, string> = {
  写实: 'photorealistic',
  电影感: 'cinematic',
  纪录片: 'documentary',
};

/** Assemble a video prompt for Muse from validated params. Pure function. */
export function buildVideoPrompt(params: VideoParams): BuiltPrompt {
  const autoCompleted: string[] = [];

  let negativeZh = params.negativePrompt;
  let negativeEn = params.negativePrompt;
  if (!negativeZh && params.style === '写实') {
    negativeZh = DEFAULT_NEGATIVES.realisticVideo.zh;
    negativeEn = DEFAULT_NEGATIVES.realisticVideo.en;
    autoCompleted.push('negativePrompt');
  }

  const styleEn = STYLE_EN[params.style] ?? params.style;

  const shotsZh = params.shots
    .map(
      (s, i) =>
        `镜头${i + 1}｜${s.start}–${s.end}秒${s.camera ? `｜${s.camera}` : ''}：${s.content}`,
    )
    .join('\n');
  const shotsEn = params.shots
    .map(
      (s, i) =>
        `Shot ${i + 1} | ${s.start}-${s.end}s${s.camera ? ` | ${s.camera}` : ''}: ${s.content}`,
    )
    .join('\n');

  const zh = [
    `${params.durationSeconds}秒，${params.aspectRatio}，${params.style}风格。`,
    params.idea,
    params.subject && `主体：${params.subject}`,
    params.environment && `环境：${params.environment}`,
    params.lighting && `光线：${params.lighting}`,
    params.cameraMovement && `镜头：${params.cameraMovement}`,
    shotsZh && `分镜：\n${shotsZh}`,
    params.audio && `音频：${params.audio}`,
    negativeZh && `负面提示词：${negativeZh}`,
  ]
    .filter(Boolean)
    .join('\n');

  const en = [
    `${params.durationSeconds}s, ${params.aspectRatio}, ${styleEn} style.`,
    params.idea,
    params.subject && `Subject: ${params.subject}`,
    params.environment && `Environment: ${params.environment}`,
    params.lighting && `Lighting: ${params.lighting}`,
    params.cameraMovement && `Camera: ${params.cameraMovement}`,
    shotsEn && `Shots:\n${shotsEn}`,
    params.audio && `Audio: ${params.audio}`,
    negativeEn && `Negative prompt: ${negativeEn}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { zh, en, autoCompleted };
}
