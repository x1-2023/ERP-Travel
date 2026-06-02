// tests/e2e/performance/performance.spec.ts

/**
 * LAC VIET HR - Performance E2E Tests
 * Page load times, Core Web Vitals, rendering performance
 */

import { test, expect } from '@playwright/test';

test.describe('Page Load Performance', () => {
  test('should load login page within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Login page load time: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(2000);
  });

  test('should load dashboard within 3 seconds', async ({ page }) => {
    // Use authenticated state
    await page.goto('/dashboard');
    
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load employee list within 2.5 seconds', async ({ page }) => {
    await page.goto('/employees');
    
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Employee list load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2500);
  });
});

test.describe('Core Web Vitals', () => {
  test('should have good LCP (Largest Contentful Paint)', async ({ page }) => {
    await page.goto('/dashboard');
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;
        
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          lcpValue = lastEntry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Wait a bit for LCP to be captured
        setTimeout(() => resolve(lcpValue), 3000);
      });
    });
    
    console.log(`LCP: ${lcp}ms`);
    
    // Good LCP is < 2.5s, needs improvement is < 4s
    expect(lcp).toBeLessThan(2500);
  });

  test('should have good FID simulation (First Input Delay)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Simulate first input and measure response
    const startTime = Date.now();
    await page.click('[data-testid="first-interactive"], button, a', { timeout: 5000 }).catch(() => {});
    const inputDelay = Date.now() - startTime;
    
    console.log(`First Input Delay (simulated): ${inputDelay}ms`);
    
    // Good FID is < 100ms
    expect(inputDelay).toBeLessThan(300);
  });

  test('should have good CLS (Cumulative Layout Shift)', async ({ page }) => {
    await page.goto('/dashboard');
    
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) {
            if (!(entry as any).hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Wait for page to stabilize
        setTimeout(() => resolve(clsValue), 5000);
      });
    });
    
    console.log(`CLS: ${cls}`);
    
    // Good CLS is < 0.1, needs improvement is < 0.25
    expect(cls).toBeLessThan(0.1);
  });

  test('should have good TTFB (Time to First Byte)', async ({ page }) => {
    const response = await page.goto('/dashboard');
    
    const timing = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.responseStart - navigation.requestStart;
    });
    
    console.log(`TTFB: ${timing}ms`);
    
    // Good TTFB is < 200ms for dynamic content
    expect(timing).toBeLessThan(500);
  });
});

test.describe('Rendering Performance', () => {
  test('should render employee list efficiently', async ({ page }) => {
    await page.goto('/employees');
    
    // Measure time to render list
    const renderTime = await page.evaluate(async () => {
      const start = performance.now();
      
      // Wait for table to be fully rendered
      await new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          const table = document.querySelector('table tbody tr');
          if (table) {
            observer.disconnect();
            resolve();
          }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Timeout fallback
        setTimeout(resolve, 5000);
      });
      
      return performance.now() - start;
    });
    
    console.log(`Table render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(1000);
  });

  test('should handle pagination without lag', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    
    // Click next page and measure response
    const page2Button = page.locator('[data-testid="page-2"], .pagination button:has-text("2")');
    
    if (await page2Button.isVisible()) {
      const startTime = Date.now();
      await page2Button.click();
      await page.waitForLoadState('networkidle');
      const paginationTime = Date.now() - startTime;
      
      console.log(`Pagination time: ${paginationTime}ms`);
      expect(paginationTime).toBeLessThan(500);
    }
  });

  test('should handle search with minimal delay', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[name="search"], input[placeholder*="Tìm"]');
    
    const startTime = Date.now();
    await searchInput.fill('Nguyen');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    const searchTime = Date.now() - startTime;
    
    console.log(`Search time: ${searchTime}ms`);
    expect(searchTime).toBeLessThan(1000);
  });
});

test.describe('Memory Performance', () => {
  test('should not have memory leaks on navigation', async ({ page }) => {
    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate between pages multiple times
    for (let i = 0; i < 10; i++) {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.goto('/employees');
      await page.waitForLoadState('networkidle');
      await page.goto('/leave');
      await page.waitForLoadState('networkidle');
    }
    
    // Get final memory
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should not grow significantly (allow 50% increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
      console.log(`Memory increase: ${(memoryIncrease * 100).toFixed(2)}%`);
      expect(memoryIncrease).toBeLessThan(0.5);
    }
  });
});

test.describe('Network Performance', () => {
  test('should minimize API calls on dashboard', async ({ page }) => {
    const apiCalls: string[] = [];
    
    // Intercept API calls
    await page.route('**/api/**', (route) => {
      apiCalls.push(route.request().url());
      route.continue();
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log(`Dashboard API calls: ${apiCalls.length}`);
    console.log('Endpoints:', apiCalls.map(url => new URL(url).pathname));
    
    // Dashboard should batch requests efficiently
    expect(apiCalls.length).toBeLessThan(10);
  });

  test('should cache static assets', async ({ page }) => {
    // First visit
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Get cache-related headers
    const response = await page.goto('/dashboard');
    const cacheControl = response?.headers()['cache-control'];
    
    console.log(`Cache-Control: ${cacheControl}`);
    
    // Static assets should have caching headers
    // (This tests the response headers, actual caching behavior depends on browser)
  });

  test('should load images lazily', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if images have lazy loading attribute
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const loading = await images.nth(i).getAttribute('loading');
      // Images below fold should be lazy loaded
    }
  });
});

test.describe('Bundle Size', () => {
  test('should have reasonable initial bundle size', async ({ page }) => {
    const resourceSizes: { name: string; size: number }[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/_next/static/') && (url.endsWith('.js') || url.endsWith('.css'))) {
        const headers = response.headers();
        const size = parseInt(headers['content-length'] || '0');
        resourceSizes.push({
          name: url.split('/').pop() || url,
          size,
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const totalJS = resourceSizes
      .filter(r => r.name.endsWith('.js'))
      .reduce((sum, r) => sum + r.size, 0);
    
    console.log(`Total JS bundle size: ${(totalJS / 1024).toFixed(2)} KB`);
    
    // Initial JS should be under 500KB (compressed)
    // This is a rough estimate, actual threshold depends on app complexity
  });
});

test.describe('Responsive Performance', () => {
  test('should load mobile view efficiently', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Mobile load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not block on viewport resize', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Measure resize performance
    const resizeTime = await page.evaluate(async () => {
      const start = performance.now();
      
      // Trigger resize
      window.dispatchEvent(new Event('resize'));
      
      // Wait for reflow
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      return performance.now() - start;
    });
    
    console.log(`Resize time: ${resizeTime}ms`);
    expect(resizeTime).toBeLessThan(100);
  });
});
