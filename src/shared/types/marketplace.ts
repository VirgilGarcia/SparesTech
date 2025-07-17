export interface MarketplaceCreationRequest {
  // Informations de l'entreprise
  company_name: string
  admin_first_name: string
  admin_last_name: string
  admin_email: string
  admin_password: string
  
  // Configuration du marketplace
  subdomain: string
  custom_domain?: string
  public_access: boolean
  primary_color?: string
}

export interface TenantCreationResult {
  tenant_id: string
  admin_user_id: string
  marketplace_url: string
  admin_login_url: string
  success: boolean
  errors?: string[]
}

export interface DomainInfo {
  isMainSite: boolean
  subdomain: string | null
  customDomain: string | null
  tenantId: string | null
  hostname: string
}