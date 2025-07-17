import { supabase } from '../../lib/supabase'

export interface StartupSubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string | null
  price_monthly: number
  price_yearly: number | null
  features: string[]
  max_products: number | null
  max_orders: number | null
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
  payment_data: any
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
    try {
      const { data, error } = await supabase
        .from('startup.subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) throw error
      return data || []
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
      const { data, error } = await supabase
        .from('startup.subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) throw error
      return data
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
      const { data, error } = await supabase
        .from('startup.subscription_plans')
        .select('*')
        .eq('name', planName)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
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
        .from('startup.subscriptions')
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
        .from('startup.subscriptions')
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
        .from('startup.subscriptions')
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
        .from('startup.subscriptions')
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
        .from('startup.subscriptions')
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
    payment_data?: any
  }): Promise<StartupPaymentTransaction | null> => {
    try {
      const { data, error } = await supabase
        .from('startup.payment_transactions')
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
        .from('startup.payment_transactions')
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
        .from('startup.payment_transactions')
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
        .from('startup.subscriptions')
        .select(`
          *,
          plan:startup.subscription_plans(name, price_monthly, price_yearly)
        `)

      if (error) throw error

      const subscriptions = data || []
      const active = subscriptions.filter(sub => sub.status === 'active')
      
      let totalMRR = 0
      let totalARR = 0
      const planBreakdown: { [key: string]: number } = {}

      active.forEach(sub => {
        if (sub.plan) {
          const planName = sub.plan.name
          planBreakdown[planName] = (planBreakdown[planName] || 0) + 1
          
          if (sub.billing_cycle === 'monthly') {
            totalMRR += sub.plan.price_monthly
            totalARR += sub.plan.price_monthly * 12
          } else if (sub.billing_cycle === 'yearly' && sub.plan.price_yearly) {
            totalMRR += sub.plan.price_yearly / 12
            totalARR += sub.plan.price_yearly
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