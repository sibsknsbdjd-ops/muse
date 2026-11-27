/**
 * Muse's known generation capabilities.
 * The preview uses this to warn when a prompt asks for something
 * Muse cannot actually deliver (why: avoid prompts that promise the impossible).
 */
export const MUSE_CAPABILITIES = {
  video: {
    /** Each generated clip is roughly this long, in seconds. */
    clipSeconds: 10,
    /** Delivered file resolution per aspect ratio. */
    resolutions: {
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '1:1': { width: 720, height: 720 },
    } as const,
    frameRate: 24,
    /** Longer videos are generated in segments and stitched losslessly. */
    longerVideoStrategy: 'segment-and-stitch',
  },
} as const;

export type AspectRatio = keyof typeof MUSE_CAPABILITIES.video.resolutions;

export interface CapabilityWarning {
  code: 'duration-over-one-clip' | 'resolution-over-delivered';
  zh: string;
  en: string;
}

/** Return warnings for video parameters that exceed what Muse delivers. */
export function checkVideoCapabilities(params: {
  durationSeconds: number;
  aspectRatio: AspectRatio;
  requestedResolution?: string;
}): CapabilityWarning[] {
  const warnings: CapabilityWarning[] = [];
  const { clipSeconds, resolutions } = MUSE_CAPABILITIES.video;

  if (params.durationSeconds > clipSeconds) {
    const segments = Math.ceil(params.durationSeconds / clipSeconds);
    warnings.push({
      code: 'duration-over-one-clip',
      zh: `单段视频约 ${clipSeconds} 秒，${params.durationSeconds} 秒需要分 ${segments} 段生成后无损拼接，提示词里应写清每段的衔接点。`,
      en: `Each clip is ~${clipSeconds}s. A ${params.durationSeconds}s video needs ${segments} segments stitched losslessly, so the prompt should specify how segments connect.`,
    });
  }

  if (params.requestedResolution) {
    const delivered = resolutions[params.aspectRatio];
    warnings.push({
      code: 'resolution-over-delivered',
      zh: `成品文件实际为 ${delivered.width}×${delivered.height}（720p）。提示词里写 ${params.requestedResolution} 只能让画面更清晰细腻，不会改变成品分辨率。`,
      en: `Delivered files are ${delivered.width}×${delivered.height} (720p). Writing ${params.requestedResolution} in the prompt only steers rendering detail, not the delivered resolution.`,
    });
  }

  return warnings;
}
