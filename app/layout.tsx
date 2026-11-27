import type { Metadata } from 'next';
import Link from 'next/link';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'Muse Prompt Studio',
  description: '一句话想法，变成能直接发给 Muse 的专业提示词',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <html lang="zh">
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <NextIntlClientProvider messages={messages}>
          <header className="border-b border-neutral-200 dark:border-neutral-800">
            <nav className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3 text-sm">
              <Link href="/" className="text-base font-semibold">
                Muse Prompt Studio
              </Link>
              <Link href="/studio">创作</Link>
              <Link href="/templates">模板库</Link>
              <Link href="/history">历史</Link>
            </nav>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
