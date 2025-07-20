import { useState } from 'react'
import { api } from '../../lib/api'
import type {
  SystemSettings,
  SystemSettingsFilter,
  CreateSystemSettingsData,
  UpdateSystemSettingsData
} from '../../shared/types/system'

export function useSystemSettingsApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les paramètres système
   */
  const getAll = async (filter?: SystemSettingsFilter): Promise<SystemSettings[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filter?.key) params.append('key', filter.key)
      if (filter?.category) params.append('category', filter.category)
      if (filter?.is_public !== undefined) params.append('is_public', filter.is_public.toString())
      if (filter?.type) params.append('type', filter.type)
      
      const response = await api.get<SystemSettings[]>(`/system/settings?${params.toString()}`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des paramètres système')
        return []
      }
      
      return response.data || []
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupère un paramètre système par sa clé
   */
  const getByKey = async (key: string): Promise<SystemSettings | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<SystemSettings>(`/system/settings/${key}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération du paramètre')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupère la valeur d'un paramètre système
   */
  const getValue = async <T = unknown>(key: string, defaultValue?: T): Promise<T> => {
    try {
      const setting = await getByKey(key)
      
      if (!setting) {
        if (defaultValue !== undefined) return defaultValue
        throw new Error(`Paramètre système '${key}' introuvable`)
      }
      
      return setting.value as T
    } catch (err) {
      if (defaultValue !== undefined) return defaultValue
      throw err
    }
  }

  /**
   * Récupère tous les paramètres publics
   */
  const getPublicSettings = async (): Promise<SystemSettings[]> => {
    return getAll({ is_public: true })
  }

  /**
   * Récupère les paramètres par catégorie
   */
  const getByCategory = async (category: string): Promise<SystemSettings[]> => {
    return getAll({ category })
  }

  /**
   * Crée un nouveau paramètre système
   */
  const create = async (data: CreateSystemSettingsData): Promise<SystemSettings | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<SystemSettings>('/system/settings', data)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création du paramètre')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Met à jour un paramètre système
   */
  const update = async (key: string, data: UpdateSystemSettingsData): Promise<SystemSettings | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<SystemSettings>(`/system/settings/${key}`, data)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour du paramètre')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Met à jour la valeur d'un paramètre système
   */
  const setValue = async (key: string, value: string | number | boolean | Record<string, unknown>): Promise<SystemSettings | null> => {
    return update(key, { value })
  }

  /**
   * Supprime un paramètre système
   */
  const deleteParam = async (key: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.delete(`/system/settings/${key}`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression du paramètre')
        return false
      }
      
      return true
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Initialise les paramètres système par défaut
   */
  const initializeDefaults = async (): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/system/settings/initialize')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'initialisation des paramètres par défaut')
        return false
      }
      
      return true
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Exporte tous les paramètres système
   */
  const exportSettings = async (): Promise<Record<string, unknown> | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<Record<string, unknown>>('/system/settings/export')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'export des paramètres')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Importe des paramètres système
   */
  const importSettings = async (settings: Record<string, {
    value: unknown
    type: SystemSettings['type']
    description?: string
    category?: string
    is_public?: boolean
  }>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/system/settings/import', { settings })
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'import des paramètres')
        return false
      }
      
      return true
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getAll,
    getByKey,
    getValue,
    getPublicSettings,
    getByCategory,
    create,
    update,
    setValue,
    delete: deleteParam,
    initializeDefaults,
    exportSettings,
    importSettings
  }
}