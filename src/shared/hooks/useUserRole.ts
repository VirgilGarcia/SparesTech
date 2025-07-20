import { useState, useEffect } from 'react'
import { useAuth } from '../../shared/context/AuthContext'

export const useUserRole = () => {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<'admin' | 'client'>('client')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserRole = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        // Utiliser le service de gestion des utilisateurs migré
        const { userManagementService } = await import('../../saas/services/userManagementServiceWrapper')
        const userProfile = await userManagementService.getUserById(user.id)
        
        if (userProfile) {
          setUserRole(userProfile.role)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du rôle:', error)
        setUserRole('client')
      } finally {
        setLoading(false)
      }
    }

    loadUserRole()
  }, [user])

  return { userRole, loading }
}