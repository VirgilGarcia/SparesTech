import { useState } from 'react'
import { api } from '../../lib/api'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  role: 'admin' | 'client'
  tenant_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface StartupUser {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useUserApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupérer le profil utilisateur (contexte SaaS)
   */
  const getSaasProfile = async (): Promise<UserProfile | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<UserProfile>('/saas/users/profile')
      
      if (!response.success) {
        setError(response.error || 'Profil non trouvé')
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
   * Récupérer le profil startup
   */
  const getStartupProfile = async (): Promise<StartupUser | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<StartupUser>('/startup/auth/profile')
      
      if (!response.success) {
        setError(response.error || 'Profil non trouvé')
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
   * Mettre à jour le profil SaaS
   */
  const updateSaasProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<UserProfile>('/saas/users/profile', updates)
      
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
   * Mettre à jour le profil startup
   */
  const updateStartupProfile = async (updates: Partial<StartupUser>): Promise<StartupUser | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<StartupUser>('/startup/auth/profile', updates)
      
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
   * Lister tous les utilisateurs (admin uniquement)
   */
  const getUsers = async (page = 1, limit = 50): Promise<UserProfile[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<UserProfile[]>(`/saas/users?page=${page}&limit=${limit}`)
      
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
   * Créer un utilisateur (admin uniquement)
   */
  const createUser = async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<UserProfile>('/saas/users', userData)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création')
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
   * Mettre à jour un utilisateur (admin uniquement)
   */
  const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<UserProfile>(`/saas/users/${userId}`, updates)
      
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
   * Supprimer un utilisateur (admin uniquement)
   */
  const deleteUser = async (userId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.delete(`/saas/users/${userId}`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression')
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
    getSaasProfile,
    getStartupProfile,
    updateSaasProfile,
    updateStartupProfile,
    getUsers,
    createUser,
    updateUser,
    deleteUser
  }
}

export type { UserProfile, StartupUser }