import { useState } from 'react'
import { api } from '../../lib/api'

// Types pour les API marketplace
interface MarketplaceCreationRequest {
  company_name: string
  admin_first_name: string
  admin_last_name: string
  admin_email: string
  subdomain: string
  custom_domain?: string
  public_access: boolean
  primary_color?: string
  plan_id: string
  billing_cycle: 'monthly' | 'yearly'
}

interface MarketplaceCreationResult {
  tenant_id: string
  subscription_id: string
  marketplace_url: string
  admin_login_url: string
}

interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description?: string
  price_monthly: number
  price_yearly?: number
  features: any[]
  limits: Record<string, any>
  custom_domain_allowed: boolean
  priority_support: boolean
  is_active: boolean
  is_popular?: boolean
}

export function useMarketplaceApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupérer tous les plans disponibles
   */
  const getPlans = async (): Promise<SubscriptionPlan[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<SubscriptionPlan[]>('/startup/marketplace/plans')
      
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
   * Récupérer un plan spécifique
   */
  const getPlan = async (planId: string): Promise<SubscriptionPlan | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<SubscriptionPlan>(`/startup/marketplace/plans/${planId}`)
      
      if (!response.success) {
        setError(response.error || 'Plan non trouvé')
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
   * Vérifier la disponibilité d'un sous-domaine
   */
  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    try {
      const response = await api.post<boolean>('/startup/marketplace/check-subdomain', {
        subdomain
      })
      
      return response.success && response.data === true
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification')
      return false
    }
  }

  /**
   * Générer des suggestions de sous-domaines
   */
  const generateSubdomainSuggestions = async (baseName: string): Promise<string[]> => {
    try {
      const response = await api.post<string[]>('/startup/marketplace/suggest-subdomains', {
        base_name: baseName
      })
      
      if (!response.success) {
        return []
      }
      
      return response.data || []
    } catch (err: any) {
      return []
    }
  }

  /**
   * Créer un marketplace complet
   */
  const createMarketplace = async (data: MarketplaceCreationRequest): Promise<MarketplaceCreationResult | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<MarketplaceCreationResult>('/startup/marketplace/create', data)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création du marketplace')
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
   * Récupérer mes marketplaces
   */
  const getMyMarketplaces = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/startup/marketplace/my-marketplaces')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération')
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
   * Récupérer ma subscription active
   */
  const getActiveSubscription = async () => {
    try {
      const response = await api.get('/startup/marketplace/subscriptions/active')
      
      if (!response.success) {
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      return null
    }
  }

  return {
    loading,
    error,
    getPlans,
    getPlan,
    checkSubdomainAvailability,
    generateSubdomainSuggestions,
    createMarketplace,
    getMyMarketplaces,
    getActiveSubscription
  }
}

export type { MarketplaceCreationRequest, MarketplaceCreationResult, SubscriptionPlan }