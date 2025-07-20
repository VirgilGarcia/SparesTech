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
  getSettings: async (tenantId?: string): Promise<MarketplaceSettings> => {
    try {
      const api = useSettingsApi()
      const settings = await api.getSettings()
      return settings || {
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
    tenantId: string, 
    updates: Partial<MarketplaceSettings>
  ): Promise<MarketplaceSettings> => {
    const api = useSettingsApi()
    const result = await api.updateSettings(updates)
    if (!result) {
      throw new Error('Impossible de mettre à jour les paramètres')
    }
    return result
  },

  /**
   * Upload du logo
   */
  uploadLogo: async (tenantId: string, file: File): Promise<string> => {
    const api = useSettingsApi()
    return api.uploadLogo(file)
  },

  /**
   * Supprime le logo
   */
  deleteLogo: async (tenantId: string): Promise<boolean> => {
    try {
      const api = useSettingsApi()
      return api.deleteLogo()
    } catch (error) {
      console.error('Erreur lors de la suppression du logo:', error)
      return false
    }
  }
}

// Export des types pour compatibilité
export type { MarketplaceSettings }