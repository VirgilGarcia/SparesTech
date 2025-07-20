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