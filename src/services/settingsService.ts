// Ajout à votre settingsService.ts existant

import { supabase } from '../lib/supabase'

export interface MarketplaceSettings {
  id?: string
  user_id?: string
  public_access: boolean
  show_prices: boolean
  show_stock: boolean
  show_categories: boolean
  company_name: string | null
  logo_url: string | null
  primary_color: string
  created_at?: string
  updated_at?: string
}

export const settingsService = {
  // Récupérer les paramètres pour un utilisateur admin
  getSettings: async (userId: string): Promise<MarketplaceSettings> => {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('id, user_id, public_access, show_prices, show_stock, show_categories, company_name, logo_url, primary_color, created_at, updated_at')
      .eq('user_id', userId)
      .single()

    if (error) {
      // Créer des paramètres par défaut si aucun n'existe
      const defaultSettings = {
        user_id: userId,
        public_access: true,
        show_prices: true,
        show_stock: true,
        show_categories: true,
        company_name: '',
        logo_url: null,
        primary_color: '#10b981'
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
      .select('id, user_id, public_access, show_prices, show_stock, show_categories, company_name, logo_url, primary_color, created_at, updated_at')
      .single()

    if (error) throw error
    return data
  },

  // Récupérer les paramètres publics (sans authentification)
  getPublicSettings: async (): Promise<MarketplaceSettings> => {
    try {
  
      
      // Récupérer les paramètres généraux (premier enregistrement trouvé)
      const { data, error } = await supabase
        .from('marketplace_settings')
        .select('id, user_id, public_access, show_prices, show_stock, show_categories, company_name, logo_url, primary_color, created_at, updated_at')
        .limit(1)
        .single()

      if (error) {
        console.warn('⚠️ Aucun paramètre trouvé, utilisation des valeurs par défaut:', error.message)
        
        // Valeurs par défaut sécurisées en cas d'absence de configuration
        return {
          public_access: false, // Par défaut privé pour la sécurité
          company_name: 'Marketplace',
          logo_url: null,
          primary_color: '#10b981',
          show_prices: true,
          show_stock: true,
          show_categories: true
        }
      }

  
      return data

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres publics:', error)
      
      // En cas d'erreur réseau, valeurs par défaut sécurisées
      return {
        public_access: false,
        company_name: 'Marketplace',
        logo_url: null,
        primary_color: '#10b981',
        show_prices: true,
        show_stock: true,
        show_categories: true
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