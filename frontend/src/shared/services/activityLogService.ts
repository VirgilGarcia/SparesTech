// Service de gestion des logs d'activité
// Utilise l'API backend pour toutes les opérations
export { activityLogService } from './activityLogServiceWrapper'

// Définition des types de base pour éviter les erreurs
export interface ActivityLog {
  id: string
  tenant_id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details?: any
  created_at: string
}

export interface ActivityLogFilter {
  tenant_id?: string
  user_id?: string
  action?: string
  resource_type?: string
  resource_id?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

export interface CreateActivityLogData {
  tenant_id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details?: any
}

// Service original désactivé - utiliser activityLogService via le wrapper