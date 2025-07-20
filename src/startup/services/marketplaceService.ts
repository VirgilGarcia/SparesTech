// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du hook API marketplace qui gère toutes ces fonctionnalités
import { useMarketplaceApi } from '../../hooks/api/useMarketplaceApi'
import type { MarketplaceCreationRequest as SharedMarketplaceCreationRequest } from '../../shared/types/marketplace'

export interface MarketplaceCreationResult {
  success: boolean
  tenant_id?: string
  marketplace_url?: string
  admin_login_url?: string
  subscription_id?: string
  error?: string
}

export const startupMarketplaceService = {
  
  /**
   * Créer un client startup (MIGRÉ vers API)
   */
  createCustomer: async (customerData: {
    id: string
    email: string
    first_name: string
    last_name: string
    company_name: string
  }): Promise<any> => {
    try {
      // Utiliser le service customer qui est déjà migré
      const { startupCustomerService } = await import('./customerServiceWrapper')
      return startupCustomerService.createCustomer(customerData)
    } catch (error) {
      console.error('Erreur lors de la création du client:', error)
      throw error
    }
  },

  /**
   * Créer une marketplace complète (MIGRÉ vers API)
   */
  createMarketplace: async (request: SharedMarketplaceCreationRequest): Promise<MarketplaceCreationResult> => {
    try {
      const api = useMarketplaceApi()
      return api.createMarketplace(request)
    } catch (error) {
      console.error('Erreur lors de la création de la marketplace:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }
}

// Export des types pour compatibilité
export type { MarketplaceCreationResult }