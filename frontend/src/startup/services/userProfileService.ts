// Service de gestion des profils utilisateurs startup
export {
  getOrCreateStartupUserProfile,
  getStartupUserProfile,
  updateStartupUserProfile,
  startupUserProfileService
} from './userProfileServiceWrapper'
export type { StartupUser } from './userProfileServiceWrapper'

// Re-export des types pour compatibilité
export type { CreateStartupUser, UpdateStartupUser } from '../../shared/types/user'

// Fonctions additionnelles manquantes
export const updateStartupUserEmail = async (userId: string, newEmail: string): Promise<void> => {
  // Stub pour éviter les erreurs - implémentation à faire
  console.warn('updateStartupUserEmail non implémenté:', userId, newEmail)
}

export const changeUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  // Stub pour éviter les erreurs - implémentation à faire
  console.warn('changeUserPassword non implémenté:', userId, newPassword)
}