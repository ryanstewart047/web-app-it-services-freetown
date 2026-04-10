import { useState, useEffect } from 'react';

interface UsePageLoaderOptions {
  minLoadTime?: number;
}

interface UsePageLoaderReturn {
  isLoading: boolean;
  progress: number;
}

export function usePageLoader(options: UsePageLoaderOptions = {}): UsePageLoaderReturn {
  // [SEO FIX]: Set isLoading directly to false right out of the gate! 
  // This physically bypasses the synthetic DOM unmount overlay which was tricking Google AdSense. 
  // Doing this guarantees web crawlers instantly parse the entire web content upon connection.
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(100);

  return { isLoading, progress };
}
