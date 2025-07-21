import { useState } from 'react'
import { api } from '../../lib/api'

interface MarketplaceSettings {
  id: string
  tenant_id: string
  company_name: string
  primary_color: string
  logo_url?: string
  subdomain?: string
  custom_domain?: string
  public_access: boolean
  show_prices: boolean
  show_stock: boolean
  show_categories: boolean
  created_at: string
  updated_at: string
}

export function useSettingsApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupérer les paramètres du marketplace actuel
   */
  const getSettings = async (): Promise<MarketplaceSettings | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<MarketplaceSettings>('/saas/settings')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des paramètres')
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
   * Récupérer les paramètres publics (pour les utilisateurs non connectés)
   */
  const getPublicSettings = async (): Promise<MarketplaceSettings | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<MarketplaceSettings>('/saas/settings/public')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des paramètres publics')
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
   * Mettre à jour les paramètres
   */
  const updateSettings = async (updates: Partial<MarketplaceSettings>): Promise<MarketplaceSettings | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<MarketplaceSettings>('/saas/settings', updates)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour')
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
   * Upload du logo
   */
  const uploadLogo = async (file: File): Promise<string | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('logo', file)
      
      const response = await api.request<{ logo_url: string }>('/saas/settings/logo', {
        method: 'POST',
        body: formData,
        headers: {} // Laisser le navigateur définir le Content-Type pour FormData
      })
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'upload du logo')
        return null
      }
      
      return response.data?.logo_url || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupérer les paramètres d'un admin spécifique (pour la migration)
   */
  const getAdminSettings = async (): Promise<MarketplaceSettings | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<MarketplaceSettings>('/saas/settings/admin')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des paramètres admin')
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

  return {
    loading,
    error,
    getSettings,
    getPublicSettings,
    updateSettings,
    uploadLogo,
    getAdminSettings
  }
}

export type { MarketplaceSettings }