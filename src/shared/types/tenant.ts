// Types centralisés pour les tenants

export interface Tenant {
  id: string
  name: string
  subdomain?: string | null
  custom_domain?: string | null
  custom_domain_verified?: boolean
  owner_id: string
  subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantUser {
  tenant_id: string
  user_id: string
  role: 'admin' | 'manager' | 'employee' | 'client'
  is_active: boolean
  created_at: string
  tenant?: Tenant
}

export interface TenantSettings {
  id: string
  tenant_id: string
  company_name: string
  logo_url?: string | null
  primary_color: string
  show_prices: boolean
  show_stock: boolean
  show_categories: boolean
  public_access: boolean
  contact_email?: string | null
  contact_phone?: string | null
  created_at: string
  updated_at: string
}