import { useState, useCallback, useEffect } from 'react';
import { sidebarConfig } from '@/config/sidebarConfig';

const STORAGE_KEY = 'sidebar-expanded-sections';

export function useSidebarCollapse() {
  // Initialize from config defaults
  const getDefaultExpanded = () =>
    sidebarConfig.sections
      .filter((section) => section.defaultExpanded)
      .map((section) => section.id);

  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return getDefaultExpanded();
        }
      }
    }
    return getDefaultExpanded();
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const isSectionExpanded = useCallback(
    (sectionId: string) => expandedSections.includes(sectionId),
    [expandedSections]
  );

  const expandAll = useCallback(() => {
    setExpandedSections(sidebarConfig.sections.map((s) => s.id));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedSections([]);
  }, []);

  const resetToDefaults = useCallback(() => {
    setExpandedSections(getDefaultExpanded());
  }, []);

  return {
    expandedSections,
    toggleSection,
    isSectionExpanded,
    expandAll,
    collapseAll,
    resetToDefaults,
  };
}
