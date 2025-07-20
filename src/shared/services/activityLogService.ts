// Service de gestion des logs d'activité
// Utilise l'API backend pour toutes les opérations
export { activityLogService } from './activityLogServiceWrapper'

// Re-export des types pour compatibilité
export type {
  ActivityLog,
  ActivityLogFilter,
  CreateActivityLogData
} from '../types/system'

// Service original maintenu pour compatibilité mais non utilisé
const _originalActivityLogService = {
  
  /**
   * Récupère tous les logs d'activité avec filtres
   */
  getAll: async (filter?: ActivityLogFilter): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
      
      if (filter?.tenant_id) {
        query = query.eq('tenant_id', filter.tenant_id)
      }
      
      if (filter?.user_id) {
        query = query.eq('user_id', filter.user_id)
      }
      
      if (filter?.action) {
        query = query.eq('action', filter.action)
      }
      
      if (filter?.resource_type) {
        query = query.eq('resource_type', filter.resource_type)
      }
      
      if (filter?.resource_id) {
        query = query.eq('resource_id', filter.resource_id)
      }
      
      if (filter?.start_date) {
        query = query.gte('created_at', filter.start_date)
      }
      
      if (filter?.end_date) {
        query = query.lte('created_at', filter.end_date)
      }
      
      // Pagination
      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1)
      } else if (filter?.limit) {
        query = query.limit(filter.limit)
      } else {
        query = query.limit(100) // Limite par défaut
      }
      
      query = query.order('created_at', { ascending: false })
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      return {
        data: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des logs d\'activité:', error)
      throw new Error('Impossible de récupérer les logs d\'activité')
    }
  },

  /**
   * Récupère un log d'activité par ID
   */
  getById: async (id: string): Promise<ActivityLog | null> => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération du log:', error)
      throw new Error('Impossible de récupérer le log d\'activité')
    }
  },

  /**
   * Enregistre une nouvelle activité
   */
  log: async (data: CreateActivityLogData): Promise<ActivityLog> => {
    try {
      const { data: log, error } = await supabase
        .from('activity_logs')
        .insert({
          tenant_id: data.tenant_id || null,
          user_id: data.user_id || null,
          action: data.action,
          resource_type: data.resource_type || null,
          resource_id: data.resource_id || null,
          details: data.details || null,
          ip_address: data.ip_address || null,
          user_agent: data.user_agent || null
        })
        .select()
        .single()
      
      if (error) throw error
      
      return log
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log:', error)
      throw new Error('Impossible d\'enregistrer le log d\'activité')
    }
  },

  /**
   * Raccourcis pour les actions courantes
   */
  
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
    return activityLogService.log({
      tenant_id: tenantId || undefined,
      user_id: userId || undefined,
      action: 'create',
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
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
    return activityLogService.log({
      tenant_id: tenantId || undefined,
      user_id: userId || undefined,
      action: 'update',
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
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
    return activityLogService.log({
      tenant_id: tenantId || undefined,
      user_id: userId || undefined,
      action: 'delete',
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
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
    return activityLogService.log({
      tenant_id: tenantId || undefined,
      user_id: userId,
      action: 'login',
      resource_type: 'user',
      resource_id: userId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
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
    return activityLogService.log({
      tenant_id: tenantId || undefined,
      user_id: userId,
      action: 'logout',
      resource_type: 'user',
      resource_id: userId,
      details,
      ip_address: request?.ip,
      user_agent: request?.userAgent
    })
  },

  /**
   * Récupère les logs par tenant
   */
  getByTenant: async (tenantId: string, filter?: Omit<ActivityLogFilter, 'tenant_id'>): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    return activityLogService.getAll({ ...filter, tenant_id: tenantId })
  },

  /**
   * Récupère les logs par utilisateur
   */
  getByUser: async (userId: string, filter?: Omit<ActivityLogFilter, 'user_id'>): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    return activityLogService.getAll({ ...filter, user_id: userId })
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
    return activityLogService.getAll({ 
      ...filter, 
      resource_type: resourceType, 
      resource_id: resourceId 
    })
  },

  /**
   * Supprime les anciens logs (nettoyage)
   */
  cleanup: async (olderThanDays: number = 90): Promise<number> => {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
      
      const { data, error } = await supabase
        .from('activity_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id')
      
      if (error) throw error
      
      return data?.length || 0
    } catch (error) {
      console.error('Erreur lors du nettoyage des logs:', error)
      throw new Error('Impossible de nettoyer les logs d\'activité')
    }
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
    try {
      const filter: ActivityLogFilter = {}
      
      if (tenantId) filter.tenant_id = tenantId
      if (startDate) filter.start_date = startDate
      if (endDate) filter.end_date = endDate
      
      const { data: logs } = await activityLogService.getAll({ ...filter, limit: 10000 })
      
      const actionBreakdown: Record<string, number> = {}
      const resourceBreakdown: Record<string, number> = {}
      const userBreakdown: Record<string, number> = {}
      const dailyActivity: Record<string, number> = {}
      
      for (const log of logs) {
        // Actions
        actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1
        
        // Resources
        if (log.resource_type) {
          resourceBreakdown[log.resource_type] = (resourceBreakdown[log.resource_type] || 0) + 1
        }
        
        // Users
        if (log.user_id) {
          userBreakdown[log.user_id] = (userBreakdown[log.user_id] || 0) + 1
        }
        
        // Daily activity
        const date = log.created_at.split('T')[0]
        dailyActivity[date] = (dailyActivity[date] || 0) + 1
      }
      
      return {
        totalLogs: logs.length,
        actionBreakdown,
        resourceBreakdown,
        userBreakdown,
        dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
          date,
          count
        })).sort((a, b) => a.date.localeCompare(b.date))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw new Error('Impossible de récupérer les statistiques d\'activité')
    }
  }
}