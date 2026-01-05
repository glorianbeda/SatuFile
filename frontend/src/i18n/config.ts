import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enFiles from './locales/en/files.json';
import enSettings from './locales/en/settings.json';
import enAuth from './locales/en/auth.json';
import enShares from './locales/en/shares.json';

import idCommon from './locales/id/common.json';
import idFiles from './locales/id/files.json';
import idSettings from './locales/id/settings.json';
import idAuth from './locales/id/auth.json';
import idShares from './locales/id/shares.json';

/**
 * Initialize i18n with a specific language
 * This should be called with the language from user profile (if logged in)
 * or from localStorage/default language (if not logged in)
 */
export function initI18n(locale: string = 'id') {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          common: enCommon,
          files: enFiles,
          settings: enSettings,
          auth: enAuth,
          shares: enShares,
        },
        id: {
          common: idCommon,
          files: idFiles,
          settings: idSettings,
          auth: idAuth,
          shares: idShares,
        },
      },
      fallbackLng: 'en',
      lng: locale,
      ns: ['common', 'files', 'settings', 'auth', 'shares'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

// Initialize with default language for non-authenticated state
initI18n();

export default i18n;
