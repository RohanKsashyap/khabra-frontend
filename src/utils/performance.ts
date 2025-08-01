// Performance monitoring utility for Core Web Vitals
export const performanceMonitor = {
  // Track Largest Contentful Paint (LCP)
  trackLCP: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Log LCP for monitoring
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics if needed
        if (lastEntry.startTime > 2500) {
          console.warn('LCP is above recommended threshold:', lastEntry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },

  // Track First Input Delay (FID)
  trackFID: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const eventEntry = entry as PerformanceEventTiming;
          console.log('FID:', eventEntry.processingStart - eventEntry.startTime);
          
          if (eventEntry.processingStart - eventEntry.startTime > 100) {
            console.warn('FID is above recommended threshold:', eventEntry.processingStart - eventEntry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  },

  // Track Cumulative Layout Shift (CLS)
  trackCLS: () => {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log('CLS:', clsValue);
            
            if (clsValue > 0.1) {
              console.warn('CLS is above recommended threshold:', clsValue);
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  },

  // Track First Contentful Paint (FCP)
  trackFCP: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        console.log('FCP:', firstEntry.startTime);
        
        if (firstEntry.startTime > 1800) {
          console.warn('FCP is above recommended threshold:', firstEntry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['first-contentful-paint'] });
    }
  },

  // Initialize all performance tracking
  init: () => {
    performanceMonitor.trackLCP();
    performanceMonitor.trackFID();
    performanceMonitor.trackCLS();
    performanceMonitor.trackFCP();
  },

  // Get current performance metrics
  getMetrics: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        domLoad: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
      };
    }
    return null;
  },
};

// Resource timing monitoring
export const resourceMonitor = {
  trackSlowResources: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.duration > 1000) {
            console.warn('Slow resource detected:', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize,
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  },

  init: () => {
    resourceMonitor.trackSlowResources();
  },
}; 