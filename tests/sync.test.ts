import { describe, expect, it } from 'vitest';
import { isUuid, mergeHistories } from '@/lib/sync';
import type { HistoryEntry } from '@/stores/studio-store';

const entry = (id: string, createdAt: number, zh = 'x'): HistoryEntry => ({
  id,
  scenario: 'video',
  zh,
  en: 'x',
  createdAt,
});

const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';
const U3 = '33333333-3333-4333-8333-333333333333';

describe('isUuid', () => {
  it('accepts real uuids and rejects timestamp ids', () => {
    expect(isUuid(U1)).toBe(true);
    expect(isUuid('1732800000000')).toBe(false);
    expect(isUuid('abc')).toBe(false);
  });
});

describe('mergeHistories', () => {
  it('unions local and cloud entries, newest first', () => {
    const merged = mergeHistories(
      [entry(U1, 100)],
      [entry(U2, 300), entry(U3, 200)],
    );
    expect(merged.map((e) => e.id)).toEqual([U2, U3, U1]);
  });

  it('cloud wins when the same id exists in both', () => {
    const merged = mergeHistories(
      [entry(U1, 100, 'local')],
      [entry(U1, 100, 'cloud')],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].zh).toBe('cloud');
  });

  it('handles empty inputs', () => {
    expect(mergeHistories([], [])).toEqual([]);
    expect(mergeHistories([entry(U1, 1)], [])).toHaveLength(1);
  });
});
