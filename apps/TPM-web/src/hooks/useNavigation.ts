import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sidebarConfig, type SidebarItem } from '@/config/sidebarConfig';

export function useNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = useCallback(
    (href: string) =>
      location.pathname === href || location.pathname.startsWith(href + '/'),
    [location.pathname]
  );

  const isChildActive = useCallback(
    (item: SidebarItem): boolean => {
      if (isActive(item.href)) return true;
      if (item.children) {
        return item.children.some((child) => isActive(child.href));
      }
      return false;
    },
    [isActive]
  );

  const getActiveSection = useCallback((): string | null => {
    for (const section of sidebarConfig.sections) {
      for (const item of section.items) {
        if (isChildActive(item)) {
          return section.id;
        }
      }
    }
    return null;
  }, [isChildActive]);

  const getActiveItem = useCallback((): SidebarItem | null => {
    for (const section of sidebarConfig.sections) {
      for (const item of section.items) {
        if (isActive(item.href)) return item;
        if (item.children) {
          const activeChild = item.children.find((child) => isActive(child.href));
          if (activeChild) return activeChild as SidebarItem;
        }
      }
    }
    return null;
  }, [isActive]);

  const navigateTo = useCallback(
    (href: string) => {
      navigate(href);
    },
    [navigate]
  );

  const breadcrumbs = useMemo(() => {
    const result: Array<{ title: string; href: string }> = [];

    for (const section of sidebarConfig.sections) {
      for (const item of section.items) {
        if (isActive(item.href)) {
          result.push({ title: item.title, href: item.href });
          return result;
        }
        if (item.children) {
          for (const child of item.children) {
            if (isActive(child.href)) {
              result.push({ title: item.title, href: item.href });
              result.push({ title: child.title, href: child.href });
              return result;
            }
          }
        }
      }
    }

    return result;
  }, [isActive]);

  return {
    currentPath: location.pathname,
    isActive,
    isChildActive,
    getActiveSection,
    getActiveItem,
    navigateTo,
    breadcrumbs,
  };
}
