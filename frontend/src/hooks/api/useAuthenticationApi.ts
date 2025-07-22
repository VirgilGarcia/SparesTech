import { useState } from 'react'
import { api } from '../../lib/api'
import type { Session, SignUpResponse, SignUpMetadata } from '../../types/auth'

interface InitializeTenantRequest {
  name: string
  owner_id: string
  admin_email: string
  admin_company_name: string
}

export function useAuthenticationApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupérer les données d'authentification depuis localStorage
   */
  const getCurrentSession = (): Session | null => {
    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (!token || !userData) {
        return null
      }
      
      const user = JSON.parse(userData)
      return {
        access_token: token,
        user
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error)
      return null
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  const isAuthenticated = (): boolean => {
    return getCurrentSession() !== null
  }

  /**
   * Créer ou récupérer le profil startup après connexion
   */
  const createOrGetStartupProfile = async (_userId: string, profileData: {
    email: string
    first_name?: string
    last_name?: string
  }): Promise<boolean> => {
    try {
      const response = await api.post('/startup/auth/profile', {
        email: profileData.email,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        company_name: '',
        phone: ''
      })
      
      return response.success
    } catch (err) {
      console.error('Erreur lors de la création du profil startup:', err)
      return false
    }
  }

  /**
   * Initialiser un tenant via l'API backend
   */
  const initializeTenant = async (tenantData: InitializeTenantRequest): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/saas/tenant/initialize', {
        name: tenantData.name,
        owner_id: tenantData.owner_id,
        admin_user_id: tenantData.owner_id,
        admin_email: tenantData.admin_email,
        admin_company_name: tenantData.admin_company_name
      })
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de l\'initialisation du tenant')
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
   * Connexion via notre backend PostgreSQL
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/auth/signin', {
        email,
        password
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur de connexion')
      }
      
      // Stocker le token et les données utilisateur
      const { user, access_token } = response.data
      localStorage.setItem('auth_token', access_token)
      localStorage.setItem('user_data', JSON.stringify(user))
      
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Inscription via notre backend PostgreSQL
   */
  const signUp = async (
    email: string, 
    password: string, 
    metadata?: SignUpMetadata
  ): Promise<SignUpResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      // 1. Créer l'utilisateur avec notre backend
      const response = await api.post('/auth/signup', {
        email,
        password
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de l\'inscription')
      }
      
      const { user, access_token } = response.data
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('auth_token', access_token)
      localStorage.setItem('user_data', JSON.stringify(user))
      
      const session = {
        access_token,
        user
      }
      
      // 2. Si l'utilisateur est créé avec succès et qu'il y a une company, initialiser le tenant
      if (metadata?.company) {
        try {
          await initializeTenant({
            name: metadata.company,
            owner_id: user.id,
            admin_email: email,
            admin_company_name: metadata.company
          })
        } catch (tenantError) {
          console.error('Erreur lors de l\'initialisation du tenant:', tenantError)
          // On ne throw pas l'erreur pour ne pas bloquer la création du compte
        }
      }
      
      return { 
        data: { user, session }, 
        error: null 
      }
      
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Déconnexion - nettoyage local
   */
  const signOut = async (): Promise<void> => {
    setLoading(true)
    
    try {
      // Nettoyer le stockage local
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      // Optionnel : appel API pour invalidation côté serveur
      // await api.post('/auth/signout')
      
    } catch (err: any) {
      console.error('Erreur lors de la déconnexion:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Mettre à jour les métadonnées utilisateur
   */
  const updateUserMetadata = async (metadata: Record<string, any>): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.patch('/auth/user', metadata)
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la mise à jour')
      }
      
      // Mettre à jour les données utilisateur stockées localement
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
      const updatedUser = { ...userData, ...metadata }
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
      
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createOrGetStartupProfile,
    initializeTenant,
    signIn,
    signUp,
    signOut,
    updateUserMetadata,
    getCurrentSession,
    isAuthenticated
  }
}