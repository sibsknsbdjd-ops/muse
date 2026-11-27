/**
 * Best-practice defaults used by smart completion.
 * Items added from here are marked in the UI so users can remove them.
 */
export const DEFAULT_NEGATIVES = {
  realisticVideo: {
    zh: '无文字、无水印、无塑料质感、无AI感、禁止美颜滤镜、禁止慢动作',
    en: 'no text, no watermark, no plastic look, no AI feel, no beauty filter, no slow motion',
  },
  realisticImage: {
    zh: '无文字、无水印、无塑料质感、禁止过度磨皮',
    en: 'no text, no watermark, no plastic look, no over-smoothed skin',
  },
} as const;
