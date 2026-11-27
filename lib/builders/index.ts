import type { ScenarioId } from '../schemas';
import { buildVideoPrompt, type BuiltPrompt } from './video';
import { buildImagePrompt } from './image';
import { buildDocumentPrompt } from './document';
import { buildTripPrompt } from './trip';
import { buildGeneralPrompt } from './general';

export type { BuiltPrompt };

/**
 * Dispatch to the scenario builder. Params are cast per scenario;
 * callers validate with the matching Zod schema first.
 */
export function buildPrompt(
  scenario: ScenarioId,
  params: Record<string, unknown>,
): BuiltPrompt {
  switch (scenario) {
    case 'video':
      return buildVideoPrompt(params as never);
    case 'image':
      return buildImagePrompt(params as never);
    case 'document':
      return buildDocumentPrompt(params as never);
    case 'trip':
      return buildTripPrompt(params as never);
    case 'general':
      return buildGeneralPrompt(params as never);
  }
}
