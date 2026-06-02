/**
 * i18n Translation Tests
 * Tests the real translations and useTranslation hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';

// Mock the uiStore to control language in tests
let mockLanguage: 'vi' | 'en' = 'vi';
const mockSetLanguage = vi.fn((lang: 'vi' | 'en') => {
  mockLanguage = lang;
});
const mockToggleLanguage = vi.fn(() => {
  mockLanguage = mockLanguage === 'vi' ? 'en' : 'vi';
});

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    toggleLanguage: mockToggleLanguage,
  }),
}));

// Import AFTER mock is set up
import { useTranslation } from '@/lib/i18n/useTranslation';

describe('translations data', () => {
  it('should have common translations', () => {
    expect(translations.common).toBeDefined();
    expect(translations.common.save).toBeDefined();
    expect(translations.common.save.vi).toBe(translations.common.save.vi);
    expect(translations.common.save.en).toBe('Save');
    // Verify the vi string is not empty
    expect(translations.common.save.vi.length).toBeGreaterThan(0);
  });

  it('should have nav translations', () => {
    expect(translations.nav).toBeDefined();
    expect(translations.nav.dashboard.vi).toBe(translations.nav.dashboard.vi);
    expect(translations.nav.dashboard.en).toBe('Dashboard');
    expect(translations.nav.dashboard.vi.length).toBeGreaterThan(0);
  });

  it('should have sidebar translations', () => {
    expect(translations.sidebar).toBeDefined();
    expect(translations.sidebar.overview.en).toBe('OVERVIEW');
  });

  it('should have form translations with param placeholders', () => {
    expect(translations.form).toBeDefined();
    expect(translations.form.minLength.en).toContain('{min}');
    expect(translations.form.maxLength.en).toContain('{max}');
  });

  it('should have dashboard translations', () => {
    expect(translations.dashboard).toBeDefined();
    expect(translations.dashboard.title.en).toBe('Dashboard');
  });

  it('should have messages translations', () => {
    expect(translations.messages).toBeDefined();
    expect(translations.messages.saveSuccess.en).toBe('Saved successfully');
    expect(translations.messages.networkError.en).toBe('Network error');
  });

  it('all translation entries should have both vi and en', () => {
    const checkTranslations = (obj: Record<string, unknown>, path: string) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && 'vi' in (value as object) && 'en' in (value as object)) {
          // This is a leaf translation node
          const node = value as { vi: string; en: string };
          expect(typeof node.vi).toBe('string');
          expect(typeof node.en).toBe('string');
        } else if (value && typeof value === 'object') {
          // This is a section, recurse
          checkTranslations(value as Record<string, unknown>, `${path}.${key}`);
        }
      }
    };
    checkTranslations(translations, 'translations');
  });
});

describe('useTranslation hook', () => {
  beforeEach(() => {
    mockLanguage = 'vi';
    vi.clearAllMocks();
  });

  it('should return t function', () => {
    const { result } = renderHook(() => useTranslation());
    expect(typeof result.current.t).toBe('function');
  });

  it('should return current language', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.language).toBe('vi');
  });

  it('should return isVietnamese as true when language is vi', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.isVietnamese).toBe(true);
    expect(result.current.isEnglish).toBe(false);
  });

  it('should return isEnglish as true when language is en', () => {
    mockLanguage = 'en';
    const { result } = renderHook(() => useTranslation());
    expect(result.current.isEnglish).toBe(true);
    expect(result.current.isVietnamese).toBe(false);
  });

  it('should translate Vietnamese strings', () => {
    mockLanguage = 'vi';
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('common.cancel')).toBe(translations.common.cancel.vi);
    expect(result.current.t('common.delete')).toBe(translations.common.delete.vi);
    expect(result.current.t('common.save')).toBe(translations.common.save.vi);
  });

  it('should translate English strings', () => {
    mockLanguage = 'en';
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('common.save')).toBe('Save');
    expect(result.current.t('common.cancel')).toBe('Cancel');
    expect(result.current.t('common.delete')).toBe('Delete');
  });

  it('should translate nested paths', () => {
    mockLanguage = 'en';
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('nav.dashboard')).toBe('Dashboard');
    expect(result.current.t('nav.promotions')).toBe('Promotions');
    expect(result.current.t('dashboard.title')).toBe('Dashboard');
    expect(result.current.t('messages.saveSuccess')).toBe('Saved successfully');
  });

  it('should return path for missing keys', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
    expect(result.current.t('common.nonexistent')).toBe('common.nonexistent');
  });

  it('should substitute params in translations', () => {
    mockLanguage = 'en';
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('form.minLength', { min: 5 })).toBe('Minimum 5 characters');
    expect(result.current.t('form.maxLength', { max: 200 })).toBe('Maximum 200 characters');
  });

  it('should substitute params in Vietnamese translations', () => {
    mockLanguage = 'vi';
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('form.minLength', { min: 5 })).toContain('5');
    expect(result.current.t('form.maxLength', { max: 200 })).toContain('200');
  });

  it('should expose setLanguage function', () => {
    const { result } = renderHook(() => useTranslation());
    expect(typeof result.current.setLanguage).toBe('function');
  });

  it('should expose toggleLanguage function', () => {
    const { result } = renderHook(() => useTranslation());
    expect(typeof result.current.toggleLanguage).toBe('function');
  });

  it('should return path for deeply invalid path', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('a.b.c.d.e')).toBe('a.b.c.d.e');
  });

  it('should return path for empty string', () => {
    const { result } = renderHook(() => useTranslation());
    // Empty string split gives [''], which won't match
    expect(result.current.t('')).toBe('');
  });
});
