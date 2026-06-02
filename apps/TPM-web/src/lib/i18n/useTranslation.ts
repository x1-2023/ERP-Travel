/**
 * useTranslation hook
 * Usage: const { t, language } = useTranslation();
 *        t('common.save') -> 'Lưu' or 'Save'
 */

import { useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations, type Language } from './translations';


export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useUIStore();

  const t = useCallback((path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let value: any = translations;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        console.warn(`Translation not found: ${path}`);
        return path;
      }
    }

    if (value && typeof value === 'object' && language in value) {
      let result = value[language] as string;

      // Replace params like {min}, {max}
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          result = result.replace(`{${key}}`, String(val));
        });
      }

      return result;
    }

    console.warn(`Translation not found: ${path}`);
    return path;
  }, [language]);

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
    isVietnamese: language === 'vi',
    isEnglish: language === 'en',
  };
}

// Export for convenience
export { translations, type Language };
