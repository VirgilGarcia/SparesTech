// Ajout à votre settingsService.ts existant

import { supabase } from '../lib/supabase'

export interface MarketplaceSettings {
  id?: string
  user_id?: string
  public_access: boolean
  allow_public_registration: boolean
  show_prices: boolean
  show_stock: boolean
  show_references: boolean
  show_descriptions: boolean
  show_categories: boolean
  // Nouvelles options d'affichage produits
  show_weight: boolean
  show_dimensions: boolean
  show_sku: boolean
  show_brand: boolean
  show_supplier: boolean
  show_technical_specs: boolean
  show_warranty: boolean
  show_delivery_info: boolean
  // Options de visibilité produits
  allow_product_visibility_toggle: boolean
  default_product_visibility: boolean
  company_name: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  created_at?: string
  updated_at?: string
}

export const settingsService = {
  // Récupérer les paramètres pour un utilisateur admin
  getSettings: async (userId: string): Promise<MarketplaceSettings> => {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // Créer des paramètres par défaut si aucun n'existe
      const defaultSettings = {
        user_id: userId,
        public_access: true,
        allow_public_registration: true,
        show_prices: true,
        show_stock: true,
        show_references: true,
        show_descriptions: true,
        show_categories: true,
        // Nouvelles options d'affichage produits
        show_weight: false,
        show_dimensions: false,
        show_sku: true,
        show_brand: false,
        show_supplier: false,
        show_technical_specs: false,
        show_warranty: false,
        show_delivery_info: true,
        // Options de visibilité produits
        allow_product_visibility_toggle: true,
        default_product_visibility: true,
        company_name: '',
        logo_url: null,
        primary_color: '#10b981',
        secondary_color: '#f3f4f6'
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
  updateSettings: async (userId: string, updates: Partial<MarketplaceSettings>): Promise<MarketplaceSettings> => {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Récupérer les paramètres publics (sans authentification)
  getPublicSettings: async (): Promise<MarketplaceSettings> => {
    try {
      console.log('🔍 Récupération des paramètres publics...')
      
      // Récupérer les paramètres généraux (premier enregistrement trouvé)
      const { data, error } = await supabase
        .from('marketplace_settings')
        .select(`
          public_access,
          allow_public_registration,
          company_name,
          logo_url,
          primary_color,
          secondary_color,
          show_prices,
          show_stock,
          show_references,
          show_descriptions,
          show_categories,
          show_weight,
          show_dimensions,
          show_sku,
          show_brand,
          show_supplier,
          show_technical_specs,
          show_warranty,
          show_delivery_info,
          allow_product_visibility_toggle,
          default_product_visibility
        `)
        .limit(1)
        .single()

      if (error) {
        console.warn('⚠️ Aucun paramètre trouvé, utilisation des valeurs par défaut:', error.message)
        
        // Valeurs par défaut sécurisées en cas d'absence de configuration
        return {
          public_access: false, // Par défaut privé pour la sécurité
          allow_public_registration: false, // Par défaut fermé
          company_name: 'Marketplace',
          logo_url: null,
          primary_color: '#10b981',
          secondary_color: '#f3f4f6',
          show_prices: true,
          show_stock: true,
          show_references: true,
          show_descriptions: true,
          show_categories: true,
          // Nouvelles options d'affichage produits
          show_weight: false,
          show_dimensions: false,
          show_sku: true,
          show_brand: false,
          show_supplier: false,
          show_technical_specs: false,
          show_warranty: false,
          show_delivery_info: true,
          // Options de visibilité produits
          allow_product_visibility_toggle: true,
          default_product_visibility: true
        }
      }

      console.log('✅ Paramètres publics récupérés:', data)
      return data

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres publics:', error)
      
      // En cas d'erreur réseau, valeurs par défaut sécurisées
      return {
        public_access: false,
        allow_public_registration: false,
        company_name: 'Marketplace',
        logo_url: null,
        primary_color: '#10b981',
        secondary_color: '#f3f4f6',
        show_prices: true,
        show_stock: true,
        show_references: true,
        show_descriptions: true,
        show_categories: true,
        // Nouvelles options d'affichage produits
        show_weight: false,
        show_dimensions: false,
        show_sku: true,
        show_brand: false,
        show_supplier: false,
        show_technical_specs: false,
        show_warranty: false,
        show_delivery_info: true,
        // Options de visibilité produits
        allow_product_visibility_toggle: true,
        default_product_visibility: true
      }
    }
  },

  // NOUVELLE MÉTHODE: Vérifier si le marketplace est configuré
  isConfigured: async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_settings')
        .select('id')
        .limit(1)

      return !error && data && data.length > 0
    } catch (error) {
      console.error('Erreur lors de la vérification de configuration:', error)
      return false
    }
  }
}