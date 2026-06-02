// src/lib/optimization/performance-metrics.ts

/**
 * LAC VIET HR - Performance Metrics
 * Client-side performance monitoring and Web Vitals tracking
 */

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface WebVitalsMetric {
  id: string;
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache';
}

export interface PerformanceMetrics {
  // Navigation Timing
  dns: number;
  tcp: number;
  ttfb: number;
  download: number;
  domInteractive: number;
  domComplete: number;
  loadComplete: number;

  // Resource Timing
  resourceCount: number;
  resourceSize: number;
  resourceDuration: number;

  // Custom Metrics
  hydrationTime?: number;
  routeChangeTime?: number;
}

export interface ResourceMetrics {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'fetch' | 'other';
  size: number;
  duration: number;
  startTime: number;
  cached: boolean;
}

export interface CustomTiming {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// ════════════════════════════════════════════════════════════════════════════════
// WEB VITALS THRESHOLDS
// ════════════════════════════════════════════════════════════════════════════════

export const WebVitalsThresholds = {
  // Largest Contentful Paint (ms)
  LCP: {
    good: 2500,
    poor: 4000,
  },

  // First Input Delay (ms)
  FID: {
    good: 100,
    poor: 300,
  },

  // Cumulative Layout Shift
  CLS: {
    good: 0.1,
    poor: 0.25,
  },

  // First Contentful Paint (ms)
  FCP: {
    good: 1800,
    poor: 3000,
  },

  // Time to First Byte (ms)
  TTFB: {
    good: 800,
    poor: 1800,
  },

  // Interaction to Next Paint (ms)
  INP: {
    good: 200,
    poor: 500,
  },
} as const;

// ════════════════════════════════════════════════════════════════════════════════
// WEB VITALS COLLECTION
// ════════════════════════════════════════════════════════════════════════════════

type MetricHandler = (metric: WebVitalsMetric) => void;

const metricHandlers: MetricHandler[] = [];

/**
 * Register a handler for Web Vitals metrics
 */
export function onWebVitals(handler: MetricHandler): () => void {
  metricHandlers.push(handler);

  return () => {
    const index = metricHandlers.indexOf(handler);
    if (index > -1) {
      metricHandlers.splice(index, 1);
    }
  };
}

/**
 * Report a Web Vitals metric
 */
export function reportWebVital(metric: WebVitalsMetric): void {
  metricHandlers.forEach((handler) => {
    try {
      handler(metric);
    } catch (error) {
      console.error('[WebVitals] Handler error:', error);
    }
  });
}

/**
 * Get rating for a metric value
 */
export function getMetricRating(
  name: keyof typeof WebVitalsThresholds,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WebVitalsThresholds[name];

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

// ════════════════════════════════════════════════════════════════════════════════
// NAVIGATION TIMING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Get navigation timing metrics
 */
export function getNavigationMetrics(): PerformanceMetrics | null {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return null;

  return {
    // DNS lookup time
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,

    // TCP connection time
    tcp: navigation.connectEnd - navigation.connectStart,

    // Time to first byte
    ttfb: navigation.responseStart - navigation.requestStart,

    // Download time
    download: navigation.responseEnd - navigation.responseStart,

    // DOM interactive time
    domInteractive: navigation.domInteractive - navigation.fetchStart,

    // DOM complete time
    domComplete: navigation.domComplete - navigation.fetchStart,

    // Full page load time
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,

    // Resource metrics (will be populated separately)
    resourceCount: 0,
    resourceSize: 0,
    resourceDuration: 0,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// RESOURCE TIMING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Get resource timing metrics
 */
export function getResourceMetrics(): ResourceMetrics[] {
  if (typeof window === 'undefined') return [];

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return resources.map((resource) => {
    const type = getResourceType(resource.initiatorType, resource.name);

    return {
      name: resource.name,
      type,
      size: resource.transferSize || 0,
      duration: resource.duration,
      startTime: resource.startTime,
      cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
    };
  });
}

/**
 * Determine resource type
 */
function getResourceType(
  initiatorType: string,
  url: string
): ResourceMetrics['type'] {
  if (initiatorType === 'script' || url.endsWith('.js')) return 'script';
  if (initiatorType === 'css' || url.endsWith('.css')) return 'stylesheet';
  if (initiatorType === 'img' || /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i.test(url)) return 'image';
  if (/\.(woff2?|ttf|otf|eot)$/i.test(url)) return 'font';
  if (initiatorType === 'fetch' || initiatorType === 'xmlhttprequest') return 'fetch';
  return 'other';
}

/**
 * Get aggregated resource statistics
 */
export function getResourceStats(): {
  totalSize: number;
  totalDuration: number;
  byType: Record<ResourceMetrics['type'], { count: number; size: number; duration: number }>;
  cacheHitRate: number;
} {
  const resources = getResourceMetrics();

  const byType: Record<ResourceMetrics['type'], { count: number; size: number; duration: number }> = {
    script: { count: 0, size: 0, duration: 0 },
    stylesheet: { count: 0, size: 0, duration: 0 },
    image: { count: 0, size: 0, duration: 0 },
    font: { count: 0, size: 0, duration: 0 },
    fetch: { count: 0, size: 0, duration: 0 },
    other: { count: 0, size: 0, duration: 0 },
  };

  let totalSize = 0;
  let totalDuration = 0;
  let cachedCount = 0;

  resources.forEach((resource) => {
    totalSize += resource.size;
    totalDuration += resource.duration;

    if (resource.cached) cachedCount++;

    const stats = byType[resource.type];
    stats.count++;
    stats.size += resource.size;
    stats.duration += resource.duration;
  });

  return {
    totalSize,
    totalDuration,
    byType,
    cacheHitRate: resources.length > 0 ? cachedCount / resources.length : 0,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM TIMING
// ════════════════════════════════════════════════════════════════════════════════

const customTimings = new Map<string, CustomTiming>();

/**
 * Start a custom timing measurement
 */
export function startTiming(name: string, metadata?: Record<string, unknown>): void {
  customTimings.set(name, {
    name,
    startTime: performance.now(),
    metadata,
  });

  // Also mark in performance timeline
  if (typeof performance.mark === 'function') {
    performance.mark(`${name}-start`);
  }
}

/**
 * End a custom timing measurement
 */
export function endTiming(name: string): CustomTiming | null {
  const timing = customTimings.get(name);
  if (!timing) {
    console.warn(`[Performance] Timing "${name}" was not started`);
    return null;
  }

  timing.endTime = performance.now();
  timing.duration = timing.endTime - timing.startTime;

  // Mark end in performance timeline
  if (typeof performance.mark === 'function') {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  return timing;
}

/**
 * Get a custom timing
 */
export function getTiming(name: string): CustomTiming | undefined {
  return customTimings.get(name);
}

/**
 * Clear all custom timings
 */
export function clearTimings(): void {
  customTimings.clear();
}

/**
 * Measure a function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<{ result: T; duration: number }> {
  startTiming(name, metadata);

  try {
    const result = await fn();
    const timing = endTiming(name);

    return {
      result,
      duration: timing?.duration || 0,
    };
  } catch (error) {
    endTiming(name);
    throw error;
  }
}

/**
 * Measure a sync function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, unknown>
): { result: T; duration: number } {
  startTiming(name, metadata);

  try {
    const result = fn();
    const timing = endTiming(name);

    return {
      result,
      duration: timing?.duration || 0,
    };
  } catch (error) {
    endTiming(name);
    throw error;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// LONG TASK MONITORING
// ════════════════════════════════════════════════════════════════════════════════

export interface LongTask {
  startTime: number;
  duration: number;
  attribution: string[];
}

const longTasks: LongTask[] = [];

/**
 * Start monitoring long tasks (tasks > 50ms that block main thread)
 */
export function startLongTaskMonitoring(
  callback?: (task: LongTask) => void
): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const task: LongTask = {
          startTime: entry.startTime,
          duration: entry.duration,
          attribution: (entry as unknown as { attribution?: { name: string }[] }).attribution?.map(
            (a) => a.name
          ) || [],
        };

        longTasks.push(task);
        callback?.(task);
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Get recorded long tasks
 */
export function getLongTasks(): LongTask[] {
  return [...longTasks];
}

/**
 * Clear long task history
 */
export function clearLongTasks(): void {
  longTasks.length = 0;
}

// ════════════════════════════════════════════════════════════════════════════════
// MEMORY MONITORING
// ════════════════════════════════════════════════════════════════════════════════

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

/**
 * Get memory usage information (Chrome only)
 */
export function getMemoryInfo(): MemoryInfo | null {
  if (typeof window === 'undefined') return null;

  const memory = (performance as unknown as { memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } }).memory;

  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// FRAME RATE MONITORING
// ════════════════════════════════════════════════════════════════════════════════

export interface FrameRateStats {
  current: number;
  average: number;
  min: number;
  max: number;
  dropped: number;
}

let frameRateMonitor: {
  frames: number[];
  lastFrameTime: number;
  rafId: number | null;
  callback?: (stats: FrameRateStats) => void;
} | null = null;

/**
 * Start monitoring frame rate
 */
export function startFrameRateMonitoring(
  callback?: (stats: FrameRateStats) => void,
  sampleSize: number = 60
): () => void {
  if (typeof window === 'undefined') return () => {};

  frameRateMonitor = {
    frames: [],
    lastFrameTime: performance.now(),
    rafId: null,
    callback,
  };

  const monitor = frameRateMonitor;

  function tick(currentTime: number) {
    const delta = currentTime - monitor.lastFrameTime;
    const fps = 1000 / delta;

    monitor.frames.push(fps);
    if (monitor.frames.length > sampleSize) {
      monitor.frames.shift();
    }

    monitor.lastFrameTime = currentTime;

    // Report stats every second
    if (monitor.frames.length % 60 === 0 && monitor.callback) {
      monitor.callback(getFrameRateStats());
    }

    monitor.rafId = requestAnimationFrame(tick);
  }

  monitor.rafId = requestAnimationFrame(tick);

  return () => {
    if (monitor.rafId !== null) {
      cancelAnimationFrame(monitor.rafId);
    }
    frameRateMonitor = null;
  };
}

/**
 * Get current frame rate statistics
 */
export function getFrameRateStats(): FrameRateStats {
  if (!frameRateMonitor || frameRateMonitor.frames.length === 0) {
    return {
      current: 0,
      average: 0,
      min: 0,
      max: 0,
      dropped: 0,
    };
  }

  const frames = frameRateMonitor.frames;
  const current = frames[frames.length - 1];
  const average = frames.reduce((a, b) => a + b, 0) / frames.length;
  const min = Math.min(...frames);
  const max = Math.max(...frames);
  const dropped = frames.filter((f) => f < 30).length;

  return {
    current: Math.round(current),
    average: Math.round(average),
    min: Math.round(min),
    max: Math.round(max),
    dropped,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// REPORTING
// ════════════════════════════════════════════════════════════════════════════════

export interface PerformanceReport {
  timestamp: number;
  url: string;
  webVitals: Partial<Record<WebVitalsMetric['name'], number>>;
  navigation: PerformanceMetrics | null;
  resources: {
    totalSize: number;
    totalDuration: number;
    cacheHitRate: number;
  };
  longTasks: {
    count: number;
    totalDuration: number;
  };
  memory: MemoryInfo | null;
  frameRate: FrameRateStats | null;
}

const collectedVitals: Partial<Record<WebVitalsMetric['name'], number>> = {};

/**
 * Collect Web Vitals for reporting
 */
export function collectWebVital(metric: WebVitalsMetric): void {
  collectedVitals[metric.name] = metric.value;
}

/**
 * Generate a performance report
 */
export function generatePerformanceReport(): PerformanceReport {
  const navigation = getNavigationMetrics();
  const resourceStats = getResourceStats();
  const tasks = getLongTasks();

  return {
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    webVitals: { ...collectedVitals },
    navigation,
    resources: {
      totalSize: resourceStats.totalSize,
      totalDuration: resourceStats.totalDuration,
      cacheHitRate: resourceStats.cacheHitRate,
    },
    longTasks: {
      count: tasks.length,
      totalDuration: tasks.reduce((sum, t) => sum + t.duration, 0),
    },
    memory: getMemoryInfo(),
    frameRate: frameRateMonitor ? getFrameRateStats() : null,
  };
}

/**
 * Send performance report to analytics endpoint
 */
export async function sendPerformanceReport(
  endpoint: string,
  report?: PerformanceReport
): Promise<void> {
  const data = report || generatePerformanceReport();

  try {
    // Use sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      // Fallback to fetch
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('[Performance] Failed to send report:', error);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(options: {
  reportEndpoint?: string;
  enableLongTaskMonitoring?: boolean;
  enableFrameRateMonitoring?: boolean;
  onWebVital?: MetricHandler;
} = {}): () => void {
  const cleanupFns: (() => void)[] = [];

  // Collect Web Vitals
  cleanupFns.push(onWebVitals(collectWebVital));

  if (options.onWebVital) {
    cleanupFns.push(onWebVitals(options.onWebVital));
  }

  // Long task monitoring
  if (options.enableLongTaskMonitoring) {
    cleanupFns.push(startLongTaskMonitoring());
  }

  // Frame rate monitoring
  if (options.enableFrameRateMonitoring) {
    cleanupFns.push(startFrameRateMonitoring());
  }

  // Send report on page unload
  if (options.reportEndpoint && typeof window !== 'undefined') {
    const handleUnload = () => {
      sendPerformanceReport(options.reportEndpoint!);
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    });

    cleanupFns.push(() => {
      window.removeEventListener('visibilitychange', handleUnload);
    });
  }

  // Return cleanup function
  return () => {
    cleanupFns.forEach((fn) => fn());
  };
}
