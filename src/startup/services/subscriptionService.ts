import { supabase } from '../../lib/supabase'

export interface StartupSubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string | null
  price_monthly: number
  price_yearly: number | null
  monthly_price: number
  yearly_price: number | null
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

export interface StartupSubscription {
  id: string
  customer_id: string
  plan_id: string
  tenant_id: string
  status: 'active' | 'cancelled' | 'expired' | 'suspended'
  billing_cycle: 'monthly' | 'yearly'
  current_period_start: string | null
  current_period_end: string | null
  trial_end: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface StartupPaymentTransaction {
  id: string
  subscription_id: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  payment_method: string
  transaction_id: string | null
  payment_data: Record<string, unknown>
  processed_at: string | null
  created_at: string
}

// Exports d'alias pour la compatibilité
export type SubscriptionPlan = StartupSubscriptionPlan
export type Subscription = StartupSubscription
export type PaymentTransaction = StartupPaymentTransaction

export const startupSubscriptionService = {
  
  /**
   * Récupère tous les plans d'abonnement actifs
   */
  getActivePlans: async (): Promise<StartupSubscriptionPlan[]> => {
    return await startupSubscriptionService.getPlans()
  },

  /**
   * Alias pour getActivePlans (compatibilité)
   */
  getPlans: async (): Promise<StartupSubscriptionPlan[]> => {
    try {
          // Retourner les plans d'abonnement configurés
      const mockPlans: StartupSubscriptionPlan[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Starter',
          display_name: 'Starter',
          description: 'Parfait pour débuter',
          price_monthly: 29,
          price_yearly: 299,
          monthly_price: 29,
          yearly_price: 299,
          yearly_discount: 17,
          is_popular: false,
          features: ['Dashboard complet', 'Gestion produits', 'Support email'],
          limits: { products: 100, orders: 50 },
          max_products: 100,
          max_orders: 50,
          max_orders_per_month: 50,
          custom_domain_allowed: false,
          priority_support: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Professional',
          display_name: 'Professional',
          description: 'Pour les entreprises en croissance',
          price_monthly: 99,
          price_yearly: 999,
          monthly_price: 99,
          yearly_price: 999,
          yearly_discount: 16,
          is_popular: true,
          features: ['Tout Starter', 'API avancée', 'Analytics', 'Support prioritaire'],
          limits: { products: 1000, orders: 500 },
          max_products: 1000,
          max_orders: 500,
          max_orders_per_month: 500,
          custom_domain_allowed: true,
          priority_support: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Enterprise',
          display_name: 'Enterprise',
          description: 'Solution complète pour grandes entreprises',
          price_monthly: 299,
          price_yearly: 2999,
          monthly_price: 299,
          yearly_price: 2999,
          yearly_discount: 16,
          is_popular: false,
          features: ['Tout Professional', 'Produits illimités', 'Support dédié', 'Domaine personnalisé'],
          limits: { products: -1, orders: -1 },
          max_products: null,
          max_orders: null,
          max_orders_per_month: null,
          custom_domain_allowed: true,
          priority_support: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      return mockPlans
    } catch (error) {
      console.error('Erreur lors de la récupération des plans:', error)
      throw error
    }
  },

  /**
   * Récupère un plan spécifique par ID
   */
  getPlanById: async (planId: string): Promise<StartupSubscriptionPlan | null> => {
    try {
      // Utiliser les données mockées pour l'instant
      const mockPlans: { [key: string]: StartupSubscriptionPlan } = {
        '550e8400-e29b-41d4-a716-446655440001': {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Starter',
          display_name: 'Starter',
          description: 'Parfait pour débuter',
          price_monthly: 29,
          price_yearly: 299,
          monthly_price: 29,
          yearly_price: 299,
          yearly_discount: 17,
          is_popular: false,
          features: ['Dashboard complet', 'Gestion produits', 'Support email'],
          limits: { products: 100, orders: 50 },
          max_products: 100,
          max_orders: 50,
          max_orders_per_month: 50,
          custom_domain_allowed: false,
          priority_support: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        '550e8400-e29b-41d4-a716-446655440002': {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Professional',
          display_name: 'Professional',
          description: 'Pour les entreprises en croissance',
          price_monthly: 99,
          price_yearly: 999,
          monthly_price: 99,
          yearly_price: 999,
          yearly_discount: 16,
          is_popular: true,
          features: ['Tout Starter', 'API avancée', 'Analytics', 'Support prioritaire'],
          limits: { products: 1000, orders: 500 },
          max_products: 1000,
          max_orders: 500,
          max_orders_per_month: 500,
          custom_domain_allowed: true,
          priority_support: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        '550e8400-e29b-41d4-a716-446655440003': {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Enterprise',
          display_name: 'Enterprise',
          description: 'Solution complète pour grandes entreprises',
          price_monthly: 299,
          price_yearly: 2999,
          monthly_price: 299,
          yearly_price: 2999,
          yearly_discount: 16,
          is_popular: false,
          features: ['Tout Professional', 'Produits illimités', 'Support dédié', 'Domaine personnalisé'],
          limits: { products: -1, orders: -1 },
          max_products: null,
          max_orders: null,
          max_orders_per_month: null,
          custom_domain_allowed: true,
          priority_support: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      return mockPlans[planId] || null
    } catch (error) {
      console.error('Erreur lors de la récupération du plan:', error)
      return null
    }
  },

  /**
   * Récupère un plan par nom
   */
  getPlanByName: async (planName: string): Promise<StartupSubscriptionPlan | null> => {
    try {
      // Utiliser les données mockées pour l'instant
      const mockPlans: StartupSubscriptionPlan[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Starter',
          display_name: 'Starter',
          description: 'Parfait pour débuter',
          price_monthly: 29,
          price_yearly: 299,
          monthly_price: 29,
          yearly_price: 299,
          yearly_discount: 17,
          is_popular: false,
          features: ['Dashboard complet', 'Gestion produits', 'Support email'],
          limits: { products: 100, orders: 50 },
          max_products: 100,
          max_orders: 50,
          max_orders_per_month: 50,
          custom_domain_allowed: false,
          priority_support: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Professional',
          display_name: 'Professional',
          description: 'Pour les entreprises en croissance',
          price_monthly: 99,
          price_yearly: 999,
          monthly_price: 99,
          yearly_price: 999,
          yearly_discount: 16,
          is_popular: true,
          features: ['Tout Starter', 'API avancée', 'Analytics', 'Support prioritaire'],
          limits: { products: 1000, orders: 500 },
          max_products: 1000,
          max_orders: 500,
          max_orders_per_month: 500,
          custom_domain_allowed: true,
          priority_support: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Enterprise',
          display_name: 'Enterprise',
          description: 'Solution complète pour grandes entreprises',
          price_monthly: 299,
          price_yearly: 2999,
          monthly_price: 299,
          yearly_price: 2999,
          yearly_discount: 16,
          is_popular: false,
          features: ['Tout Professional', 'Produits illimités', 'Support dédié', 'Domaine personnalisé'],
          limits: { products: -1, orders: -1 },
          max_products: null,
          max_orders: null,
          max_orders_per_month: null,
          custom_domain_allowed: true,
          priority_support: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      return mockPlans.find(plan => plan.name === planName) || null
    } catch (error) {
      console.error('Erreur lors de la récupération du plan:', error)
      return null
    }
  },

  /**
   * Crée un abonnement client
   */
  createSubscription: async (subscriptionData: {
    customer_id: string
    plan_id: string
    tenant_id: string
    billing_cycle: 'monthly' | 'yearly'
    trial_end?: string
  }): Promise<StartupSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .insert([{
          customer_id: subscriptionData.customer_id,
          plan_id: subscriptionData.plan_id,
          tenant_id: subscriptionData.tenant_id,
          billing_cycle: subscriptionData.billing_cycle,
          status: 'active',
          trial_end: subscriptionData.trial_end || null
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error)
      return null
    }
  },

  /**
   * Récupère l'abonnement actif d'un client
   */
  getActiveSubscription: async (customerId: string): Promise<StartupSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error)
      return null
    }
  },

  /**
   * Récupère l'abonnement par tenant_id
   */
  getSubscriptionByTenant: async (tenantId: string): Promise<StartupSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error)
      return null
    }
  },

  /**
   * Met à jour un abonnement
   */
  updateSubscription: async (
    subscriptionId: string, 
    updates: Partial<Omit<StartupSubscription, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<StartupSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', error)
      return null
    }
  },

  /**
   * Annule un abonnement
   */
  cancelSubscription: async (subscriptionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customer_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error)
      return false
    }
  },

  /**
   * Enregistre une transaction de paiement
   */
  createPaymentTransaction: async (transactionData: {
    subscription_id: string
    amount: number
    currency?: string
    payment_method: string
    transaction_id?: string
    payment_data?: Record<string, unknown>
  }): Promise<StartupPaymentTransaction | null> => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert([{
          subscription_id: transactionData.subscription_id,
          amount: transactionData.amount,
          currency: transactionData.currency || 'EUR',
          payment_method: transactionData.payment_method,
          transaction_id: transactionData.transaction_id || null,
          payment_data: transactionData.payment_data || null,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la transaction:', error)
      return null
    }
  },

  /**
   * Met à jour le statut d'une transaction
   */
  updateTransactionStatus: async (
    transactionId: string, 
    status: StartupPaymentTransaction['status'],
    processedAt?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ 
          status, 
          processed_at: processedAt || new Date().toISOString() 
        })
        .eq('id', transactionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error)
      return false
    }
  },

  /**
   * Récupère les transactions d'un abonnement
   */
  getSubscriptionTransactions: async (subscriptionId: string): Promise<StartupPaymentTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error)
      return []
    }
  },

  /**
   * Récupère les statistiques des abonnements
   */
  getSubscriptionStats: async (): Promise<{
    totalSubscriptions: number
    activeSubscriptions: number
    totalMRR: number
    totalARR: number
    planBreakdown: { [key: string]: number }
  }> => {
    try {
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select(`
          *,
          subscription_plans(name, price_monthly, price_yearly)
        `)

      if (error) throw error

      const subscriptions = data || []
      const active = subscriptions.filter((sub: Record<string, unknown>) => sub.status === 'active')
      
      let totalMRR = 0
      let totalARR = 0
      const planBreakdown: { [key: string]: number } = {}

      active.forEach((sub: Record<string, unknown>) => {
        if (sub.subscription_plans) {
          const plans = sub.subscription_plans as Record<string, unknown>
          const planName = plans.name as string
          planBreakdown[planName] = (planBreakdown[planName] || 0) + 1
          
          if (sub.billing_cycle === 'monthly') {
            totalMRR += plans.price_monthly as number
            totalARR += (plans.price_monthly as number) * 12
          } else if (sub.billing_cycle === 'yearly' && plans.price_yearly) {
            totalMRR += (plans.price_yearly as number) / 12
            totalARR += plans.price_yearly as number
          }
        }
      })

      return {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: active.length,
        totalMRR,
        totalARR,
        planBreakdown
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalMRR: 0,
        totalARR: 0,
        planBreakdown: {}
      }
    }
  },

  /**
   * Vérifie si un abonnement permet une fonctionnalité
   */
  checkFeatureAccess: async (tenantId: string, feature: string): Promise<boolean> => {
    try {
      const subscription = await startupSubscriptionService.getSubscriptionByTenant(tenantId)
      if (!subscription) return false

      const plan = await startupSubscriptionService.getPlanById(subscription.plan_id)
      if (!plan) return false

      // Vérifier les fonctionnalités spécifiques
      switch (feature) {
        case 'custom_domain':
          return plan.custom_domain_allowed
        case 'priority_support':
          return plan.priority_support
        case 'unlimited_products':
          return plan.max_products === null
        case 'unlimited_orders':
          return plan.max_orders === null
        default:
          return plan.features.includes(feature)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des fonctionnalités:', error)
      return false
    }
  }
}

// Export d'alias pour la compatibilité
export const subscriptionService = startupSubscriptionService