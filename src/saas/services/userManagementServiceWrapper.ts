// Service wrapper pour migrer progressivement vers l'API backend
// TODO: Migrer complètement vers useUserApi (déjà créé)
import { useUserApi, type UserProfile } from '../../hooks/api/useUserApi'

// Instance API pour les appels
const getApiInstance = () => useUserApi()

/**
 * Service de gestion des utilisateurs SaaS avec fonctions critiques migrées
 */
export const userManagementService = {
  
  /**
   * Récupérer tous les utilisateurs (MIGRÉ vers API)
   */
  getUsers: async (page = 1, limit = 50): Promise<UserProfile[]> => {
    const api = getApiInstance()
    return api.getUsers(page, limit)
  },

  /**
   * Récupérer le profil utilisateur (MIGRÉ vers API)
   */
  getSaasProfile: async (): Promise<UserProfile | null> => {
    const api = getApiInstance()
    return api.getSaasProfile()
  },

  /**
   * Créer un utilisateur (MIGRÉ vers API)
   */
  createUser: async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
    const api = getApiInstance()
    const result = await api.createUser(userData)
    
    if (!result) {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }
    
    return result
  },

  /**
   * Mettre à jour un utilisateur (MIGRÉ vers API)
   */
  updateUser: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    const api = getApiInstance()
    const result = await api.updateUser(userId, updates)
    
    if (!result) {
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur')
    }
    
    return result
  },

  /**
   * Supprimer un utilisateur (MIGRÉ vers API)
   */
  deleteUser: async (userId: string): Promise<boolean> => {
    const api = getApiInstance()
    return api.deleteUser(userId)
  },

  /**
   * Mettre à jour le profil utilisateur (MIGRÉ vers API)
   */
  updateSaasProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const api = getApiInstance()
    const result = await api.updateSaasProfile(updates)
    
    if (!result) {
      throw new Error('Erreur lors de la mise à jour du profil')
    }
    
    return result
  }
}

// Export des types pour compatibilité
export type { UserProfile }