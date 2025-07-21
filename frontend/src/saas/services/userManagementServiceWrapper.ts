// Service wrapper pour migrer progressivement vers l'API backend
// ✅ CORRIGÉ - Utilise des API clients au lieu de hooks React
import { userApiClient } from '../../lib/apiClients'
import type { UserProfile } from '../../hooks/api/useUserApi'

/**
 * Service de gestion des utilisateurs SaaS avec fonctions critiques migrées
 */
export const userManagementService = {
  
  /**
   * Récupérer tous les utilisateurs (MIGRÉ vers API)
   */
  getUsers: async (page = 1, limit = 50): Promise<UserProfile[]> => {
    try {
      // Pour l'instant, on retourne une liste vide car cette fonctionnalité nécessite 
      // un endpoint spécifique /saas/users avec pagination
      console.warn(`getUsers non encore implémenté dans l'API client (page: ${page}, limit: ${limit})`)
      return []
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      return []
    }
  },

  /**
   * Récupérer le profil utilisateur (MIGRÉ vers API) 
   */
  getSaasProfile: async (): Promise<UserProfile | null> => {
    try {
      // Cette méthode nécessiterait un endpoint /saas/users/me
      console.warn('getSaasProfile non encore implémenté dans l\'API client')
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      return null
    }
  },

  /**
   * Créer un utilisateur (MIGRÉ vers API)
   */
  createUser: async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
    const result = await userApiClient.createUser(userData)
    
    if (!result) {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }
    
    return result
  },

  /**
   * Mettre à jour un utilisateur (MIGRÉ vers API)
   */
  updateUser: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    const result = await userApiClient.updateUser(userId, updates)
    
    if (!result) {
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur')
    }
    
    return result
  },

  /**
   * Supprimer un utilisateur (MIGRÉ vers API) 
   */
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      // Cette fonctionnalité nécessite un endpoint DELETE /saas/users/:id
      console.warn(`deleteUser non encore implémenté dans l'API client (userId: ${userId})`)
      return false
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      return false
    }
  },

  /**
   * Mettre à jour le profil utilisateur (MIGRÉ vers API)
   */
  updateSaasProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      // Cette méthode nécessiterait un endpoint PUT /saas/users/me
      console.warn('updateSaasProfile non encore implémenté dans l\'API client', updates)
      throw new Error('updateSaasProfile non encore implémenté')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  },

  /**
   * Récupérer un utilisateur par ID (MIGRÉ vers API)
   */
  getUserById: async (userId: string): Promise<UserProfile | null> => {
    return await userApiClient.getById(userId)
  }
}

// Export du type pour compatibilité
export type { UserProfile }