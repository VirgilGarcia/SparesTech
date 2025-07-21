export interface MarketplaceCreationRequest {
  // Informations de l'entreprise
  company_name: string
  admin_first_name: string
  admin_last_name: string
  admin_email: string
  admin_password: string
  admin_user_id?: string // ID de l'utilisateur startup propriétaire
  
  // Configuration du marketplace
  subdomain: string
  custom_domain?: string
  public_access: boolean
  primary_color?: string
  prospectId?: string
  
  // Plan de subscription (optionnel pour appliquer les limites)
  subscription_plan?: {
    id: string
    name: string
    features: any[]
    limits: any
    custom_domain_allowed: boolean
  }
}

export interface TenantCreationResult {
  tenant_id: string
  admin_user_id: string
  marketplace_url: string
  admin_login_url: string
  success: boolean
  error?: string
  errors?: string[]
  url?: string
  company_name?: string
  admin_email?: string
}

export interface DomainInfo {
  isMainSite: boolean
  subdomain: string | null
  customDomain: string | null
  tenantId: string | null
  hostname: string
}