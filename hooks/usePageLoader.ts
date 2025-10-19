import { useState, useEffect } from 'react';

interface UsePageLoaderOptions {
  minLoadTime?: number;
}

interface UsePageLoaderReturn {
  isLoading: boolean;
  progress: number;
}

export function usePageLoader(options: UsePageLoaderOptions = {}): UsePageLoaderReturn {
  const { minLoadTime = 1000 } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, minLoadTime / 10);

    // Complete loading after minimum time
    const loadTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }, minLoadTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(loadTimeout);
    };
  }, [minLoadTime]);

  return { isLoading, progress };
}
