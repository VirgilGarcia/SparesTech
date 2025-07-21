import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { tenantService, type Tenant } from '../../saas/services/tenantService'
import { userProfileService, type UserProfile } from '../../saas/services/userProfileService'

export function useTenant() {
  const { user } = useAuth()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTenantData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Charger d'abord le profil pour éviter la récursion
      const profileData = await userProfileService.getUserProfile(user.id)
      setUserProfile(profileData)

      // Charger le tenant seulement si l'utilisateur a un profil SaaS
      if (profileData?.tenant_id) {
        const tenantData = await tenantService.getTenantById(profileData.tenant_id)
        if (tenantData) {
          // Adapter le tenant de l'API pour inclure subscription_status
          const adaptedTenant: Tenant = {
            ...tenantData,
            subscription_status: 'active', // Valeur par défaut
            subdomain: tenantData.subdomain || null,
            custom_domain: tenantData.custom_domain || null,
            custom_domain_verified: false
          }
          setTenant(adaptedTenant)
        } else {
          setTenant(null)
        }
      } else {
        setTenant(null)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données tenant:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Définir des valeurs par défaut en cas d'erreur
      setTenant(null)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setTenant(null)
      setUserProfile(null)
      setLoading(false)
      return
    }

    loadTenantData()
  }, [user, loadTenantData])

  const refreshTenant = useCallback(() => {
    loadTenantData()
  }, [loadTenantData])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return undefined

    try {
      const updatedProfile = await userProfileService.updateUserProfile(user.id, updates)
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