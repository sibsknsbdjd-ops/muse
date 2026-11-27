import { DEFAULT_NEGATIVES } from './defaults';

/**
 * LLM access layer (server-side only).
 * Kept behind an interface so the model/provider can be switched via env vars
 * without touching callers. When no API key is configured it falls back to
 * rule-based completions so the flow still works end-to-end.
 */

export interface CompletionRequest {
  scenario: string;
  /** Current field values; only empty fields get completed. */
  fields: Record<string, string>;
}

export interface CompletionResult {
  /** field name -> completed value (only fields that were empty) */
  completions: Record<string, string>;
  source: 'llm' | 'rules';
}

/** Rule-based best-practice completions, used when no LLM key is configured. */
export function ruleCompletions(req: CompletionRequest): Record<string, string> {
  const f = req.fields;
  const out: Record<string, string> = {};
  const empty = (k: string) => !f[k] || f[k].trim() === '';

  if (req.scenario === 'video') {
    if (empty('negativePrompt') && (f.style === '写实' || !f.style)) {
      out.negativePrompt = DEFAULT_NEGATIVES.realisticVideo.zh;
    }
    if (empty('audio')) {
      out.audio = '保留环境底噪，无旁白；音乐风格与画面节奏匹配';
    }
    if (empty('lighting')) {
      out.lighting = '自然光，光线柔和均匀，阴影边缘不生硬';
    }
  }

  if (req.scenario === 'image') {
    if (empty('negativePrompt') && (f.style === '写实' || !f.style)) {
      out.negativePrompt = DEFAULT_NEGATIVES.realisticImage.zh;
    }
    if (empty('lighting')) {
      out.lighting = '自然光，柔和均匀，保留真实的皮肤和材质纹理';
    }
  }

  if (req.scenario === 'document') {
    if (empty('tone')) out.tone = '专业、清晰';
    if (empty('lengthHint')) out.lengthHint = '1500 字左右，可按结构适当增减';
  }

  if (req.scenario === 'trip') {
    if (empty('constraints')) {
      out.constraints = '每天行程不要排太满，留出休息和机动时间';
    }
    if (empty('interests')) {
      out.interests = '当地特色美食、有代表性的景点、慢慢逛的街区';
    }
  }

  return out;
}

export async function completeFields(
  req: CompletionRequest,
): Promise<CompletionResult> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return { completions: ruleCompletions(req), source: 'rules' };
  }

  const baseUrl = process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL ?? 'gpt-4o-mini';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You complete missing fields of a prompt-generation form. Only fill fields that are empty in the input. Reply with a JSON object mapping field names to completed values only.',
        },
        { role: 'user', content: JSON.stringify(req) },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  const raw = JSON.parse(data.choices[0].message.content) as Record<
    string,
    string
  >;
  // Never overwrite values the user already typed.
  const completions: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!req.fields[k] || req.fields[k].trim() === '') completions[k] = v;
  }
  return { completions, source: 'llm' };
}
