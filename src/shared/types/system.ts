// Types pour les paramètres système et les logs d'activité

export interface SystemSettings {
  id: string
  key: string
  value: string | number | boolean | Record<string, unknown>
  description: string | null
  type: 'string' | 'number' | 'boolean' | 'json'
  is_public: boolean
  category: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  tenant_id: string | null
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
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
  limit?: number
  offset?: number
}

export interface SystemSettingsFilter {
  key?: string
  category?: string
  is_public?: boolean
  type?: SystemSettings['type']
}

export interface CreateSystemSettingsData {
  key: string
  value: string | number | boolean | Record<string, unknown>
  description?: string
  type: 'string' | 'number' | 'boolean' | 'json'
  is_public?: boolean
  category?: string
}

export interface UpdateSystemSettingsData {
  value?: string | number | boolean | Record<string, unknown>
  description?: string
  is_public?: boolean
  category?: string
}

export interface CreateActivityLogData {
  tenant_id?: string
  user_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
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