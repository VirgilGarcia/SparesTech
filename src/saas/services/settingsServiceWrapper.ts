import { useSettingsApi } from '../../hooks/api/useSettingsApi'

export interface MarketplaceSettings {
  id?: string
  tenant_id?: string
  public_access: boolean
  show_prices: boolean
  show_stock: boolean
  show_categories: boolean
  company_name: string | null
  logo_url: string | null
  primary_color: string
  subdomain: string | null
  custom_domain: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Service wrapper pour la gestion des paramètres marketplace
 * Route les appels vers l'API backend pour éviter les problèmes RLS
 */
export const settingsService = {
  
  /**
   * Récupère les paramètres pour un tenant
   */
  getSettings: async (_tenantId?: string): Promise<MarketplaceSettings> => {
    try {
      const api = useSettingsApi()
      const settings = await api.getSettings()
      return settings ? {
        ...settings,
        logo_url: settings.logo_url || null,
        company_name: settings.company_name || null,
        subdomain: settings.subdomain || null,
        custom_domain: settings.custom_domain || null
      } : {
        public_access: true,
        show_prices: true,
        show_stock: true,
        show_categories: true,
        company_name: null,
        logo_url: null,
        primary_color: '#3B82F6',
        subdomain: null,
        custom_domain: null
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error)
      return {
        public_access: true,
        show_prices: true,
        show_stock: true,
        show_categories: true,
        company_name: null,
        logo_url: null,
        primary_color: '#3B82F6',
        subdomain: null,
        custom_domain: null
      }
    }
  },

  /**
   * Met à jour les paramètres
   */
  updateSettings: async (
    _tenantId: string, 
    updates: Partial<MarketplaceSettings>
  ): Promise<MarketplaceSettings> => {
    const api = useSettingsApi()
    const cleanUpdates = {
      ...updates,
      company_name: updates.company_name === null ? undefined : updates.company_name,
      logo_url: updates.logo_url === null ? undefined : updates.logo_url,
      subdomain: updates.subdomain === null ? undefined : updates.subdomain,
      custom_domain: updates.custom_domain === null ? undefined : updates.custom_domain
    }
    const result = await api.updateSettings(cleanUpdates)
    if (!result) {
      throw new Error('Impossible de mettre à jour les paramètres')
    }
    return {
      ...result,
      logo_url: result.logo_url || null,
      company_name: result.company_name || null,
      subdomain: result.subdomain || null,
      custom_domain: result.custom_domain || null
    }
  },

  /**
   * Upload du logo
   */
  uploadLogo: async (_tenantId: string, file: File): Promise<string> => {
    const api = useSettingsApi()
    const result = await api.uploadLogo(file)
    return result || ''
  },

  /**
   * Supprime le logo
   */
  deleteLogo: async (_tenantId: string): Promise<boolean> => {
    try {
      // TODO: implémenter deleteLogo dans l'API
      console.warn('deleteLogo non encore implémenté')
      return false
    } catch (error) {
      console.error('Erreur lors de la suppression du logo:', error)
      return false
    }
  },

  /**
   * Alias pour deleteLogo
   */
  removeLogo: async (tenantId: string): Promise<boolean> => {
    return settingsService.deleteLogo(tenantId)
  },

  /**
   * Récupérer les paramètres publics d'un marketplace
   */
  getPublicSettings: async (tenantId: string): Promise<MarketplaceSettings> => {
    return settingsService.getSettings(tenantId)
  }
}

// Types déjà exportés ci-dessus