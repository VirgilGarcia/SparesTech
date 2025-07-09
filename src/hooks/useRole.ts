import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string
  company_name: string | null
  role: 'client' | 'admin' | 'super_admin'
  is_active: boolean
}

export function useRole() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isClient = profile?.role === 'client'

  return {
    profile,
    loading,
    isAdmin,
    isClient,
    refetch: fetchProfile
  }
}