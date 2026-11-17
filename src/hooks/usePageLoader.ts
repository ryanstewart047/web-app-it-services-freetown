interface UsePageLoaderOptions {
  minLoadTime?: number;
}

interface UsePageLoaderReturn {
  isLoading: boolean;
  isComplete: boolean;
  progress: number;
}

/**
 * usePageLoader - Optimized for Core Web Vitals (FCP/LCP) and SEO.
 * Does not block initial page rendering with artificial setTimeout delays.
 */
export function usePageLoader(_options: UsePageLoaderOptions = {}): UsePageLoaderReturn {
  return { 
    isLoading: false, 
    isComplete: true, 
    progress: 100 
  };
}
