import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'zh'] as const;
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale: requestLocale }) => {
  const locale = requestLocale;
  if (!locales.includes(locale as any)) notFound();

  return {
    locale,
    messages: {
      en: (await import('../messages/en.json')).default,
      zh: (await import('../messages/zh.json')).default
    },
    timeZone: 'Asia/Shanghai'
  };
});