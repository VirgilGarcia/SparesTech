import { useState } from 'react'
import { api } from '../../lib/api'

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

interface CreateProfileRequest {
  email: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
}

export function useAuthApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Créer ou récupérer le profil startup de l'utilisateur connecté
   */
  const createOrGetProfile = async (profileData: CreateProfileRequest): Promise<StartupUser | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<StartupUser>('/startup/auth/profile', profileData)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création du profil')
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
   * Récupérer le profil startup de l'utilisateur connecté
   */
  const getProfile = async (): Promise<StartupUser | null> => {
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
   * Mettre à jour le profil startup
   */
  const updateProfile = async (updates: Partial<StartupUser>): Promise<StartupUser | null> => {
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

  return {
    loading,
    error,
    createOrGetProfile,
    getProfile,
    updateProfile
  }
}

export type { StartupUser, CreateProfileRequest }