// Types centralisés pour les tenants

export interface Tenant {
  id: string
  name: string
  subdomain?: string
  subscription_status: 'active' | 'inactive' | 'trial'
  created_at: string
  updated_at: string
}

export interface TenantUser {
  tenant_id: string
  user_id: string
  role: 'admin' | 'client'
  created_at: string
  tenant?: Tenant
}