import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { tenantService, type Tenant, type UserProfile } from '../services/tenantService'

export function useTenant() {
  const { user } = useAuth()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setTenant(null)
      setUserProfile(null)
      setLoading(false)
      return
    }

    loadTenantData()
  }, [user])

  const loadTenantData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Charger le tenant et le profil en parallèle
      const [tenantData, profileData] = await Promise.all([
        tenantService.getUserTenant(user.id),
        tenantService.getUserProfile(user.id)
      ])

      setTenant(tenantData)
      setUserProfile(profileData)
    } catch (err) {
      console.error('Erreur lors du chargement des données tenant:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const refreshTenant = () => {
    loadTenantData()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return undefined

    try {
      const updatedProfile = await tenantService.updateUserProfile(user.id, updates)
      setUserProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err)
      throw err
    }
  }

  return {
    tenant,
    userProfile,
    loading,
    error,
    refreshTenant,
    updateProfile,
    isAdmin: userProfile?.role === 'admin',
    tenantId: tenant?.id
  }
}