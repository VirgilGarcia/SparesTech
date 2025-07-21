import { useState } from 'react'
import { api } from '../../lib/api'
import type {
  ActivityLog,
  ActivityLogFilter,
  CreateActivityLogData
} from '../../shared/types/system'

interface ActivityLogResponse {
  data: ActivityLog[]
  total: number
}

interface ActivityLogStats {
  totalLogs: number
  actionBreakdown: Record<string, number>
  resourceBreakdown: Record<string, number>
  userBreakdown: Record<string, number>
  dailyActivity: Array<{
    date: string
    count: number
  }>
}

export function useActivityLogApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les logs d'activité avec filtres
   */
  const getAll = async (filter?: ActivityLogFilter): Promise<ActivityLogResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filter?.tenant_id) params.append('tenant_id', filter.tenant_id)
      if (filter?.user_id) params.append('user_id', filter.user_id)
      if (filter?.action) params.append('action', filter.action)
      if (filter?.resource_type) params.append('resource_type', filter.resource_type)
      if (filter?.resource_id) params.append('resource_id', filter.resource_id)
      if (filter?.start_date) params.append('start_date', filter.start_date)
      if (filter?.end_date) params.append('end_date', filter.end_date)
      if (filter?.offset) params.append('offset', filter.offset.toString())
      if (filter?.limit) params.append('limit', filter.limit.toString())
      
      const response = await api.get<ActivityLogResponse>(`/system/activity-logs?${params.toString()}`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des logs d\'activité')
        return { data: [], total: 0 }
      }
      
      return response.data || { data: [], total: 0 }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return { data: [], total: 0 }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupère un log d'activité par ID
   */
  const getById = async (id: string): Promise<ActivityLog | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<ActivityLog>(`/system/activity-logs/${id}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération du log')
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
   * Enregistre une nouvelle activité
   */
  const log = async (data: CreateActivityLogData): Promise<ActivityLog | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<ActivityLog>('/system/activity-logs', data)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'enregistrement du log')
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
   * Log de création d'une ressource
   */
  const logCreate = async (
    tenantId: string | null,
    userId: string | null,
    resourceType: string,
    resourceId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog | null> => {
    return log({
      tenant_id: tenantId || undefined,
      user_id: userId || undefined,
      action: 'create',
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
  }

  /**
   * Log de modification d'une ressource
   */
  const logUpdate = async (
    tenantId: string | null,
    userId: string | null,
    resourceType: string,
    resourceId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog | null> => {
    return log({
      tenant_id: tenantId || undefined,
      user_id: userId || undefined,
      action: 'update',
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
  }

  /**
   * Log de suppression d'une ressource
   */
  const logDelete = async (
    tenantId: string | null,
    userId: string | null,
    resourceType: string,
    resourceId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog | null> => {
    return log({
      tenant_id: tenantId || undefined,
      user_id: userId || undefined,
      action: 'delete',
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
  }

  /**
   * Log de connexion utilisateur
   */
  const logLogin = async (
    tenantId: string | null,
    userId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog | null> => {
    return log({
      tenant_id: tenantId || undefined,
      user_id: userId,
      action: 'login',
      resource_type: 'user',
      resource_id: userId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
  }

  /**
   * Log de déconnexion utilisateur
   */
  const logLogout = async (
    tenantId: string | null,
    userId: string,
    details?: Record<string, unknown>,
    request?: { ip?: string, userAgent?: string }
  ): Promise<ActivityLog | null> => {
    return log({
      tenant_id: tenantId || undefined,
      user_id: userId,
      action: 'logout',
      resource_type: 'user',
      resource_id: userId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
  }

  /**
   * Récupère les logs par tenant
   */
  const getByTenant = async (tenantId: string, filter?: Omit<ActivityLogFilter, 'tenant_id'>): Promise<ActivityLogResponse> => {
    return getAll({ ...filter, tenant_id: tenantId })
  }

  /**
   * Récupère les logs par utilisateur
   */
  const getByUser = async (userId: string, filter?: Omit<ActivityLogFilter, 'user_id'>): Promise<ActivityLogResponse> => {
    return getAll({ ...filter, user_id: userId })
  }

  /**
   * Récupère les logs par ressource
   */
  const getByResource = async (
    resourceType: string, 
    resourceId: string, 
    filter?: Omit<ActivityLogFilter, 'resource_type' | 'resource_id'>
  ): Promise<ActivityLogResponse> => {
    return getAll({ 
      ...filter, 
      resource_type: resourceType, 
      resource_id: resourceId 
    })
  }

  /**
   * Supprime les anciens logs (nettoyage)
   */
  const cleanup = async (olderThanDays: number = 90): Promise<number> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.delete<{ deleted_count: number }>(`/system/activity-logs/cleanup?days=${olderThanDays}`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors du nettoyage des logs')
        return 0
      }
      
      return response.data?.deleted_count || 0
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return 0
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupère les statistiques d'activité
   */
  const getStats = async (
    tenantId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ActivityLogStats | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (tenantId) params.append('tenant_id', tenantId)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      const response = await api.get<ActivityLogStats>(`/system/activity-logs/stats?${params.toString()}`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des statistiques')
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

  return {
    loading,
    error,
    getAll,
    getById,
    log,
    logCreate,
    logUpdate,
    logDelete,
    logLogin,
    logLogout,
    getByTenant,
    getByUser,
    getByResource,
    cleanup,
    getStats
  }
}

export type { ActivityLogResponse, ActivityLogStats }