export type AppLocale = 'en' | 'es';

export const DEFAULT_LOCALE: AppLocale = 'en';

export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en', 'es'] as const;

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  es: 'Español',
};

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (!value) {
    return DEFAULT_LOCALE;
  }
  const base = value.toLowerCase().split('-')[0];
  return base === 'es' ? 'es' : 'en';
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const lang of languages) {
    const normalized = normalizeLocale(lang);
    if (normalized === 'es') {
      return 'es';
    }
  }
  return DEFAULT_LOCALE;
}
