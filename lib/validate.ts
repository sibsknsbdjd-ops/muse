import type { Shot } from './schemas';

export interface TimelineIssue {
  shotIndex: number;
  code: 'gap' | 'overlap' | 'end-before-start' | 'total-mismatch';
  zh: string;
  en: string;
}

/**
 * Validate a shot timeline: segments must be continuous, non-overlapping,
 * and sum to the target duration. Pure function, unit-tested.
 */
export function validateTimeline(
  shots: Shot[],
  targetDuration: number,
): TimelineIssue[] {
  const issues: TimelineIssue[] = [];
  const sorted = [...shots].sort((a, b) => a.start - b.start);
  const EPS = 0.001;

  sorted.forEach((shot, i) => {
    if (shot.end <= shot.start) {
      issues.push({
        shotIndex: i,
        code: 'end-before-start',
        zh: `第 ${i + 1} 段结束时间必须大于开始时间。`,
        en: `Segment ${i + 1}: end time must be after start time.`,
      });
      return;
    }
    if (i === 0) {
      if (Math.abs(shot.start) > EPS) {
        issues.push({
          shotIndex: 0,
          code: 'gap',
          zh: `第一段应从 0 秒开始，当前是 ${shot.start} 秒。`,
          en: `The first segment should start at 0s, currently ${shot.start}s.`,
        });
      }
      return;
    }
    const prev = sorted[i - 1];
    if (shot.start - prev.end > EPS) {
      issues.push({
        shotIndex: i,
        code: 'gap',
        zh: `第 ${i + 1} 段与上一段之间有 ${round(shot.start - prev.end)} 秒空档，建议把开始时间改为 ${prev.end}。`,
        en: `Segment ${i + 1} leaves a ${round(shot.start - prev.end)}s gap after the previous one; set its start to ${prev.end}.`,
      });
    } else if (prev.end - shot.start > EPS) {
      issues.push({
        shotIndex: i,
        code: 'overlap',
        zh: `第 ${i + 1} 段与上一段重叠了 ${round(prev.end - shot.start)} 秒，建议把开始时间改为 ${prev.end}。`,
        en: `Segment ${i + 1} overlaps the previous one by ${round(prev.end - shot.start)}s; set its start to ${prev.end}.`,
      });
    }
  });

  if (sorted.length > 0) {
    const total = sorted[sorted.length - 1].end;
    if (Math.abs(total - targetDuration) > EPS) {
      issues.push({
        shotIndex: sorted.length - 1,
        code: 'total-mismatch',
        zh: `分镜总时长是 ${round(total)} 秒，与目标 ${targetDuration} 秒不一致。`,
        en: `Shots total ${round(total)}s, which does not match the ${targetDuration}s target.`,
      });
    }
  }

  return issues;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
