import { useActivityLogApi } from '../../hooks/api/useActivityLogApi'
import type {
  ActivityLog,
  ActivityLogFilter,
  CreateActivityLogData
} from '../types/system'

/**
 * Service wrapper pour la gestion des logs d'activité
 * Route les appels critiques vers l'API backend pour éviter les problèmes RLS
 */
export const activityLogService = {
  
  /**
   * Récupère tous les logs d'activité avec filtres
   */
  getAll: async (filter?: ActivityLogFilter): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    const api = useActivityLogApi()
    return api.getAll(filter)
  },

  /**
   * Récupère un log d'activité par ID
   */
  getById: async (id: string): Promise<ActivityLog | null> => {
    const api = useActivityLogApi()
    return api.getById(id)
  },

  /**
   * Enregistre une nouvelle activité
   */
  log: async (data: CreateActivityLogData): Promise<ActivityLog> => {
    const api = useActivityLogApi()
    const result = await api.log(data)
    if (!result) {
      throw new Error('Impossible d\'enregistrer le log d\'activité')
    }
    return result
  },

  /**
   * Log de création d'une ressource
   */
  logCreate: async (
    tenantId: string | null,
    userId: string | null,
    resourceType: string,
    resourceId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog> => {
    const api = useActivityLogApi()
    const result = await api.logCreate(tenantId, userId, resourceType, resourceId, details, request)
    if (!result) {
      throw new Error('Impossible d\'enregistrer le log d\'activité')
    }
    return result
  },

  /**
   * Log de modification d'une ressource
   */
  logUpdate: async (
    tenantId: string | null,
    userId: string | null,
    resourceType: string,
    resourceId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog> => {
    const api = useActivityLogApi()
    const result = await api.logUpdate(tenantId, userId, resourceType, resourceId, details, request)
    if (!result) {
      throw new Error('Impossible d\'enregistrer le log d\'activité')
    }
    return result
  },

  /**
   * Log de suppression d'une ressource
   */
  logDelete: async (
    tenantId: string | null,
    userId: string | null,
    resourceType: string,
    resourceId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog> => {
    const api = useActivityLogApi()
    const result = await api.logDelete(tenantId, userId, resourceType, resourceId, details, request)
    if (!result) {
      throw new Error('Impossible d\'enregistrer le log d\'activité')
    }
    return result
  },

  /**
   * Log de connexion utilisateur
   */
  logLogin: async (
    tenantId: string | null,
    userId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog> => {
    const api = useActivityLogApi()
    const result = await api.logLogin(tenantId, userId, details, request)
    if (!result) {
      throw new Error('Impossible d\'enregistrer le log d\'activité')
    }
    return result
  },

  /**
   * Log de déconnexion utilisateur
   */
  logLogout: async (
    tenantId: string | null,
    userId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog> => {
    const api = useActivityLogApi()
    const result = await api.logLogout(tenantId, userId, details, request)
    if (!result) {
      throw new Error('Impossible d\'enregistrer le log d\'activité')
    }
    return result
  },

  /**
   * Récupère les logs par tenant
   */
  getByTenant: async (tenantId: string, filter?: Omit<ActivityLogFilter, 'tenant_id'>): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    const api = useActivityLogApi()
    return api.getByTenant(tenantId, filter)
  },

  /**
   * Récupère les logs par utilisateur
   */
  getByUser: async (userId: string, filter?: Omit<ActivityLogFilter, 'user_id'>): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    const api = useActivityLogApi()
    return api.getByUser(userId, filter)
  },

  /**
   * Récupère les logs par ressource
   */
  getByResource: async (
    resourceType: string, 
    resourceId: string, 
    filter?: Omit<ActivityLogFilter, 'resource_type' | 'resource_id'>
  ): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    const api = useActivityLogApi()
    return api.getByResource(resourceType, resourceId, filter)
  },

  /**
   * Supprime les anciens logs (nettoyage)
   */
  cleanup: async (olderThanDays: number = 90): Promise<number> => {
    const api = useActivityLogApi()
    return api.cleanup(olderThanDays)
  },

  /**
   * Récupère les statistiques d'activité
   */
  getStats: async (
    tenantId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalLogs: number
    actionBreakdown: Record<string, number>
    resourceBreakdown: Record<string, number>
    userBreakdown: Record<string, number>
    dailyActivity: Array<{
      date: string
      count: number
    }>
  }> => {
    const api = useActivityLogApi()
    const result = await api.getStats(tenantId, startDate, endDate)
    if (!result) {
      throw new Error('Impossible de récupérer les statistiques d\'activité')
    }
    return result
  }
}