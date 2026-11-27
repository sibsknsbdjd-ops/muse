import { describe, expect, it } from 'vitest';
import { ruleCompletions } from '@/lib/ai';

describe('ruleCompletions', () => {
  it('completes video negative prompt, audio and lighting when empty', () => {
    const out = ruleCompletions({
      scenario: 'video',
      fields: { style: '写实', negativePrompt: '', audio: '', lighting: '' },
    });
    expect(out.negativePrompt).toContain('无水印');
    expect(out.audio).toBeTruthy();
    expect(out.lighting).toBeTruthy();
  });

  it('never completes a field the user already filled', () => {
    const out = ruleCompletions({
      scenario: 'video',
      fields: {
        style: '写实',
        negativePrompt: '不要下雨',
        audio: '只要风声',
        lighting: '黄昏逆光',
      },
    });
    expect(out).toEqual({});
  });

  it('does not add the realistic negative prompt for non-realistic styles', () => {
    const out = ruleCompletions({
      scenario: 'video',
      fields: { style: '电影感', negativePrompt: '', audio: 'x', lighting: 'x' },
    });
    expect(out.negativePrompt).toBeUndefined();
  });

  it('completes trip constraints and interests', () => {
    const out = ruleCompletions({
      scenario: 'trip',
      fields: { constraints: '', interests: '' },
    });
    expect(out.constraints).toBeTruthy();
    expect(out.interests).toBeTruthy();
  });

  it('completes document length hint but keeps a user tone', () => {
    const out = ruleCompletions({
      scenario: 'document',
      fields: { tone: '亲切、口语化', lengthHint: '' },
    });
    expect(out.tone).toBeUndefined();
    expect(out.lengthHint).toBeTruthy();
  });
});
