'use client';

import { useEffect, useRef } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { fullSync } from '@/lib/sync';
import { useStudioStore } from '@/stores/studio-store';

/**
 * Invisible component: whenever a user is signed in, sync history with the
 * cloud (upload local-only entries, merge cloud ones in). Guests keep
 * localStorage-only history.
 */
export function SyncManager() {
  const running = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const run = async (userId: string) => {
      if (running.current) return;
      running.current = true;
      try {
        const local = useStudioStore.getState().history;
        const merged = await fullSync(supabase, userId, local);
        useStudioStore.getState().setHistory(merged);
      } catch {
        // Sync failure must never break the app; local history still works.
      } finally {
        running.current = false;
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) void run(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void run(session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
