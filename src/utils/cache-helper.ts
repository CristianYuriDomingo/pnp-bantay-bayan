// utils/cache-helper.ts - Utility to clear various caches
export class CacheHelper {
  /**
   * Clear all browser caches for the current domain
   */
  static async clearAllCaches() {
    try {
      // Clear browser cache if available (requires HTTPS in production)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ Browser caches cleared');
      }
      
      // Clear localStorage
      localStorage.clear();
      console.log('✅ LocalStorage cleared');
      
      // Clear sessionStorage
      sessionStorage.clear();
      console.log('✅ SessionStorage cleared');
      
      // Force reload from server
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
    }
  }
  
  /**
   * Clear only progress-related data
   */
  static clearProgressCache() {
    // Remove any localStorage keys related to progress
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('progress') || key.includes('lesson') || key.includes('module'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Force a hard refresh
    window.location.href = window.location.href + '?cache_bust=' + Date.now();
  }
  
  /**
   * Add cache busting to any URL
   */
  static addCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}&r=${Math.random()}`;
  }
}

// Add to window for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).clearCache = CacheHelper.clearAllCaches;
  (window as any).clearProgressCache = CacheHelper.clearProgressCache;
}

