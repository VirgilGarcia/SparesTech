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
      return result.available
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
      const result = await api.checkCustomDomainAvailability(domain)
      return result.available
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
   * Crée une nouvelle marketplace (MIGRÉ vers API)
   */
  createMarketplace: async (request: MarketplaceCreationRequest): Promise<TenantCreationResult> => {
    try {
      const api = useMarketplaceApi()
      return api.createMarketplace(request)
    } catch (error) {
      console.error('Erreur lors de la création de la marketplace:', error)
      throw error
    }
  }
}

// Re-export des types pour compatibilité
export type { MarketplaceCreationRequest, TenantCreationResult }