// Service wrapper pour migrer progressivement vers l'API backend
// TODO: Migrer complètement vers useStartupSubscriptionApi
import { useStartupSubscriptionApi, type StartupSubscriptionPlan } from '../../hooks/api/useStartupSubscriptionApi'

/**
 * Wrapper pour maintenir la compatibilité pendant la migration
 * Les fonctions critiques passent par l'API, les autres gardent l'ancien comportement temporairement
 */

// Instance API pour les appels
const getApiInstance = () => useStartupSubscriptionApi()

/**
 * Récupérer tous les plans actifs (MIGRÉ vers API)
 */
export const getActivePlans = async (): Promise<StartupSubscriptionPlan[]> => {
  const api = getApiInstance()
  return api.getActivePlans()
}

/**
 * Récupérer un plan par ID (MIGRÉ vers API)
 */
export const getPlanById = async (planId: string): Promise<StartupSubscriptionPlan | null> => {
  const api = getApiInstance()
  return api.getPlanById(planId)
}

/**
 * Vérifier si un utilisateur peut créer un marketplace (MIGRÉ vers API)
 */
export const canCreateMarketplace = async (userId: string): Promise<boolean> => {
  const api = getApiInstance()
  return api.canCreateMarketplace(userId)
}

/**
 * Créer un abonnement (MIGRÉ vers API)
 */
export const createSubscription = async (subscriptionData: {
  customer_id: string
  plan_id: string
  tenant_id: string
  billing_cycle: 'monthly' | 'yearly'
  trial_end?: string
}) => {
  const api = getApiInstance()
  const result = await api.createSubscription(subscriptionData)
  if (!result) {
    throw new Error('Erreur lors de la création de l\'abonnement')
  }
  return result
}

/**
 * Service de subscription startup avec fonctions critiques migrées
 */
export const startupSubscriptionService = {
  getActivePlans,
  getPlanById,
  canCreateMarketplace,
  createSubscription,
  
  // TODO: Migrer ces fonctions vers l'API backend
  // En attendant, elles gardent l'ancien comportement (import direct du service original si nécessaire)
  
  // Les autres fonctions non-critiques peuvent rester en legacy temporairement
  // ou être importées depuis l'ancien service si nécessaire
}

// Export des types pour compatibilité
export type { StartupSubscriptionPlan } from '../../hooks/api/useStartupSubscriptionApi'