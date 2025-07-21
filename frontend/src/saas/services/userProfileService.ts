// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du wrapper qui utilise l'API backend
// Note: Ce service utilise déjà useUserApi via userManagementServiceWrapper
import { userManagementService } from './userManagementServiceWrapper'
import type { UserProfile } from '../../shared/types/user'
import type { UserProfile as ApiUserProfile } from '../../hooks/api/useUserApi'

// Réexporter le type pour compatibilité
export type { UserProfile }

export const userProfileService = {
  // Récupérer le profil d'un utilisateur (SaaS avec tenant_id) - MIGRÉ vers API
  async getUserProfile(userId: string, _tenantId?: string): Promise<UserProfile | null> {
    try {
      // Utiliser le service de gestion des utilisateurs qui utilise déjà l'API
      const result = await userManagementService.getUserById(userId)
      if (!result) return null
      
      // Adapter le type pour garantir la compatibilité
      return {
        id: result.id || userId,
        email: result.email || '',
        first_name: result.first_name || null,
        last_name: result.last_name || null,
        phone: result.phone || null,
        company_name: result.company_name || null,
        address: result.address || null,
        city: result.city || null,
        postal_code: result.postal_code || null,
        country: result.country || null,
        role: result.role || 'client',
        tenant_id: result.tenant_id || 'default',
        is_active: result.is_active !== false,
        created_at: result.created_at || new Date().toISOString(),
        updated_at: result.updated_at || new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error)
      return null
    }
  },

  // Créer un profil utilisateur - MIGRÉ vers API
  async createUserProfile(profileData: {
    id: string
    email: string
    tenant_id: string
    role: 'admin' | 'client'
    company_name?: string
    phone?: string
  }): Promise<UserProfile> {
    try {
      const userData = {
        email: profileData.email,
        role: profileData.role,
        company_name: profileData.company_name,
        phone: profileData.phone,
        tenant_id: profileData.tenant_id,
        first_name: '',
        last_name: '',
        country: 'France',
        is_active: true
      }
      const result = await userManagementService.createUser(userData)
      
      // Adapter le résultat pour garantir la compatibilité
      return {
        id: result.id || profileData.id,
        email: result.email || profileData.email,
        first_name: result.first_name || null,
        last_name: result.last_name || null,
        phone: result.phone || null,
        company_name: result.company_name || null,
        address: result.address || null,
        city: result.city || null,
        postal_code: result.postal_code || null,
        country: result.country || null,
        role: result.role || profileData.role,
        tenant_id: result.tenant_id || profileData.tenant_id,
        is_active: result.is_active !== false,
        created_at: result.created_at || new Date().toISOString(),
        updated_at: result.updated_at || new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur lors de la création du profil utilisateur:', error)
      throw error
    }
  },

  // Mettre à jour un profil utilisateur - MIGRÉ vers API
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Adapter les updates pour l'API
      const apiUpdates: Partial<ApiUserProfile> = {
        id: updates.id,
        email: updates.email,
        first_name: updates.first_name || undefined,
        last_name: updates.last_name || undefined,
        company_name: updates.company_name || undefined,
        phone: updates.phone || undefined,
        address: updates.address || undefined,
        city: updates.city || undefined,
        postal_code: updates.postal_code || undefined,
        country: updates.country || undefined,
        role: updates.role === 'manager' || updates.role === 'employee' ? 'client' : updates.role,
        tenant_id: updates.tenant_id,
        is_active: updates.is_active,
        created_at: updates.created_at,
        updated_at: updates.updated_at
      }
      const result = await userManagementService.updateUser(userId, apiUpdates)
      
      // Adapter le résultat pour garantir la compatibilité
      return {
        id: result.id,
        email: result.email,
        first_name: result.first_name || null,
        last_name: result.last_name || null,
        phone: result.phone || null,
        company_name: result.company_name || null,
        address: result.address || null,
        city: result.city || null,
        postal_code: result.postal_code || null,
        country: result.country || null,
        role: result.role,
        tenant_id: result.tenant_id || 'default',
        is_active: result.is_active,
        created_at: result.created_at,
        updated_at: result.updated_at
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil utilisateur:', error)
      throw error
    }
  },

  /**
   * Sauvegarder l'adresse de livraison
   */
  saveDeliveryAddress: async (userId: string, address: any): Promise<void> => {
    try {
      // Note: delivery_address n'est pas dans le type API, on utilise address à la place
      await userManagementService.updateUser(userId, { address: JSON.stringify(address) })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'adresse:', error)
      throw error
    }
  },

  /**
   * Récupérer le profil (alias pour getUserProfile)
   */
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    return userProfileService.getUserProfile(userId)
  },

  /**
   * Changer le mot de passe
   */
  changePassword: async (newPassword: string): Promise<void> => {
    try {
      console.warn('changePassword non implémenté:', newPassword)
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      throw error
    }
  }
}