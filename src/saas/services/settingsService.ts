

import { supabase } from '../../lib/supabase'
import { getCurrentTenantId } from '../../utils/tenantUtils'

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

export const settingsService = {
  // Récupérer les paramètres pour un tenant
  getSettings: async (tenantId?: string): Promise<MarketplaceSettings> => {
    const currentTenantId = tenantId || await getCurrentTenantId()
    
    if (!currentTenantId) {
      // Retourner des paramètres par défaut si pas de tenant
      return {
        public_access: true,
        show_prices: true,
        show_stock: true,
        show_categories: true,
        company_name: 'Marketplace',
        logo_url: null,
        primary_color: '#10b981',
        subdomain: null,
        custom_domain: null
      }
    }

    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('id, tenant_id, public_access, show_prices, show_stock, show_categories, company_name, logo_url, primary_color, subdomain, custom_domain, created_at, updated_at')
      .eq('tenant_id', currentTenantId)
      .single()

    if (error) {
      // Créer des paramètres par défaut si aucun n'existe
      const defaultSettings = {
        tenant_id: currentTenantId,
        public_access: true,
        show_prices: true,
        show_stock: true,
        show_categories: true,
        company_name: '',
        logo_url: null,
        primary_color: '#10b981',
        subdomain: null,
        custom_domain: null
      }

      const { data: newSettings, error: createError } = await supabase
        .from('marketplace_settings')
        .insert([defaultSettings])
        .select()
        .single()

      if (createError) throw createError
      return newSettings
    }

    return data
  },

  // Mettre à jour les paramètres
  updateSettings: async (tenantId: string | undefined, updates: Partial<MarketplaceSettings>): Promise<MarketplaceSettings> => {
    const currentTenantId = tenantId || await getCurrentTenantId()
    
    if (!currentTenantId) {
      throw new Error('Tenant requis pour mettre à jour les paramètres')
    }

    const { data, error } = await supabase
      .from('marketplace_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('tenant_id', currentTenantId)
      .select('id, tenant_id, public_access, show_prices, show_stock, show_categories, company_name, logo_url, primary_color, subdomain, custom_domain, created_at, updated_at')
      .single()

    if (error) throw error
    return data
  },

  // Récupérer les paramètres publics (sans authentification)
  getPublicSettings: async (tenantId?: string): Promise<MarketplaceSettings> => {
    try {
      const currentTenantId = tenantId || await getCurrentTenantId()
      
      if (!currentTenantId) {
        // Valeurs par défaut si pas de tenant
        return {
          public_access: true,
          company_name: 'SparesTech',
          logo_url: null,
          primary_color: '#10b981',
          show_prices: true,
          show_stock: true,
          show_categories: true,
          subdomain: null,
          custom_domain: null
        }
      }
      
      // Récupérer les paramètres du tenant spécifique
      const { data, error } = await supabase
        .from('marketplace_settings')
        .select('id, tenant_id, public_access, show_prices, show_stock, show_categories, company_name, logo_url, primary_color, subdomain, custom_domain, created_at, updated_at')
        .eq('tenant_id', currentTenantId)
        .single()

      if (error) {
        console.warn('⚠️ Aucun paramètre trouvé pour le tenant, utilisation des valeurs par défaut:', error.message)
        
        // Valeurs par défaut sécurisées en cas d'absence de configuration
        return {
          public_access: true,
          company_name: 'Marketplace',
          logo_url: null,
          primary_color: '#10b981',
          show_prices: true,
          show_stock: true,
          show_categories: true,
          subdomain: null,
          custom_domain: null
        }
      }

      return data

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres publics:', error)
      
      // En cas d'erreur réseau, valeurs par défaut sécurisées
      return {
        public_access: true,
        company_name: 'Marketplace',
        logo_url: null,
        primary_color: '#10b981',
        show_prices: true,
        show_stock: true,
        show_categories: true,
        subdomain: null,
        custom_domain: null
      }
    }
  },

  
  isConfigured: async (tenantId?: string): Promise<boolean> => {
    try {
      const currentTenantId = tenantId || await getCurrentTenantId()
      
      if (!currentTenantId) {
        return false
      }

      const { data, error } = await supabase
        .from('marketplace_settings')
        .select('id')
        .eq('tenant_id', currentTenantId)
        .limit(1)

      return !error && data && data.length > 0
    } catch (error) {
      console.error('Erreur lors de la vérification de configuration:', error)
      return false
    }
  }
}