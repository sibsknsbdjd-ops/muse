'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const inputCls =
  'w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md space-y-3">
        <h1 className="text-xl font-bold">登录</h1>
        <p className="text-neutral-500">
          云端还没有配置（缺少 Supabase 环境变量），暂时只能以访客模式使用，历史保存在本机。
        </p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const supabase = createClient();
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push('/studio');
          router.refresh();
        } else {
          setMessage(
            '注册成功。请去邮箱点确认链接后再登录；如果想免确认，可在 Supabase 后台 Authentication → Providers → Email 里关掉 Confirm email。',
          );
          setMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/studio');
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '操作失败，请检查邮箱和密码后重试。',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">{mode === 'login' ? '登录' : '注册'}</h1>
      <p className="text-sm text-neutral-500">
        登录后，你的历史记录会同步到云端，换设备登录也能看到同一份记录。不登录也能用，记录只存在本机。
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">邮箱</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="至少 6 位"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {message && (
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
        </Button>
      </form>
      <button
        type="button"
        className="text-sm text-neutral-500 underline"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? '还没有账号？去注册' : '已有账号？去登录'}
      </button>
    </div>
  );
}
