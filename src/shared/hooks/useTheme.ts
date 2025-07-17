import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTenantContext } from '../context/TenantContext'
import { settingsService } from '../services/saas/settingsService'
import type { MarketplaceSettings } from '../services/saas/settingsService'

interface ThemeState {
  settings: MarketplaceSettings | null
  loading: boolean
  initialized: boolean
}

export function useTheme() {
  const { user } = useAuth()
  const { tenantId } = useTenantContext()
  const [state, setState] = useState<ThemeState>({
    settings: null,
    loading: true,
    initialized: false
  })
  const cacheRef = useRef<Map<string, { data: MarketplaceSettings; timestamp: number }>>(new Map())

  // Vérifier le cache local storage au démarrage
  useEffect(() => {
    // Forcer le rechargement des paramètres (ignorer le cache temporairement)
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      // Toujours charger les paramètres publics (globaux pour tout le marketplace)
      const settings = await settingsService.getPublicSettings(tenantId)
      
      // Mettre en cache
      const cacheData = {
        data: settings,
        timestamp: Date.now()
      }
      localStorage.setItem('sparestech-theme', JSON.stringify(cacheData))
      
      setState({
        settings,
        loading: false,
        initialized: true
      })
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error)
      setState({
        settings: null,
        loading: false,
        initialized: true
      })
    }
  }

  const updateSettings = async (updates: Partial<MarketplaceSettings>) => {
    if (!user || !state.settings || !tenantId) return

    try {
      // L'admin met à jour les paramètres globaux du marketplace
      const updated = await settingsService.updateSettings(tenantId, updates)
      
      // Mettre à jour le cache
      const cacheData = {
        data: updated,
        timestamp: Date.now()
      }
      localStorage.setItem('sparestech-theme', JSON.stringify(cacheData))
      
      setState(prev => ({
        ...prev,
        settings: updated
      }))
      
      return updated
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thème:', error)
      throw error
    }
  }

  const clearCache = () => {
    localStorage.removeItem('sparestech-theme')
    cacheRef.current.clear()
  }

  const refreshSettings = () => {
    clearCache()
    loadSettings()
  }

  // Valeurs par défaut sécurisées
  const defaultTheme = {
    primaryColor: '#10b981',
    companyName: 'SparesTech',
    logoUrl: null
  }

  const defaultDisplay = {
    showPrices: true,
    showStock: true,
    showCategories: true
  }

  const defaultAccess = {
    isPublic: true,
    allowRegistration: true
  }

  // Retourner les valeurs avec fallback
  const theme = {
    primaryColor: state.settings?.primary_color || defaultTheme.primaryColor,
    companyName: state.settings?.company_name || defaultTheme.companyName,
    logoUrl: state.settings?.logo_url || defaultTheme.logoUrl
  }

  const display = {
    showPrices: state.settings?.show_prices ?? defaultDisplay.showPrices,
    showStock: state.settings?.show_stock ?? defaultDisplay.showStock,
    showCategories: state.settings?.show_categories ?? defaultDisplay.showCategories
  }

  const access = {
    isPublic: state.settings?.public_access ?? defaultAccess.isPublic,
    allowRegistration: state.settings?.public_access ?? defaultAccess.allowRegistration
  }

  return {
    settings: state.settings,
    loading: state.loading,
    initialized: state.initialized,
    theme,
    display,
    access,
    updateSettings,
    refreshSettings,
    clearCache
  }
} 