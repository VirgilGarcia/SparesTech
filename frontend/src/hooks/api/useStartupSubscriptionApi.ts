import { useState } from 'react'
import { api } from '../../lib/api'

// Types des plans d'abonnement startup
interface StartupSubscriptionPlan {
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

interface StartupSubscription {
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

export function useStartupSubscriptionApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupérer tous les plans actifs
   */
  const getActivePlans = async (): Promise<StartupSubscriptionPlan[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<StartupSubscriptionPlan[]>('/startup/subscription/plans?active=true')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des plans')
        return []
      }
      
      return response.data || []
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupérer un plan par ID
   */
  const getPlanById = async (planId: string): Promise<StartupSubscriptionPlan | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<StartupSubscriptionPlan>(`/startup/subscription/plans/${planId}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération du plan')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Créer un abonnement
   */
  const createSubscription = async (subscriptionData: {
    customer_id: string
    plan_id: string
    tenant_id: string
    billing_cycle: 'monthly' | 'yearly'
    trial_end?: string
  }): Promise<StartupSubscription | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<StartupSubscription>('/startup/subscription/subscriptions', subscriptionData)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création de l\'abonnement')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupérer l'abonnement actif d'un client
   */
  const getActiveSubscription = async (customerId: string): Promise<StartupSubscription | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<StartupSubscription>(`/startup/subscription/subscriptions/active?customer_id=${customerId}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération de l\'abonnement')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Mettre à jour un abonnement
   */
  const updateSubscription = async (subscriptionId: string, updates: Partial<StartupSubscription>): Promise<StartupSubscription | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<StartupSubscription>(`/startup/subscription/subscriptions/${subscriptionId}`, updates)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour de l\'abonnement')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Annuler un abonnement
   */
  const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put(`/startup/subscription/subscriptions/${subscriptionId}/cancel`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'annulation de l\'abonnement')
        return false
      }
      
      return true
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Vérifier si un utilisateur peut créer un nouveau marketplace
   */
  const canCreateMarketplace = async (userId: string): Promise<boolean> => {
    try {
      const response = await api.get<{ can_create: boolean }>(`/startup/subscription/can-create-marketplace?user_id=${userId}`)
      
      if (!response.success) {
        return false
      }
      
      return response.data?.can_create || false
    } catch (err: any) {
      return false
    }
  }

  return {
    loading,
    error,
    getActivePlans,
    getPlanById,
    createSubscription,
    getActiveSubscription,
    updateSubscription,
    cancelSubscription,
    canCreateMarketplace
  }
}

export type { StartupSubscriptionPlan, StartupSubscription }