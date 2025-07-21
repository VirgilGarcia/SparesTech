// Service wrapper pour migrer progressivement vers l'API backend
// TODO: Migrer complètement vers useAuthApi (déjà créé)
import { useAuthApi, type StartupUser } from '../../hooks/api/useAuthApi'

// Instance API pour les appels
const getApiInstance = () => useAuthApi()

/**
 * Service de gestion des profils utilisateur startup avec fonctions critiques migrées
 */

/**
 * Créer ou récupérer un profil utilisateur startup (MIGRÉ vers API)
 */
export const getOrCreateStartupUserProfile = async (_userId: string, profileData: {
  email: string
  first_name?: string
  last_name?: string
}): Promise<StartupUser> => {
  const api = getApiInstance()
  const result = await api.createOrGetProfile({
    email: profileData.email,
    first_name: profileData.first_name || '',
    last_name: profileData.last_name || '',
    company_name: '',
    phone: ''
  })
  
  if (!result) {
    throw new Error('Erreur lors de la création du profil utilisateur startup')
  }
  
  return result
}

/**
 * Récupérer un profil utilisateur startup (MIGRÉ vers API)
 */
export const getStartupUserProfile = async (_userId: string): Promise<StartupUser | null> => {
  const api = getApiInstance()
  return api.getProfile()
}

/**
 * Mettre à jour un profil utilisateur startup (MIGRÉ vers API)
 */
export const updateStartupUserProfile = async (_userId: string, updates: Partial<StartupUser>): Promise<StartupUser> => {
  const api = getApiInstance()
  const result = await api.updateProfile(updates)
  
  if (!result) {
    throw new Error('Erreur lors de la mise à jour du profil utilisateur startup')
  }
  
  return result
}

/**
 * Met à jour l'email d'un utilisateur startup
 */
export const updateStartupUserEmail = async (userId: string, email: string): Promise<StartupUser> => {
  return updateStartupUserProfile(userId, { email })
}

/**
 * Change le mot de passe d'un utilisateur
 */
export const changeUserPassword = async (_userId: string, _newPassword: string): Promise<boolean> => {
  console.warn('Changement de mot de passe non encore implémenté - utiliser l\'API d\'authentification directement')
  // TODO: Implémenter avec l'API d'authentification
  return Promise.resolve(false)
}

// Service de gestion des profils utilisateur startup
export const startupUserProfileService = {
  getOrCreateStartupUserProfile,
  getStartupUserProfile,
  updateStartupUserProfile,
  updateStartupUserEmail,
  changeUserPassword
}

// Export des types pour compatibilité
export type { StartupUser }

// Interface pour la mise à jour avec company_name
export interface UpdateStartupUser {
  email?: string
  first_name?: string
  last_name?: string
  company_name?: string
}