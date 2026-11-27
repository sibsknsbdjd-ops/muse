import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Cloud history API backed by Supabase.
 * Every query is scoped to the signed-in user; RLS enforces the same
 * rule at the database level. Guests get 401 and keep local history.
 */

const bodySchema = z.object({
  scenario: z.string(),
  zh: z.string(),
  en: z.string(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('prompts')
    .select('id, scenario, zh, en, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
  return NextResponse.json({ prompts: data });
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('prompts')
    .insert({ user_id: user.id, ...parsed.data })
    .select('id, scenario, zh, en, created_at')
    .single();
  if (error) {
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
  return NextResponse.json({ prompt: data }, { status: 201 });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
