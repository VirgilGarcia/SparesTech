import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { isMainSite } from '../utils/domainUtils'
import { useTenant } from './useTenant'
import { useUserApi } from '../../hooks/api/useUserApi'

interface UserProfile {
  id: string
  email: string
  company_name: string | null
  role: 'admin' | 'client'
  tenant_id?: string | null
  is_active: boolean
}

export function useRole() {
  const { user } = useAuth()
  const { tenantId } = useTenant()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Hook API
  const { getSaasProfile, getStartupProfile } = useUserApi()

  const fetchProfile = useCallback(async () => {
    if (!user) return
    
    try {
      const isStartupContext = isMainSite()
      
      if (isStartupContext) {
        // Pour le contexte startup, utiliser l'API startup
        const startupProfile = await getStartupProfile()

        if (!startupProfile) {
          setProfile(null)
          return
        }

        // Adapter le format du profil startup
        setProfile({
          id: startupProfile.id,
          email: startupProfile.email,
          company_name: startupProfile.company_name || null,
          role: 'admin', // Les utilisateurs startup sont toujours admin
          tenant_id: null,
          is_active: startupProfile.is_active
        })
      } else {
        // Pour le contexte SaaS, utiliser l'API SaaS
        const saasProfile = await getSaasProfile()

        if (!saasProfile) {
          setProfile(null)
          return
        }

        setProfile({
          id: saasProfile.id,
          email: saasProfile.email,
          company_name: saasProfile.company_name || null,
          role: saasProfile.role,
          tenant_id: saasProfile.tenant_id || null,
          is_active: saasProfile.is_active
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user, tenantId, getSaasProfile, getStartupProfile])

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user, fetchProfile])

  const isAdmin = profile?.role === 'admin'
  const isClient = profile?.role === 'client'
  const isStartupUser = isMainSite() && profile !== null

  return {
    profile,
    loading,
    isAdmin,
    isClient,
    isStartupUser,
    refetch: fetchProfile
  }
}