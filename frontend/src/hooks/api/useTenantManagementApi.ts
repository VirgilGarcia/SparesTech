import { useState } from 'react'
import { api } from '../../lib/api'

interface Tenant {
  id: string
  name: string
  subdomain?: string
  custom_domain?: string
  owner_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
}

interface InitializeTenantData {
  name: string
  owner_id: string
  admin_user_id: string
  admin_email: string
  admin_company_name: string
}

export function useTenantManagementApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Initialiser un tenant complet avec utilisateur admin
   */
  const initializeTenant = async (tenantData: InitializeTenantData): Promise<Tenant | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<Tenant>('/saas/tenant/initialize', tenantData)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'initialisation du tenant')
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
   * Créer un tenant simple
   */
  const createTenant = async (tenantData: {
    name: string
    owner_id: string
    subdomain?: string
    custom_domain?: string
  }): Promise<Tenant | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<Tenant>('/saas/tenant', tenantData)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création du tenant')
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
   * Récupérer un tenant par ID
   */
  const getTenantById = async (tenantId: string): Promise<Tenant | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<Tenant>(`/saas/tenant/${tenantId}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération du tenant')
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
   * Récupérer un tenant par domaine
   */
  const getTenantByDomain = async (domain: string): Promise<Tenant | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<Tenant>(`/saas/tenant/by-domain?domain=${encodeURIComponent(domain)}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération du tenant')
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
   * Ajouter un utilisateur à un tenant
   */
  const addUserToTenant = async (tenantId: string, userId: string, role: 'admin' | 'user' = 'user'): Promise<TenantUser | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<TenantUser>(`/saas/tenant/${tenantId}/users`, {
        user_id: userId,
        role
      })
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'ajout de l\'utilisateur au tenant')
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
   * Récupérer les utilisateurs d'un tenant
   */
  const getTenantUsers = async (tenantId: string): Promise<TenantUser[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<TenantUser[]>(`/saas/tenant/${tenantId}/users`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des utilisateurs')
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
   * Mettre à jour un tenant
   */
  const updateTenant = async (tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<Tenant>(`/saas/tenant/${tenantId}`, updates)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour du tenant')
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
   * Supprimer un tenant
   */
  const deleteTenant = async (tenantId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.delete(`/saas/tenant/${tenantId}`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression du tenant')
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

  return {
    loading,
    error,
    initializeTenant,
    createTenant,
    getTenantById,
    getTenantByDomain,
    addUserToTenant,
    getTenantUsers,
    updateTenant,
    deleteTenant
  }
}

export type { Tenant, TenantUser, InitializeTenantData }