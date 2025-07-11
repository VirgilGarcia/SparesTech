import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { settingsService } from '../services/settingsService'
import type { MarketplaceSettings } from '../services/settingsService'

export function useMarketplaceSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      setSettings(null)
      setLoading(false)
    }
  }, [user])

  const loadSettings = async () => {
    try {
      setLoading(true)
      console.log('🔄 Chargement settings pour user:', user!.id)
      
      const data = await settingsService.getSettings(user!.id)
      console.log('📊 Settings récupérés:', data)
      
      setSettings(data)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres:', error)
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<MarketplaceSettings>) => {
    if (!user || !settings) return

    try {
      console.log('💾 Sauvegarde settings:', updates)
      const updated = await settingsService.updateSettings(user.id, updates)
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