import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { useTenantContext } from '../../../shared/context/TenantContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { settingsService } from '../../services/settingsService'
import type { MarketplaceSettings } from '../../services/settingsService'
import Header from '../../components/layout/Header'
import { GeneralSettings, LogoSettings, SettingsNav } from '../../components/settings'

function AdminSettings() {
  const { user, loading: authLoading } = useAuth()
  const { tenantId, loading: tenantLoading, isAdmin } = useTenantContext()
  const { theme, refreshSettings } = useMarketplaceTheme()
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [autoSaving, setAutoSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'logo'>('general')

  // États du formulaire
  const [formData, setFormData] = useState({
    public_access: true,
    company_name: '',
    primary_color: '#3B82F6',
    subdomain: '',
    custom_domain: ''
  })
  const [logoPreview, setLogoPreview] = useState('')

  useEffect(() => {
    if (tenantId && isAdmin) {
      loadSettings()
    }
  }, [tenantId, isAdmin])

  // Initialiser le formulaire quand settings se charge
  useEffect(() => {
    if (settings) {
      setFormData({
        public_access: settings.public_access,
        company_name: settings.company_name || '',
        primary_color: settings.primary_color,
        subdomain: settings.subdomain || '',
        custom_domain: settings.custom_domain || ''
      })
      setLogoPreview(settings.logo_url || '')
    }
  }, [settings])

  const loadSettings = async () => {
    try {
      setSettingsLoading(true)
      const data = await settingsService.getSettings(tenantId!)
      setSettings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      setSaveMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' })
    } finally {
      setSettingsLoading(false)
    }
  }

  const showSaveMessage = useCallback((type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text })
    setTimeout(() => setSaveMessage(null), 3000)
  }, [])

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-save après 1 seconde
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    const timeout = setTimeout(() => {
      autoSave({ ...formData, [field]: value })
    }, 1000)
    
    setSaveTimeout(timeout)
  }, [formData, saveTimeout])

  const autoSave = async (data: typeof formData) => {
    try {
      setAutoSaving(true)
      await settingsService.updateSettings(tenantId!, data)
      await refreshSettings()
      showSaveMessage('success', 'Paramètres sauvegardés automatiquement')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      showSaveMessage('error', 'Erreur lors de la sauvegarde')
    } finally {
      setAutoSaving(false)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      setAutoSaving(true)
      await settingsService.removeLogo(tenantId!)
      await settingsService.updateSettings(tenantId!, { logo_url: '' })
      await refreshSettings()
      setLogoPreview('')
      showSaveMessage('success', 'Logo supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression du logo:', error)
      showSaveMessage('error', 'Erreur lors de la suppression du logo')
    } finally {
      setAutoSaving(false)
    }
  }

  // Chargements et accès
  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}></div>
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium">Chargement des paramètres...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">Configurez votre marketplace</p>
        </div>

        {/* Messages */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-xl ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                saveMessage.type === 'success' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  saveMessage.type === 'success' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {saveMessage.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <p className={`font-medium ${
                saveMessage.type === 'success' 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>
                {saveMessage.text}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <SettingsNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Contenu */}
          <div className="lg:col-span-3">
            <div className="bg-white">
              {activeTab === 'general' && (
                <GeneralSettings
                  formData={formData}
                  onInputChange={handleInputChange}
                  autoSaving={autoSaving}
                  saveMessage={saveMessage}
                />
              )}
              
              {activeTab === 'logo' && (
                <LogoSettings
                  logoPreview={logoPreview}
                  onRemoveLogo={handleRemoveLogo}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings