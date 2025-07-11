import { useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'
import type { MarketplaceSettings } from '../services/settingsService'
import { supabase } from '../lib/supabase'

export function useMarketplaceTheme() {
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGlobalSettings()
  }, [])

  // Écouter les mises à jour de thème
  useEffect(() => {
    const handleThemeUpdate = () => {
      loadGlobalSettings()
    }

    window.addEventListener('theme-updated', handleThemeUpdate)
    return () => window.removeEventListener('theme-updated', handleThemeUpdate)
  }, [])

  const loadGlobalSettings = async () => {
    try {
      setLoading(true)
      
      // Pour l'instant, on prend les settings du premier admin
      const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single()

      if (adminProfile) {
        const adminSettings = await settingsService.getSettings(adminProfile.id)
        setSettings(adminSettings)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = () => {
    loadGlobalSettings()
  }

  return {
    settings,
    loading,
    refreshSettings,
    // Helpers pour faciliter l'usage
    theme: {
      primaryColor: settings?.primary_color || '#10b981',
      secondaryColor: settings?.secondary_color || '#f3f4f6',
      companyName: settings?.company_name || 'SparesTech',
      logoUrl: settings?.logo_url || null
    },
    display: {
      showPrices: settings?.show_prices ?? true,
      showStock: settings?.show_stock ?? true,
      showReferences: settings?.show_references ?? true,
      showDescriptions: settings?.show_descriptions ?? true,
      showCategories: settings?.show_categories ?? true
    },
    access: {
      isPublic: settings?.public_access ?? true,
      allowRegistration: settings?.allow_public_registration ?? true
    }
  }
}