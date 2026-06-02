// src/lib/optimization/lazy-loading.ts

/**
 * LAC VIET HR - Lazy Loading Utilities
 * Component and data lazy loading for optimal performance
 */

import dynamic from 'next/dynamic';
import React, { ComponentType, lazy, Suspense, ReactNode } from 'react';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface LazyLoadOptions {
  ssr?: boolean;
  loading?: ComponentType<unknown>;
  delay?: number;
  timeout?: number;
  retry?: number;
}

export interface ChunkConfig {
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  preload?: boolean;
}

export interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// LAZY COMPONENT LOADER
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Create a lazy-loaded component with Next.js dynamic import
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const {
    ssr = false,
    loading,
    delay = 200,
  } = options;

  return dynamic(importFn, {
    ssr,
    loading: loading ? () => {
      // Add minimum delay to prevent flash
      return null;
    } : undefined,
  });
}

/**
 * Lazy load heavy components with intersection observer
 */
export function lazyLoadOnVisible<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: IntersectionOptions = {}
): ComponentType<P & { fallback?: ReactNode }> {
  const LazyComponent = lazy(importFn);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true,
  } = options;

  // Return wrapper component
  const WrappedComponent: ComponentType<P & { fallback?: ReactNode }> = (props) => {
    // Note: This is a simplified version - actual implementation would use
    // useIntersectionObserver hook
    return React.createElement(
      Suspense,
      { fallback: props.fallback || null },
      React.createElement(LazyComponent as unknown as React.ComponentType<P>, props as P)
    );
  };

  WrappedComponent.displayName = 'LazyVisibleComponent';
  return WrappedComponent;
}

// ════════════════════════════════════════════════════════════════════════════════
// CHUNK DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Define code splitting chunks for the application
 */
export const ChunkDefinitions: Record<string, ChunkConfig> = {
  // Critical - loaded immediately
  'core': {
    name: 'core',
    priority: 'critical',
    preload: true,
  },
  'auth': {
    name: 'auth',
    priority: 'critical',
    preload: true,
  },

  // High priority - loaded early
  'dashboard': {
    name: 'dashboard',
    priority: 'high',
    preload: true,
  },
  'employees': {
    name: 'employees',
    priority: 'high',
    preload: false,
  },

  // Medium priority - loaded on demand
  'attendance': {
    name: 'attendance',
    priority: 'medium',
    preload: false,
  },
  'payroll': {
    name: 'payroll',
    priority: 'medium',
    preload: false,
  },
  'leave': {
    name: 'leave',
    priority: 'medium',
    preload: false,
  },
  'recruitment': {
    name: 'recruitment',
    priority: 'medium',
    preload: false,
  },

  // Low priority - loaded when needed
  'reports': {
    name: 'reports',
    priority: 'low',
    preload: false,
  },
  'settings': {
    name: 'settings',
    priority: 'low',
    preload: false,
  },
  'admin': {
    name: 'admin',
    priority: 'low',
    preload: false,
  },
  'charts': {
    name: 'charts',
    priority: 'low',
    preload: false,
  },
  'pdf-generator': {
    name: 'pdf-generator',
    priority: 'low',
    preload: false,
  },
  'excel-export': {
    name: 'excel-export',
    priority: 'low',
    preload: false,
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// PRELOADING UTILITIES
// ════════════════════════════════════════════════════════════════════════════════

type ModuleLoader = () => Promise<unknown>;

const preloadedModules = new Set<string>();
const moduleLoaders = new Map<string, ModuleLoader>();

/**
 * Register a module for preloading
 */
export function registerModule(name: string, loader: ModuleLoader): void {
  moduleLoaders.set(name, loader);
}

/**
 * Preload a module by name
 */
export async function preloadModule(name: string): Promise<void> {
  if (preloadedModules.has(name)) return;

  const loader = moduleLoaders.get(name);
  if (!loader) {
    console.warn(`[Preload] Module "${name}" not registered`);
    return;
  }

  try {
    await loader();
    preloadedModules.add(name);
  } catch (error) {
    console.error(`[Preload] Failed to preload module "${name}":`, error);
  }
}

/**
 * Preload multiple modules in parallel
 */
export async function preloadModules(names: string[]): Promise<void> {
  await Promise.all(names.map(preloadModule));
}

/**
 * Preload modules based on priority
 */
export async function preloadByPriority(
  priority: 'critical' | 'high' | 'medium' | 'low'
): Promise<void> {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const targetPriority = priorityOrder[priority];

  const modulesToPreload = Object.entries(ChunkDefinitions)
    .filter(([_, config]) => {
      const modulePriority = priorityOrder[config.priority];
      return modulePriority <= targetPriority && config.preload;
    })
    .map(([name]) => name);

  await preloadModules(modulesToPreload);
}

// ════════════════════════════════════════════════════════════════════════════════
// ROUTE-BASED PRELOADING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Route to module mapping
 */
export const RouteModuleMap: Record<string, string[]> = {
  '/dashboard': ['dashboard', 'charts'],
  '/employees': ['employees'],
  '/employees/[id]': ['employees'],
  '/attendance': ['attendance'],
  '/payroll': ['payroll', 'charts'],
  '/leave': ['leave'],
  '/recruitment': ['recruitment'],
  '/reports': ['reports', 'charts', 'pdf-generator', 'excel-export'],
  '/settings': ['settings'],
  '/admin': ['admin'],
};

/**
 * Preload modules for a specific route
 */
export async function preloadForRoute(route: string): Promise<void> {
  const modules = RouteModuleMap[route];
  if (modules) {
    await preloadModules(modules);
  }
}

/**
 * Predict and preload modules based on user behavior
 */
export function setupPredictivePreloading(): void {
  if (typeof window === 'undefined') return;

  // Preload on link hover
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement | null;

    if (link?.href) {
      const url = new URL(link.href);
      const pathname = url.pathname;

      // Check if it's an internal link
      if (url.origin === window.location.origin) {
        preloadForRoute(pathname);
      }
    }
  }, { passive: true });

  // Preload based on viewport intersection
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const route = element.dataset.preloadRoute;
            if (route) {
              preloadForRoute(route);
              observer.unobserve(element);
            }
          }
        });
      },
      { rootMargin: '100px' }
    );

    // Observe elements with data-preload-route attribute
    document.querySelectorAll('[data-preload-route]').forEach((el) => {
      observer.observe(el);
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DATA LAZY LOADING
// ════════════════════════════════════════════════════════════════════════════════

export interface LazyDataOptions<T> {
  initialData?: T;
  staleTime?: number;
  cacheKey?: string;
}

/**
 * Create a lazy data loader that fetches on demand
 */
export function createLazyDataLoader<T>(
  fetcher: () => Promise<T>,
  options: LazyDataOptions<T> = {}
) {
  const { staleTime = 5 * 60 * 1000, cacheKey } = options;

  let data: T | undefined = options.initialData;
  let promise: Promise<T> | null = null;
  let lastFetch = 0;
  let error: Error | null = null;

  return {
    /**
     * Get data - fetches if not available or stale
     */
    async get(): Promise<T> {
      const now = Date.now();

      // Return cached data if fresh
      if (data !== undefined && now - lastFetch < staleTime) {
        return data;
      }

      // Return pending promise if exists
      if (promise) {
        return promise;
      }

      // Fetch new data
      promise = fetcher()
        .then((result) => {
          data = result;
          lastFetch = Date.now();
          error = null;
          return result;
        })
        .catch((err) => {
          error = err;
          throw err;
        })
        .finally(() => {
          promise = null;
        });

      return promise;
    },

    /**
     * Check if data is available
     */
    hasData(): boolean {
      return data !== undefined;
    },

    /**
     * Get cached data without fetching
     */
    getCached(): T | undefined {
      return data;
    },

    /**
     * Check if data is stale
     */
    isStale(): boolean {
      return Date.now() - lastFetch >= staleTime;
    },

    /**
     * Invalidate cached data
     */
    invalidate(): void {
      data = undefined;
      lastFetch = 0;
    },

    /**
     * Get last error
     */
    getError(): Error | null {
      return error;
    },

    /**
     * Prefetch data
     */
    async prefetch(): Promise<void> {
      if (!this.hasData() || this.isStale()) {
        await this.get();
      }
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// VIRTUALIZATION HELPERS
// ════════════════════════════════════════════════════════════════════════════════

export interface VirtualListConfig {
  itemHeight: number;
  overscan?: number;
  containerHeight: number;
}

/**
 * Calculate virtual list indices for rendering
 */
export function getVirtualListRange(
  scrollTop: number,
  totalItems: number,
  config: VirtualListConfig
): { start: number; end: number; offsetY: number } {
  const { itemHeight, overscan = 3, containerHeight } = config;

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const offsetY = start * itemHeight;

  return { start, end, offsetY };
}

/**
 * Create a windowed array for virtualization
 */
export function getWindowedItems<T>(
  items: T[],
  start: number,
  end: number
): { item: T; index: number }[] {
  return items.slice(start, end).map((item, i) => ({
    item,
    index: start + i,
  }));
}

// ════════════════════════════════════════════════════════════════════════════════
// PROGRESSIVE LOADING
// ════════════════════════════════════════════════════════════════════════════════

export interface ProgressiveLoadConfig {
  initialBatch: number;
  batchSize: number;
  delay?: number;
}

/**
 * Load data progressively in batches
 */
export async function* loadProgressively<T>(
  fetchBatch: (offset: number, limit: number) => Promise<T[]>,
  config: ProgressiveLoadConfig
): AsyncGenerator<T[], void, unknown> {
  const { initialBatch, batchSize, delay = 0 } = config;
  let offset = 0;
  let hasMore = true;

  // First batch (larger)
  const firstBatch = await fetchBatch(0, initialBatch);
  yield firstBatch;
  offset = initialBatch;
  hasMore = firstBatch.length === initialBatch;

  // Subsequent batches
  while (hasMore) {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const batch = await fetchBatch(offset, batchSize);
    if (batch.length > 0) {
      yield batch;
    }

    offset += batchSize;
    hasMore = batch.length === batchSize;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SKELETON GENERATORS
// ════════════════════════════════════════════════════════════════════════════════

export interface SkeletonConfig {
  type: 'text' | 'avatar' | 'image' | 'card' | 'table-row';
  count?: number;
  width?: string | number;
  height?: string | number;
}

/**
 * Generate skeleton placeholder configuration
 */
export function generateSkeletonConfig(
  type: 'list' | 'grid' | 'table' | 'form' | 'dashboard',
  count: number = 5
): SkeletonConfig[] {
  switch (type) {
    case 'list':
      return Array(count).fill(null).map(() => ({
        type: 'card' as const,
        height: 80,
      }));

    case 'grid':
      return Array(count).fill(null).map(() => ({
        type: 'card' as const,
        height: 200,
      }));

    case 'table':
      return Array(count).fill(null).map(() => ({
        type: 'table-row' as const,
        height: 52,
      }));

    case 'form':
      return [
        { type: 'text' as const, width: '30%', height: 20 },
        { type: 'text' as const, width: '100%', height: 40 },
        { type: 'text' as const, width: '30%', height: 20 },
        { type: 'text' as const, width: '100%', height: 40 },
        { type: 'text' as const, width: '30%', height: 20 },
        { type: 'text' as const, width: '100%', height: 80 },
      ];

    case 'dashboard':
      return [
        { type: 'card' as const, height: 120 },
        { type: 'card' as const, height: 120 },
        { type: 'card' as const, height: 120 },
        { type: 'card' as const, height: 120 },
        { type: 'card' as const, height: 300 },
        { type: 'card' as const, height: 300 },
      ];

    default:
      return [];
  }
}
