import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Cloud history sync endpoint (skeleton).
 * Guests keep history in localStorage; once Supabase Auth is wired,
 * this route will read/write the prompts table scoped by user_id.
 */
const bodySchema = z.object({
  scenario: z.string(),
  zh: z.string(),
  en: z.string(),
});

export async function GET() {
  return NextResponse.json({
    prompts: [],
    note: 'Cloud sync not configured yet; history is stored locally.',
  });
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  return NextResponse.json(
    { saved: false, note: 'Cloud sync not configured yet.' },
    { status: 501 },
  );
}
