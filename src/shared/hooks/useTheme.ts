import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { settingsService } from '../../saas/services/settingsService'
import type { MarketplaceSettings } from '../../saas/services/settingsService'

interface ThemeState {
  settings: MarketplaceSettings | null
  loading: boolean
  initialized: boolean
}

export function useTheme(tenantId?: string) {
  const { user } = useAuth()
  const [state, setState] = useState<ThemeState>({
    settings: null,
    loading: !tenantId, // Si pas de tenantId, pas de loading
    initialized: !tenantId
  })
  const cacheRef = useRef<Map<string, { data: MarketplaceSettings; timestamp: number }>>(new Map())

  const loadSettings = useCallback(async () => {
    if (!tenantId) {
      // Pas de tenantId = site startup, utiliser les valeurs par défaut
      setState({
        settings: null,
        loading: false,
        initialized: true
      })
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true }))
      
      // Charger les paramètres du marketplace
      const settings = await settingsService.getPublicSettings(tenantId)
      
      // Mettre en cache
      const cacheData = {
        data: settings,
        timestamp: Date.now()
      }
      localStorage.setItem('spartelio-theme', JSON.stringify(cacheData))
      
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
  }, [tenantId])

  // Vérifier le cache local storage au démarrage
  useEffect(() => {
    // Forcer le rechargement des paramètres (ignorer le cache temporairement)
    loadSettings()
  }, [loadSettings])

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
      localStorage.setItem('spartelio-theme', JSON.stringify(cacheData))
      
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
    localStorage.removeItem('spartelio-theme')
    cacheRef.current.clear()
  }

  const refreshSettings = useCallback(() => {
    clearCache()
    loadSettings()
  }, [loadSettings])

  // Valeurs par défaut sécurisées
  const defaultTheme = {
    primaryColor: '#10b981',
    companyName: 'Spartelio',
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