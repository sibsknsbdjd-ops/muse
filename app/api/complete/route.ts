import { NextResponse } from 'next/server';
import { z } from 'zod';
import { completeFields } from '@/lib/ai';

const bodySchema = z.object({
  scenario: z.string(),
  fields: z.record(z.string()),
});

// Simple in-memory rate limit (per process); use a shared store in production.
const hits = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 30;
const WINDOW_MS = 60_000;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(req: Request) {
  const key = req.headers.get('x-forwarded-for') ?? 'local';
  if (rateLimited(key)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  try {
    const result = await completeFields(parsed.data);
    return NextResponse.json(result);
  } catch {
    // Never leak provider errors or keys to the client.
    return NextResponse.json(
      { error: 'Completion failed, please retry' },
      { status: 502 },
    );
  }
}
