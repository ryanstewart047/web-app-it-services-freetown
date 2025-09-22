'use client'

import { useState, useEffect } from 'react'

interface UsePageLoaderOptions {
  minLoadTime?: number
  dependencies?: any[]
  skipLoading?: boolean
}

export function usePageLoader({
  minLoadTime = 1500,
  dependencies = [],
  skipLoading = false
}: UsePageLoaderOptions = {}) {
  const [isLoading, setIsLoading] = useState(!skipLoading)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (skipLoading) {
      setIsLoading(false)
      return
    }

    const startTime = Date.now()
    
    // Simulate progressive loading
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + Math.random() * 10
      })
    }, 150)

    // Wait for minimum load time and dependencies
    const loadTimer = setTimeout(() => {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadTime - elapsedTime)
      
      setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsLoading(false)
        }, 300) // Allow progress to reach 100% before hiding
      }, remainingTime)
    }, 100)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(loadTimer)
    }
  }, [minLoadTime, skipLoading, ...dependencies])

  return {
    isLoading,
    progress: Math.min(progress, 100)
  }
}

// Hook for simulating API loading states
export function useAsyncLoader<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const result = await asyncFunction()
        
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { isLoading, data, error }
}