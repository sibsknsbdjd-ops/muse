import { getRequestConfig } from 'next-intl/server';

// Skeleton stage: locale is fixed to zh until routing-based i18n is wired up.
export default getRequestConfig(async () => {
  const locale = 'zh';
  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
