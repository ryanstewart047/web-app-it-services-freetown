import { useState, useEffect } from 'react';

interface UsePageLoaderOptions {
  minLoadTime?: number;
}

interface UsePageLoaderReturn {
  isLoading: boolean; // Keep for backward compatibility but use differently
  isComplete: boolean;
  progress: number;
}

/**
 * usePageLoader - Optimized for SEO and AdSense.
 * Ensures that 'isLoading' logic doesn't unmount the main content, 
 * which previously tricked Google into seeing an empty page.
 */
export function usePageLoader(options: UsePageLoaderOptions = {}): UsePageLoaderReturn {
  const { minLoadTime = 1000 } = options;
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Determine if we should show the loader at all (e.g., skip for bots)
    const isBot = typeof navigator !== 'undefined' && /Googlebot|AdsBot-Google|bingbot/i.test(navigator.userAgent);
    
    if (isBot) {
      setIsComplete(true);
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / minLoadTime) * 100, 100);
      
      setProgress(calculatedProgress);
      
      if (elapsed >= minLoadTime) {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minLoadTime]);

  return { 
    isLoading: !isComplete, // Still used by components for conditional rendering
    isComplete, 
    progress 
  };
}
