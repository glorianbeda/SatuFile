import { useTranslation as useTranslationBase } from 'react-i18next';

export const useTranslation = (ns?: string | string[]) => {
  try {
    return useTranslationBase(ns);
  } catch (error) {
    // Fallback if i18n is not properly initialized
    console.warn('i18n not properly initialized:', error);
    return {
      t: (key: string) => key,
      i18n: {} as any,
      ready: true,
    } as any;
  }
};
