import { describe, expect, it } from 'vitest';
import { validateTimeline } from '@/lib/validate';
import type { Shot } from '@/lib/schemas';

const shot = (start: number, end: number): Shot => ({
  start,
  end,
  camera: '',
  content: 'x',
});

describe('validateTimeline', () => {
  it('accepts a continuous timeline that sums to the target', () => {
    expect(validateTimeline([shot(0, 4), shot(4, 10)], 10)).toEqual([]);
  });

  it('flags a gap between segments', () => {
    const issues = validateTimeline([shot(0, 4), shot(5, 10)], 10);
    expect(issues.some((i) => i.code === 'gap')).toBe(true);
  });

  it('flags an overlap between segments', () => {
    const issues = validateTimeline([shot(0, 5), shot(4, 10)], 10);
    expect(issues.some((i) => i.code === 'overlap')).toBe(true);
  });

  it('flags a total that does not match the target duration', () => {
    const issues = validateTimeline([shot(0, 4), shot(4, 8)], 10);
    expect(issues.some((i) => i.code === 'total-mismatch')).toBe(true);
  });

  it('flags end before start', () => {
    const issues = validateTimeline([shot(3, 2)], 10);
    expect(issues.some((i) => i.code === 'end-before-start')).toBe(true);
  });

  it('returns no issues for an empty timeline', () => {
    expect(validateTimeline([], 10)).toEqual([]);
  });
});
