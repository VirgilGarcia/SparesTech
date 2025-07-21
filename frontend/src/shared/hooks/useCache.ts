import { useState, useEffect, useRef, useCallback } from 'react'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live en millisecondes
  key?: string // Clé de cache personnalisée
}

export function useCache<T>(
  fetchFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map())
  
  const { ttl = 5 * 60 * 1000, key } = options // 5 minutes par défaut
  const cacheKey = key || JSON.stringify(dependencies)

  const isCacheValid = (item: CacheItem<T>): boolean => {
    return Date.now() - item.timestamp < item.ttl
  }

  const getCachedData = useCallback((): T | null => {
    const cached = cacheRef.current.get(cacheKey)
    if (cached && isCacheValid(cached)) {
      return cached.data
    }
    return null
  }, [cacheKey])

  const setCachedData = useCallback((newData: T) => {
    cacheRef.current.set(cacheKey, {
      data: newData,
      timestamp: Date.now(),
      ttl
    })
  }, [cacheKey, ttl])

  const clearCache = () => {
    cacheRef.current.clear()
  }

  const clearCacheItem = (cacheKeyToClear: string) => {
    cacheRef.current.delete(cacheKeyToClear)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Vérifier le cache d'abord
        const cachedData = getCachedData()
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          return
        }

        // Si pas en cache, récupérer les données
        const result = await fetchFunction()
        setData(result)
        setCachedData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchFunction, getCachedData, setCachedData, ...dependencies])

  return {
    data,
    loading,
    error,
    clearCache,
    clearCacheItem,
    refetch: () => {
      clearCacheItem(cacheKey)
      setLoading(true)
      fetchFunction().then(setData).catch(setError).finally(() => setLoading(false))
    }
  }
} 