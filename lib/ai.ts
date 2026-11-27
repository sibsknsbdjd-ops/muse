/**
 * LLM access layer (server-side only).
 * Kept behind an interface so the model/provider can be switched via env vars
 * without touching callers. At skeleton stage it returns rule-based completions
 * when no API key is configured.
 */

export interface CompletionRequest {
  scenario: string;
  fields: Record<string, string>;
}

export interface CompletionResult {
  /** field name -> completed value */
  completions: Record<string, string>;
  source: 'llm' | 'rules';
}

export async function completeFields(
  req: CompletionRequest,
): Promise<CompletionResult> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    // Rule-based fallback so the flow works end-to-end without a key.
    return { completions: {}, source: 'rules' };
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
            'You complete missing fields of a prompt-generation form. Reply with a JSON object mapping field names to completed values only.',
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
  const completions = JSON.parse(data.choices[0].message.content) as Record<
    string,
    string
  >;
  return { completions, source: 'llm' };
}
