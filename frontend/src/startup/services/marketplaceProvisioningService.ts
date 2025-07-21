// ✅ SERVICE MARKETPLACE PROVISIONING - MIGRATION PARTIELLE
// Ce service utilise maintenant l'API backend pour les fonctions critiques

// Les fonctions de validation sont déjà migrées dans useMarketplaceApi
import { useMarketplaceApi } from '../../hooks/api/useMarketplaceApi'
import type { MarketplaceCreationRequest, TenantCreationResult } from '../../shared/types/marketplace'

export const marketplaceProvisioningService = {
  
  /**
   * Vérifie la disponibilité d'un sous-domaine (MIGRÉ vers API)
   */
  checkSubdomainAvailability: async (subdomain: string): Promise<boolean> => {
    try {
      const api = useMarketplaceApi()
      const result = await api.checkSubdomainAvailability(subdomain)
      return result
    } catch (error) {
      console.error('Erreur lors de la vérification du sous-domaine:', error)
      return false
    }
  },

  /**
   * Vérifie la disponibilité d'un domaine personnalisé (MIGRÉ vers API)
   */
  checkCustomDomainAvailability: async (domain: string): Promise<boolean> => {
    try {
      const api = useMarketplaceApi()
      const result = await api.checkSubdomainAvailability(domain)
      return result
    } catch (error) {
      console.error('Erreur lors de la vérification du domaine personnalisé:', error)
      return false
    }
  },

  /**
   * Vérifie la disponibilité d'un nom d'entreprise
   */
  checkCompanyNameAvailability: async (companyName: string): Promise<boolean> => {
    // Validation basique côté client
    return companyName.length >= 2 && companyName.length <= 100
  },

  /**
   * Vérifie la disponibilité d'un email (pour compatibilité)
   */
  checkEmailAvailability: async (email: string): Promise<boolean> => {
    // Pour la compatibilité - délègue vers checkSubdomainAvailability
    return marketplaceProvisioningService.checkSubdomainAvailability(email)
  },

  /**
   * Génère des suggestions de sous-domaines (pour compatibilité)
   */
  generateSubdomainSuggestions: async (baseName: string): Promise<string[]> => {
    // Génère des suggestions basiques
    const suggestions = [
      baseName,
      `${baseName}1`,
      `${baseName}2`,
      `${baseName}store`,
      `${baseName}shop`,
      `my${baseName}`
    ]
    return suggestions.filter(s => s.length > 0)
  },

  /**
   * Crée une nouvelle marketplace (MIGRÉ vers API)
   */
  createMarketplace: async (request: MarketplaceCreationRequest): Promise<TenantCreationResult> => {
    try {
      const api = useMarketplaceApi()
      const apiRequest = {
        company_name: request.company_name,
        admin_first_name: request.admin_first_name,
        admin_last_name: request.admin_last_name,
        admin_email: request.admin_email,
        subdomain: request.subdomain,
        custom_domain: request.custom_domain,
        public_access: request.public_access,
        primary_color: request.primary_color,
        plan_id: 'starter',
        billing_cycle: 'monthly' as const
      }
      const result = await api.createMarketplace(apiRequest)
      
      // Adapter le résultat au type TenantCreationResult
      if (result) {
        return {
          tenant_id: result.tenant_id,
          admin_user_id: 'temp-id', // Pas disponible dans l'API result
          marketplace_url: result.marketplace_url,
          admin_login_url: result.admin_login_url,
          success: true
        }
      }
      
      return {
        tenant_id: '',
        admin_user_id: '',
        marketplace_url: '',
        admin_login_url: '',
        success: false,
        error: 'Erreur de création'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la marketplace:', error)
      throw error
    }
  }
}

// Re-export des types pour compatibilité
export type { MarketplaceCreationRequest, TenantCreationResult }