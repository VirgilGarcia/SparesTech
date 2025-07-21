// Service de gestion des abonnements startup
export {
  startupSubscriptionService as subscriptionService,
  subscriptionManagementService
} from './subscriptionManagementServiceWrapper'

// Re-export des types pour compatibilité - utiliser les types du hook API
export type { StartupSubscription } from './subscriptionManagementServiceWrapper'

// Interface pour les plans (conservée pour compatibilité)
export interface StartupSubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string | null
  price_monthly: number
  price_yearly: number | null
  yearly_discount?: number
  is_popular?: boolean
  features: string[]
  limits?: Record<string, unknown>
  max_products: number | null
  max_orders: number | null
  max_orders_per_month: number | null
  custom_domain_allowed: boolean
  priority_support: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}