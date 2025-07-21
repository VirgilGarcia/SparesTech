// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du hook API marketplace qui gère toutes ces fonctionnalités
import { useMarketplaceApi } from '../../hooks/api/useMarketplaceApi'
import type { MarketplaceCreationRequest as SharedMarketplaceCreationRequest } from '../../shared/types/marketplace'

export interface StartupMarketplaceCreationResult {
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
  createMarketplace: async (request: SharedMarketplaceCreationRequest): Promise<StartupMarketplaceCreationResult> => {
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
      if (result) {
        return {
          success: true,
          tenant_id: result.tenant_id,
          marketplace_url: result.marketplace_url,
          admin_login_url: result.admin_login_url,
          subscription_id: result.subscription_id
        }
      }
      return {
        success: false,
        error: 'Création échouée'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la marketplace:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }
}

// Les types sont déjà exportés via l'interface ci-dessus