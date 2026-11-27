import { describe, expect, it } from 'vitest';
import { buildVideoPrompt } from '@/lib/builders/video';
import { buildGeneralPrompt } from '@/lib/builders/general';
import { videoParamsSchema } from '@/lib/schemas';

const base = videoParamsSchema.parse({
  idea: '火车出隧道看见雪山云海',
  durationSeconds: 10,
  aspectRatio: '16:9',
  style: '写实',
  subject: '',
  environment: '',
  lighting: '',
  cameraMovement: '',
  shots: [],
  audio: '',
  negativePrompt: '',
});

describe('buildVideoPrompt', () => {
  it('includes duration, aspect ratio and the idea in both languages', () => {
    const out = buildVideoPrompt(base);
    expect(out.zh).toContain('10秒');
    expect(out.zh).toContain('16:9');
    expect(out.zh).toContain('火车出隧道看见雪山云海');
    expect(out.en).toContain('10s');
    expect(out.en).toContain('photorealistic');
  });

  it('auto-completes the negative prompt for realistic style and marks it', () => {
    const out = buildVideoPrompt(base);
    expect(out.autoCompleted).toContain('negativePrompt');
    expect(out.zh).toContain('无水印');
    expect(out.en).toContain('no watermark');
  });

  it('does not override a user-provided negative prompt', () => {
    const out = buildVideoPrompt({ ...base, negativePrompt: '不要下雨' });
    expect(out.autoCompleted).not.toContain('negativePrompt');
    expect(out.zh).toContain('不要下雨');
  });

  it('renders shots with their time ranges', () => {
    const out = buildVideoPrompt({
      ...base,
      shots: [{ start: 0, end: 10, camera: '固定机位', content: '隧道驶出' }],
    });
    expect(out.zh).toContain('0–10秒');
    expect(out.zh).toContain('隧道驶出');
    expect(out.en).toContain('Shot 1');
  });
});

describe('buildGeneralPrompt', () => {
  it('always appends the working requirements', () => {
    const out = buildGeneralPrompt({
      idea: '帮我整理一份清单',
      context: '',
      outputFormat: '',
      constraints: '',
    });
    expect(out.zh).toContain('帮我整理一份清单');
    expect(out.zh).toContain('查证');
    expect(out.en).toContain('verify key facts');
  });
});
