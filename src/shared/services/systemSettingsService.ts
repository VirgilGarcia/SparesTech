import { useSystemSettingsApi } from '../../hooks/api/useSystemSettingsApi'
import type {
  SystemSettings,
  SystemSettingsFilter,
  CreateSystemSettingsData,
  UpdateSystemSettingsData
} from '../types/system'

// Service wrapper pour maintenir la compatibilité
export const systemSettingsService = {
  
  /**
   * Récupère tous les paramètres système
   */
  getAll: async (filter?: SystemSettingsFilter): Promise<SystemSettings[]> => {
    const api = useSystemSettingsApi()
    return api.getAll(filter)
  },

  /**
   * Récupère un paramètre système par sa clé
   */
  getByKey: async (key: string): Promise<SystemSettings | null> => {
    const api = useSystemSettingsApi()
    return api.getByKey(key)
  },

  /**
   * Récupère la valeur d'un paramètre système
   */
  getValue: async <T = unknown>(key: string, defaultValue?: T): Promise<T> => {
    const api = useSystemSettingsApi()
    return api.getValue(key, defaultValue)
  },

  /**
   * Récupère tous les paramètres publics
   */
  getPublicSettings: async (): Promise<SystemSettings[]> => {
    const api = useSystemSettingsApi()
    return api.getPublicSettings()
  },

  /**
   * Récupère les paramètres par catégorie
   */
  getByCategory: async (category: string): Promise<SystemSettings[]> => {
    const api = useSystemSettingsApi()
    return api.getByCategory(category)
  },

  /**
   * Crée un nouveau paramètre système
   */
  create: async (data: CreateSystemSettingsData): Promise<SystemSettings> => {
    const api = useSystemSettingsApi()
    const result = await api.create(data)
    if (!result) {
      throw new Error('Impossible de créer le paramètre système')
    }
    return result
  },

  /**
   * Met à jour un paramètre système
   */
  update: async (key: string, data: UpdateSystemSettingsData): Promise<SystemSettings> => {
    const api = useSystemSettingsApi()
    const result = await api.update(key, data)
    if (!result) {
      throw new Error('Impossible de mettre à jour le paramètre système')
    }
    return result
  },

  /**
   * Met à jour la valeur d'un paramètre système
   */
  setValue: async (key: string, value: string | number | boolean | Record<string, unknown>): Promise<SystemSettings> => {
    const api = useSystemSettingsApi()
    const result = await api.setValue(key, value)
    if (!result) {
      throw new Error('Impossible de mettre à jour la valeur du paramètre système')
    }
    return result
  },

  /**
   * Supprime un paramètre système
   */
  delete: async (key: string): Promise<boolean> => {
    const api = useSystemSettingsApi()
    return api.delete(key)
  },

  /**
   * Initialise les paramètres système par défaut
   */
  initializeDefaults: async (): Promise<void> => {
    const api = useSystemSettingsApi()
    const result = await api.initializeDefaults()
    if (!result) {
      throw new Error('Impossible d\'initialiser les paramètres par défaut')
    }
  },

  /**
   * Exporte tous les paramètres système
   */
  exportSettings: async (): Promise<Record<string, unknown>> => {
    const api = useSystemSettingsApi()
    const result = await api.exportSettings()
    if (!result) {
      throw new Error('Impossible d\'exporter les paramètres système')
    }
    return result
  },

  /**
   * Importe des paramètres système
   */
  importSettings: async (settings: Record<string, {
    value: unknown
    type: SystemSettings['type']
    description?: string
    category?: string
    is_public?: boolean
  }>): Promise<void> => {
    const api = useSystemSettingsApi()
    const result = await api.importSettings(settings)
    if (!result) {
      throw new Error('Impossible d\'importer les paramètres système')
    }
  }
}