import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'
import type {
  SystemSettings,
  SystemSettingsFilter,
  CreateSystemSettingsData,
  UpdateSystemSettingsData
} from '../../shared/types/system'

/**
 * Hook pour la gestion des paramètres système via l'API backend
 */
export const useSystemSettingsApi = () => {
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les paramètres système
   */
  const getAll = useCallback(async (filter?: SystemSettingsFilter): Promise<SystemSettings[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/system/settings', { params: filter })
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les paramètres système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère un paramètre système par sa clé
   */
  const getByKey = useCallback(async (key: string): Promise<SystemSettings | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/system/settings/${key}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer le paramètre système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère la valeur d'un paramètre système
   */
  const getValue = useCallback(async <T = unknown>(key: string, defaultValue?: T): Promise<T> => {
    try {
      const setting = await getByKey(key)
      return setting ? (setting.value as T) : (defaultValue as T)
    } catch (err) {
      return defaultValue as T
    }
  }, [getByKey])

  /**
   * Récupère tous les paramètres publics
   */
  const getPublicSettings = useCallback(async (): Promise<SystemSettings[]> => {
    return getAll({ is_public: true })
  }, [getAll])

  /**
   * Récupère les paramètres par catégorie
   */
  const getByCategory = useCallback(async (category: string): Promise<SystemSettings[]> => {
    return getAll({ category })
  }, [getAll])

  /**
   * Crée un nouveau paramètre système
   */
  const create = useCallback(async (data: CreateSystemSettingsData): Promise<SystemSettings> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/system/settings', data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de créer le paramètre système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Met à jour un paramètre système
   */
  const update = useCallback(async (key: string, data: UpdateSystemSettingsData): Promise<SystemSettings> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put(`/system/settings/${key}`, data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de mettre à jour le paramètre système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Met à jour la valeur d'un paramètre système
   */
  const setValue = useCallback(async (key: string, value: string | number | boolean | Record<string, unknown>): Promise<SystemSettings> => {
    return update(key, { value })
  }, [update])

  /**
   * Supprime un paramètre système
   */
  const remove = useCallback(async (key: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/system/settings/${key}`)
      return true
    } catch (err) {
      const errorMessage = 'Impossible de supprimer le paramètre système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Initialise les paramètres système par défaut
   */
  const initializeDefaults = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/system/settings/initialize-defaults')
      return true
    } catch (err) {
      const errorMessage = 'Impossible d\'initialiser les paramètres par défaut'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Exporte tous les paramètres système
   */
  const exportSettings = useCallback(async (): Promise<Record<string, unknown>> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/system/settings/export')
      return response.data || {}
    } catch (err) {
      const errorMessage = 'Impossible d\'exporter les paramètres système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Importe des paramètres système
   */
  const importSettings = useCallback(async (settings: Record<string, {
    value: unknown
    type: SystemSettings['type']
    description?: string
    category?: string
    is_public?: boolean
  }>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/system/settings/import', { settings })
      return true
    } catch (err) {
      const errorMessage = 'Impossible d\'importer les paramètres système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  return {
    // État
    loading,
    error,

    // Méthodes CRUD
    getAll,
    getByKey,
    getValue,
    getPublicSettings,
    getByCategory,
    create,
    update,
    setValue,
    delete: remove,

    // Méthodes utilitaires
    initializeDefaults,
    exportSettings,
    importSettings
  }
}