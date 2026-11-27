import { describe, expect, it } from 'vitest';
import { checkVideoCapabilities } from '@/lib/capabilities';

describe('checkVideoCapabilities', () => {
  it('warns when duration exceeds one clip', () => {
    const w = checkVideoCapabilities({ durationSeconds: 25, aspectRatio: '16:9' });
    expect(w.some((x) => x.code === 'duration-over-one-clip')).toBe(true);
    expect(w[0].zh).toContain('3 段');
  });

  it('warns when a resolution above delivery is requested', () => {
    const w = checkVideoCapabilities({
      durationSeconds: 10,
      aspectRatio: '9:16',
      requestedResolution: '4K',
    });
    expect(w.some((x) => x.code === 'resolution-over-delivered')).toBe(true);
    expect(w[0].zh).toContain('720×1280');
  });

  it('stays silent for a plain 10s clip', () => {
    expect(
      checkVideoCapabilities({ durationSeconds: 10, aspectRatio: '16:9' }),
    ).toEqual([]);
  });
});
