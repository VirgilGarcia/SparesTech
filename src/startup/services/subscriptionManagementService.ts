// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du wrapper qui utilise l'API backend
export {
  subscriptionManagementService,
  startupSubscriptionService
} from './subscriptionManagementServiceWrapper'
export type { StartupSubscription } from './subscriptionManagementServiceWrapper'

// Import du type depuis le service principal pour compatibilité
import type { StartupSubscriptionPlan } from './subscriptionService'

// Re-export des types pour compatibilité
export type { StartupSubscriptionPlan }