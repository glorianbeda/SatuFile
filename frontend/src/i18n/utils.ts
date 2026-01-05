/**
 * i18n utility functions for language management
 */

const STORAGE_KEY = 'app-language';

/**
 * Get default language for initialization
 * Priority: localStorage > browser language > 'id'
 */
export function getDefaultLanguage(): string {
  // Try localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isValidLocale(stored)) {
    return stored;
  }

  // Try browser language
  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) {
    return browserLang;
  }

  // Default to Indonesian
  return 'id';
}

/**
 * Save language to localStorage
 */
export function saveLanguage(locale: string): void {
  if (isValidLocale(locale)) {
    localStorage.setItem(STORAGE_KEY, locale);
  }
}

/**
 * Check if locale code is valid
 */
export function isValidLocale(locale: string): boolean {
  return ['en', 'id'].includes(locale);
}

/**
 * Get supported languages list
 */
export interface SupportedLanguage {
  code: string;
  name: string;
}

export function getSupportedLanguages(): SupportedLanguage[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Bahasa Indonesia' },
  ];
}
