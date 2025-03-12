import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './request';

export const { Link, redirect, usePathname, useRouter } = createLocalizedPathnamesNavigation({
  locales,
  pathnames: {
    '/': '/',
    '/settings': '/settings'
  }
}); 