import { describe, expect, it } from 'vitest';
import { buildImagePrompt } from '@/lib/builders/image';
import { buildDocumentPrompt } from '@/lib/builders/document';
import { buildTripPrompt } from '@/lib/builders/trip';

describe('buildImagePrompt', () => {
  it('includes spec fields and auto-completes negatives for realistic style', () => {
    const out = buildImagePrompt({
      idea: '校园香樟树下的女生',
      aspectRatio: '9:16',
      style: '写实',
      subject: '白T恤、牛仔裤',
      environment: '大学校园',
      lighting: '午后阳光',
      negativePrompt: '',
    });
    expect(out.zh).toContain('9:16');
    expect(out.zh).toContain('白T恤、牛仔裤');
    expect(out.autoCompleted).toContain('negativePrompt');
    expect(out.en).toContain('no watermark');
  });
});

describe('buildDocumentPrompt', () => {
  it('includes type, audience and the sourcing requirement', () => {
    const out = buildDocumentPrompt({
      idea: '上半年经营复盘',
      docType: '报告',
      audience: '管理层',
      tone: '专业、清晰',
      lengthHint: '',
      mustInclude: '营收数据',
    });
    expect(out.zh).toContain('报告');
    expect(out.zh).toContain('管理层');
    expect(out.zh).toContain('营收数据');
    expect(out.zh).toContain('标明出处');
  });
});

describe('buildTripPrompt', () => {
  it('includes days, destination and the booked/idea separation rule', () => {
    const out = buildTripPrompt({
      idea: '带爸妈慢慢玩',
      destination: '大理',
      days: 5,
      travelers: '三人',
      budgetHint: '',
      interests: '',
      constraints: '不爬山',
    });
    expect(out.zh).toContain('大理');
    expect(out.zh).toContain('5 天');
    expect(out.zh).toContain('不爬山');
    expect(out.en).toContain('day-by-day');
  });
});
