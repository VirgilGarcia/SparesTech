import { useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface SignUpMetadata {
  first_name?: string
  last_name?: string
  company?: string
}

interface SignUpResponse {
  data: {
    user: User | null
    session: Session | null
  }
  error: null
}

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
   * Connexion (utilise toujours Supabase Auth directement)
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  /**
   * Inscription avec initialisation du profil via API
   */
  const signUp = async (
    email: string, 
    password: string, 
    metadata?: SignUpMetadata
  ): Promise<SignUpResponse> => {
    // 1. Créer l'utilisateur avec Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          first_name: metadata?.first_name,
          last_name: metadata?.last_name,
          company_name: metadata?.company,
        },
      },
    })
    
    if (error) throw error
    
    // Si l'utilisateur est créé mais pas de session, confirmation d'email requise
    if (data.user && !data.session) {
      throw new Error('Inscription réussie ! Vérifiez votre email pour confirmer votre compte avant de vous connecter.')
    }

    // 2. Si l'utilisateur est créé avec succès et qu'il y a une company, initialiser le tenant via API
    if (data.user && metadata?.company) {
      try {
        await initializeTenant({
          name: metadata.company,
          owner_id: data.user.id,
          admin_email: email,
          admin_company_name: metadata.company
        })
      } catch (tenantError) {
        console.error('Erreur lors de l\'initialisation du tenant:', tenantError)
        // On ne throw pas l'erreur pour ne pas bloquer la création du compte
      }
    }

    return { data, error: null }
  }

  /**
   * Déconnexion (utilise toujours Supabase Auth directement)
   */
  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Mettre à jour les métadonnées utilisateur
   */
  const updateUserMetadata = async (metadata: Record<string, any>): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      data: metadata
    })
    if (error) throw error
  }

  return {
    loading,
    error,
    createOrGetStartupProfile,
    initializeTenant,
    signIn,
    signUp,
    signOut,
    updateUserMetadata
  }
}