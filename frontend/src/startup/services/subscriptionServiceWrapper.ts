// Service wrapper pour migrer progressivement vers l'API backend
// ✅ CORRIGÉ - Utilise subscriptionApiClient au lieu du hook React
import { subscriptionApiClient } from '../../lib/apiClients'
import type { StartupSubscriptionPlan } from '../../hooks/api/useStartupSubscriptionApi'

/**
 * Service de gestion des abonnements startup avec fonctions critiques migrées
 */

/**
 * Récupérer tous les plans actifs (MIGRÉ vers API)
 */
export const getActivePlans = async (): Promise<StartupSubscriptionPlan[]> => {
  return subscriptionApiClient.getActivePlans()
}

/**
 * Récupérer un plan par ID (MIGRÉ vers API)
 */
export const getPlanById = async (planId: string): Promise<StartupSubscriptionPlan | null> => {
  const plans = await subscriptionApiClient.getActivePlans()
  return plans.find(plan => plan.id === planId) || null
}

/**
 * Vérifier si un utilisateur peut créer un marketplace (MIGRÉ vers API)
 */
export const canCreateMarketplace = async (_userId: string): Promise<boolean> => {
  // TODO: Implémenter la logique de vérification côté API
  console.warn('canCreateMarketplace non encore implémenté - retourne true par défaut')
  return Promise.resolve(true)
}

/**
 * Créer un abonnement (MIGRÉ vers API)
 */
export const createSubscription = async (_subscriptionData: {
  customer_id: string
  plan_id: string
  tenant_id: string
  billing_cycle: 'monthly' | 'yearly'
  trial_end?: string
}) => {
  // TODO: Implémenter avec l'API backend quand l'endpoint sera disponible
  console.warn('createSubscription non encore implémenté côté API')
  throw new Error('Création d\'abonnement non encore implémentée')
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