// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du wrapper qui utilise l'API backend
// Note: Ce service utilise déjà useUserApi via userManagementServiceWrapper
import { userManagementService } from './userManagementServiceWrapper'
import type { UserProfile } from '../../shared/types/user'

// Réexporter le type pour compatibilité
export type { UserProfile }

export const userProfileService = {
  // Récupérer le profil d'un utilisateur (SaaS avec tenant_id) - MIGRÉ vers API
  async getUserProfile(userId: string, tenantId?: string): Promise<UserProfile | null> {
    try {
      // Utiliser le service de gestion des utilisateurs qui utilise déjà l'API
      return await userManagementService.getUserById(userId)
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
      return await userManagementService.createUser({
        email: profileData.email,
        password: 'temp', // Le mot de passe sera défini par l'utilisateur
        role: profileData.role,
        company_name: profileData.company_name,
        phone: profileData.phone,
        tenant_id: profileData.tenant_id
      })
    } catch (error) {
      console.error('Erreur lors de la création du profil utilisateur:', error)
      throw error
    }
  },

  // Mettre à jour un profil utilisateur - MIGRÉ vers API
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      return await userManagementService.updateUser(userId, updates)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil utilisateur:', error)
      throw error
    }
  }
}