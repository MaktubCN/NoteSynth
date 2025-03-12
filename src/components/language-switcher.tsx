'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent"
      title={locale === 'en' ? '切换到中文' : 'Switch to English'}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {locale === 'en' ? '切换到中文' : 'Switch to English'}
      </span>
    </button>
  );
} 