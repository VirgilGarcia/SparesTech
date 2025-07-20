import { api } from '../../lib/api'
import type { DomainInfo } from '../../shared/types/marketplace'

export function useDomainApi() {
  /**
   * Résout le tenant_id basé sur le domaine via l'API backend
   */
  const resolveTenantFromDomain = async (domainInfo: DomainInfo): Promise<string | null> => {
    if (domainInfo.isMainSite) {
      return null
    }
    
    try {
      let endpoint = '/saas/tenant/resolve'
      const params = new URLSearchParams()
      
      // Recherche par sous-domaine
      if (domainInfo.subdomain) {
        params.append('subdomain', domainInfo.subdomain)
      }
      // Recherche par domaine personnalisé
      else if (domainInfo.customDomain) {
        params.append('custom_domain', domainInfo.customDomain)
      }
      else {
        return null
      }
      
      const response = await api.get<{ tenant_id: string }>(`${endpoint}?${params.toString()}`)
      
      if (!response.success || !response.data) {
        console.warn('❌ Aucun tenant trouvé pour le domaine:', domainInfo)
        return null
      }
      
      return response.data.tenant_id
      
    } catch (error) {
      console.error('❌ Erreur lors de la résolution du tenant:', error)
      return null
    }
  }

  return {
    resolveTenantFromDomain
  }
}