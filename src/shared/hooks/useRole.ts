import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { isMainSite } from '../utils/domainUtils'
import { useTenant } from './useTenant'

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

  const fetchProfile = useCallback(async () => {
    if (!user) return
    
    try {
      const isStartupContext = isMainSite()
      
      if (isStartupContext) {
        // Pour le contexte startup, utiliser startup_users
        const { data, error } = await supabase
          .from('startup_users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Pas de profil startup trouvé
            setProfile(null)
            return
          }
          throw error
        }

        // Adapter le format du profil startup
        setProfile({
          id: data.id,
          email: data.email,
          company_name: data.company_name,
          role: 'admin', // Les utilisateurs startup sont toujours admin
          tenant_id: null,
          is_active: data.is_active
        })
      } else {
        // Pour le contexte SaaS, utiliser user_profiles avec tenant_id
        let query = supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)

        if (tenantId) {
          query = query.eq('tenant_id', tenantId)
        }

        const { data, error } = await query.single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Pas de profil SaaS trouvé
            setProfile(null)
            return
          }
          throw error
        }

        setProfile({
          id: data.id,
          email: data.email,
          company_name: data.company_name,
          role: data.role,
          tenant_id: data.tenant_id,
          is_active: data.is_active
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user, tenantId])

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