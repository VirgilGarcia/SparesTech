// Service wrapper pour migrer progressivement vers l'API backend
// TODO: Migrer complètement vers useStartupCustomerApi
import { useStartupCustomerApi, type StartupCustomer, type CreateCustomerData } from '../../hooks/api/useStartupCustomerApi'

// Instance API pour les appels
const getApiInstance = () => useStartupCustomerApi()

/**
 * Service de gestion des clients startup avec fonctions critiques migrées
 */
export const startupCustomerService = {
  
  /**
   * Récupérer tous les clients (MIGRÉ vers API)
   */
  getAllCustomers: async (): Promise<StartupCustomer[]> => {
    const api = getApiInstance()
    return api.getAllCustomers()
  },

  /**
   * Récupérer un client par ID (MIGRÉ vers API)
   */
  getCustomerById: async (customerId: string): Promise<StartupCustomer | null> => {
    const api = getApiInstance()
    return api.getCustomerById(customerId)
  },

  /**
   * Récupérer un client par email (MIGRÉ vers API)
   */
  getCustomerByEmail: async (email: string): Promise<StartupCustomer | null> => {
    const api = getApiInstance()
    return api.getCustomerByEmail(email)
  },

  /**
   * Créer un nouveau client (MIGRÉ vers API)
   */
  createCustomer: async (customerData: CreateCustomerData): Promise<StartupCustomer> => {
    const api = getApiInstance()
    const result = await api.createCustomer(customerData)
    if (!result) {
      throw new Error('Erreur lors de la création du client')
    }
    return result
  },

  /**
   * Mettre à jour un client (MIGRÉ vers API)
   */
  updateCustomer: async (customerId: string, updates: Partial<StartupCustomer>): Promise<StartupCustomer> => {
    const api = getApiInstance()
    const result = await api.updateCustomer(customerId, updates)
    if (!result) {
      throw new Error('Erreur lors de la mise à jour du client')
    }
    return result
  },

  /**
   * Désactiver un client (MIGRÉ vers API)
   */
  deactivateCustomer: async (customerId: string): Promise<boolean> => {
    const api = getApiInstance()
    return api.deactivateCustomer(customerId)
  }
}

// Export des types pour compatibilité
export type { StartupCustomer, CreateCustomerData }