// lib/progress-events.ts
// Utility for managing progress-related events across components

export const ProgressEvents = {
  // Dispatch lesson completion event
  dispatchLessonCompleted: (lessonId: string, moduleId?: string) => {
    // Use localStorage for cross-tab communication
    localStorage.setItem('lessonCompleted', JSON.stringify({
      lessonId,
      moduleId,
      timestamp: Date.now()
    }));

    // Remove the item after a short delay to allow other components to read it
    setTimeout(() => {
      localStorage.removeItem('lessonCompleted');
    }, 1000);

    // Dispatch custom event for same-page components
    window.dispatchEvent(new CustomEvent('lessonCompleted', {
      detail: { lessonId, moduleId, timestamp: Date.now() }
    }));

    console.log(`📡 Progress events dispatched for lesson ${lessonId}`);
  },

  // Listen for lesson completion events
  onLessonCompleted: (callback: (data: { lessonId: string; moduleId?: string; timestamp: number }) => void) => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lessonCompleted' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          callback(data);
        } catch (error) {
          console.error('Error parsing lesson completion event:', error);
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      callback(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('lessonCompleted', handleCustomEvent as EventListener);

    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lessonCompleted', handleCustomEvent as EventListener);
    };
  },

  // Force refresh all progress-related components
  dispatchProgressRefresh: () => {
    localStorage.setItem('progressRefresh', Date.now().toString());
    
    setTimeout(() => {
      localStorage.removeItem('progressRefresh');
    }, 1000);

    window.dispatchEvent(new CustomEvent('progressRefresh', {
      detail: { timestamp: Date.now() }
    }));

    console.log('🔄 Progress refresh event dispatched');
  },

  // Clear all progress-related events
  cleanup: () => {
    localStorage.removeItem('lessonCompleted');
    localStorage.removeItem('progressRefresh');
  }
};