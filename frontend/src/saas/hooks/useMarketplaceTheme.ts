import { useState, useEffect } from 'react'
import { useSettingsApi, type MarketplaceSettings } from '../../hooks/api/useSettingsApi'

export function useMarketplaceTheme() {
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { getAdminSettings } = useSettingsApi()

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
      
      // Récupérer les settings via l'API
      const adminSettings = await getAdminSettings()
      if (adminSettings) {
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
      companyName: settings?.company_name || 'Spartelio',
      logoUrl: settings?.logo_url || null
    },
    display: {
      showPrices: settings?.show_prices ?? true,
      showStock: settings?.show_stock ?? true,
      showCategories: settings?.show_categories ?? true
    },
    access: {
      isPublic: settings?.public_access ?? true,
      allowRegistration: settings?.public_access ?? true // Si public, inscription autorisée
    }
  }
}