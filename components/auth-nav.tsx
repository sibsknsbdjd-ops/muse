'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

/** Nav-side auth state: login link for guests, email + sign-out for users. */
export function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (!isSupabaseConfigured()) {
    return <span className="text-neutral-400">未配置云端</span>;
  }

  if (!user) {
    return (
      <Link href="/login" className="font-medium">
        登录
      </Link>
    );
  }

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <span className="flex items-center gap-3">
      <span className="max-w-40 truncate text-neutral-500">{user.email}</span>
      <button type="button" onClick={signOut} className="font-medium">
        退出
      </button>
    </span>
  );
}
