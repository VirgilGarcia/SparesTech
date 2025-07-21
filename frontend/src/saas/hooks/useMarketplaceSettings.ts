import { useState, useEffect } from 'react'
import { useAuth } from '../../shared/context/AuthContext'
import { useTenantContext } from '../../shared/context/TenantContext'
import { settingsService } from '../services/settingsService'
import type { MarketplaceSettings } from '../services/settingsService'

export function useMarketplaceSettings() {
  const { user } = useAuth()
  const { tenantId } = useTenantContext()
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [user, tenantId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getSettings(tenantId)
      setSettings(data)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres:', error)
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<MarketplaceSettings>) => {
    if (!tenantId) return

    try {
      const updated = await settingsService.updateSettings(tenantId, updates)
      setSettings(updated)
      return updated
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des paramètres:', error)
      throw error
    }
  }

  return {
    settings,
    loading,
    updateSettings,
    refetch: loadSettings
  }
}