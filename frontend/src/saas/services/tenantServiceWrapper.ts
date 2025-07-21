// Service wrapper pour migrer progressivement vers l'API backend
// TODO: Migrer complètement vers useTenantManagementApi
import { useTenantManagementApi, type Tenant, type InitializeTenantData } from '../../hooks/api/useTenantManagementApi'

// Instance API pour les appels
const getApiInstance = () => useTenantManagementApi()

/**
 * Service de gestion des tenants avec fonctions critiques migrées
 */
export const tenantService = {
  
  /**
   * Initialiser un tenant complet (MIGRÉ vers API)
   */
  initializeTenant: async (tenantData: InitializeTenantData): Promise<Tenant> => {
    const api = getApiInstance()
    const result = await api.initializeTenant(tenantData)
    if (!result) {
      throw new Error('Erreur lors de l\'initialisation du tenant')
    }
    return result
  },

  /**
   * Créer un tenant simple (MIGRÉ vers API)
   */
  createTenant: async (tenantData: {
    name: string
    owner_id: string
    subdomain?: string
    custom_domain?: string
  }): Promise<Tenant> => {
    const api = getApiInstance()
    const result = await api.createTenant(tenantData)
    if (!result) {
      throw new Error('Erreur lors de la création du tenant')
    }
    return result
  },

  /**
   * Récupérer un tenant par ID (MIGRÉ vers API)
   */
  getTenantById: async (tenantId: string): Promise<Tenant | null> => {
    const api = getApiInstance()
    return api.getTenantById(tenantId)
  },

  /**
   * Récupérer un tenant par domaine (MIGRÉ vers API)
   */
  getTenantByDomain: async (domain: string): Promise<Tenant | null> => {
    const api = getApiInstance()
    return api.getTenantByDomain(domain)
  },

  /**
   * Ajouter un utilisateur à un tenant (MIGRÉ vers API)
   */
  addUserToTenant: async (tenantId: string, userId: string, role: 'admin' | 'user' = 'user') => {
    const api = getApiInstance()
    const result = await api.addUserToTenant(tenantId, userId, role)
    if (!result) {
      throw new Error('Erreur lors de l\'ajout de l\'utilisateur au tenant')
    }
    return result
  },

  /**
   * Récupérer les utilisateurs d'un tenant (MIGRÉ vers API)
   */
  getTenantUsers: async (tenantId: string) => {
    const api = getApiInstance()
    return api.getTenantUsers(tenantId)
  },

  /**
   * Mettre à jour un tenant (MIGRÉ vers API)
   */
  updateTenant: async (tenantId: string, updates: Partial<Tenant>): Promise<Tenant> => {
    const api = getApiInstance()
    const result = await api.updateTenant(tenantId, updates)
    if (!result) {
      throw new Error('Erreur lors de la mise à jour du tenant')
    }
    return result
  },

  /**
   * Supprimer un tenant (MIGRÉ vers API)
   */
  deleteTenant: async (tenantId: string): Promise<boolean> => {
    const api = getApiInstance()
    return api.deleteTenant(tenantId)
  }
}

// Export des types pour compatibilité
export type { Tenant, InitializeTenantData }