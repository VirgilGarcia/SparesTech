// Service wrapper pour les logs d'activité
// TODO: Implémenter les hooks API correspondants quand nécessaire

import type {
  ActivityLog,
  ActivityLogFilter,
  CreateActivityLogData
} from '../types/system'

export const activityLogService = {
  // Toutes les méthodes sont désactivées pour éviter les appels Supabase directs
  // TODO: Migrer vers des hooks API dédiés quand ce module sera prioritaire
  
  getAll: async (_filter?: ActivityLogFilter): Promise<{
    data: ActivityLog[]
    total: number
  }> => {
    console.warn('Service de logs d\'activité non encore migré vers l\'API - retour de données vides')
    return { data: [], total: 0 }
  },

  getById: async (_id: string): Promise<ActivityLog | null> => {
    console.warn('Service de logs d\'activité non encore migré vers l\'API - retour de données vides')
    return null
  },

  create: async (data: CreateActivityLogData): Promise<ActivityLog> => {
    console.warn('Service de logs d\'activité non encore migré vers l\'API - création ignorée')
    return {
      id: 'temp-id',
      tenant_id: data.tenant_id || null,
      user_id: data.user_id || null,
      action: data.action,
      resource_type: data.resource_type || null,
      resource_id: data.resource_id || null,
      details: data.details || null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
      created_at: new Date().toISOString()
    }
  },

  deleteOld: async (_days: number): Promise<number> => {
    console.warn('Service de logs d\'activité non encore migré vers l\'API - suppression ignorée')
    return 0
  },

  // Méthodes de logging spécialisées
  logUserAction: async (userId: string, action: string, details?: Record<string, unknown>): Promise<void> => {
    console.log(`[LOG] User ${userId} performed: ${action}`, details)
  },

  logTenantAction: async (tenantId: string, action: string, details?: Record<string, unknown>): Promise<void> => {
    console.log(`[LOG] Tenant ${tenantId} action: ${action}`, details)
  },

  logSystemAction: async (action: string, details?: Record<string, unknown>): Promise<void> => {
    console.log(`[LOG] System action: ${action}`, details)
  }
}