import { api } from '../../lib/api'

/**
 * Hook pour accéder au client API
 * Simplifié pour utiliser directement l'instance API
 */
export const useApiClient = () => {
  return api
}