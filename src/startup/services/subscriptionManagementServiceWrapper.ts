// Service wrapper pour migrer progressivement vers l'API backend
// TODO: Migrer complètement vers useStartupSubscriptionApi (déjà créé)
import { useStartupSubscriptionApi, type StartupSubscription } from '../../hooks/api/useStartupSubscriptionApi'

// Instance API pour les appels
const getApiInstance = () => useStartupSubscriptionApi()

/**
 * Service de gestion avancée des abonnements startup avec fonctions critiques migrées
 */
export const subscriptionManagementService = {
  
  /**
   * Récupérer l'abonnement actif d'un client (MIGRÉ vers API)
   */
  getActiveSubscription: async (customerId: string): Promise<StartupSubscription | null> => {
    const api = getApiInstance()
    return api.getActiveSubscription(customerId)
  },

  /**
   * Créer un abonnement (MIGRÉ vers API)
   */
  createSubscription: async (subscriptionData: {
    customer_id: string
    plan_id: string
    tenant_id: string
    billing_cycle: 'monthly' | 'yearly'
    trial_end?: string
  }): Promise<StartupSubscription> => {
    const api = getApiInstance()
    const result = await api.createSubscription(subscriptionData)
    
    if (!result) {
      throw new Error('Erreur lors de la création de l\'abonnement')
    }
    
    return result
  },

  /**
   * Mettre à jour un abonnement (MIGRÉ vers API)
   */
  updateSubscription: async (subscriptionId: string, updates: Partial<StartupSubscription>): Promise<StartupSubscription> => {
    const api = getApiInstance()
    const result = await api.updateSubscription(subscriptionId, updates)
    
    if (!result) {
      throw new Error('Erreur lors de la mise à jour de l\'abonnement')
    }
    
    return result
  },

  /**
   * Annuler un abonnement (MIGRÉ vers API)
   */
  cancelSubscription: async (subscriptionId: string): Promise<boolean> => {
    const api = getApiInstance()
    return api.cancelSubscription(subscriptionId)
  },

  /**
   * Vérifier si un utilisateur peut créer un marketplace (MIGRÉ vers API)
   */
  canCreateMarketplace: async (userId: string): Promise<boolean> => {
    const api = getApiInstance()
    return api.canCreateMarketplace(userId)
  }
}

// Service principal pour la compatibilité
export const startupSubscriptionService = subscriptionManagementService

// Export des types pour compatibilité
export type { StartupSubscription }