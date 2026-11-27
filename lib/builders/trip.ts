import type { TripParams } from '../schemas';
import type { BuiltPrompt } from './video';

/** Assemble a trip-planning prompt for Muse. Pure function. */
export function buildTripPrompt(params: TripParams): BuiltPrompt {
  const zh = [
    `请帮我规划一次旅行：${params.idea}`,
    params.destination && `目的地：${params.destination}`,
    `天数：${params.days} 天`,
    params.travelers && `同行：${params.travelers}`,
    params.budgetHint && `预算：${params.budgetHint}`,
    params.interests && `偏好：${params.interests}`,
    params.constraints && `限制条件：${params.constraints}`,
    '要求：给出逐日行程，把已预订、待选择和只是想法分开标注；交通衔接要留出合理时间；价格和班次以可查证的信息为准，查不到的要说明。',
  ]
    .filter(Boolean)
    .join('\n');

  const en = [
    `Plan a trip for me: ${params.idea}`,
    params.destination && `Destination: ${params.destination}`,
    `Duration: ${params.days} days`,
    params.travelers && `Travelers: ${params.travelers}`,
    params.budgetHint && `Budget: ${params.budgetHint}`,
    params.interests && `Interests: ${params.interests}`,
    params.constraints && `Constraints: ${params.constraints}`,
    'Requirements: day-by-day itinerary; clearly separate booked items, options to choose, and mere ideas; leave realistic transfer time; prices and schedules must be verifiable, and say so when they cannot be checked.',
  ]
    .filter(Boolean)
    .join('\n');

  return { zh, en, autoCompleted: [] };
}
