import type { SupabaseClient } from '@supabase/supabase-js';
import type { HistoryEntry } from '@/stores/studio-store';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

interface PromptRow {
  id: string;
  scenario: string;
  zh: string;
  en: string;
  created_at: string;
}

function rowToEntry(row: PromptRow): HistoryEntry {
  return {
    id: row.id,
    scenario: row.scenario as HistoryEntry['scenario'],
    zh: row.zh,
    en: row.en,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/**
 * Merge local and cloud histories by id (cloud wins on conflict),
 * newest first. Pure function, unit-tested.
 */
export function mergeHistories(
  local: HistoryEntry[],
  cloud: HistoryEntry[],
): HistoryEntry[] {
  const byId = new Map<string, HistoryEntry>();
  for (const e of local) byId.set(e.id, e);
  for (const e of cloud) byId.set(e.id, e);
  return [...byId.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export async function fetchCloudPrompts(
  supabase: SupabaseClient,
): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('id, scenario, zh, en, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PromptRow[]).map(rowToEntry);
}

/** Insert one entry into the cloud; returns the stored row id. */
export async function pushPrompt(
  supabase: SupabaseClient,
  userId: string,
  entry: HistoryEntry,
): Promise<string> {
  const row: Record<string, unknown> = {
    user_id: userId,
    scenario: entry.scenario,
    zh: entry.zh,
    en: entry.en,
    created_at: new Date(entry.createdAt).toISOString(),
  };
  if (isUuid(entry.id)) row.id = entry.id;
  const { data, error } = await supabase
    .from('prompts')
    .insert(row)
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function deleteCloudPrompt(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  if (!isUuid(id)) return;
  const { error } = await supabase.from('prompts').delete().eq('id', id);
  if (error) throw error;
}

export async function clearCloudPrompts(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * Full sync on sign-in: upload local-only entries, then merge.
 * Entries whose upload fails stay local and are kept in the merge.
 */
export async function fullSync(
  supabase: SupabaseClient,
  userId: string,
  local: HistoryEntry[],
): Promise<HistoryEntry[]> {
  const cloud = await fetchCloudPrompts(supabase);
  const cloudIds = new Set(cloud.map((e) => e.id));
  const localAfterUpload: HistoryEntry[] = [];

  for (const entry of local) {
    if (cloudIds.has(entry.id)) {
      localAfterUpload.push(entry);
      continue;
    }
    try {
      const newId = await pushPrompt(supabase, userId, entry);
      localAfterUpload.push({ ...entry, id: newId });
    } catch {
      localAfterUpload.push(entry);
    }
  }

  const cloudAfter = await fetchCloudPrompts(supabase).catch(() => cloud);
  return mergeHistories(localAfterUpload, cloudAfter);
}
