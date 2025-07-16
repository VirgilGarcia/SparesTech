import { useState, useEffect, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMarketplaceTheme } from '../../context/ThemeContext'
import { settingsService } from '../../services/settingsService'
import type { MarketplaceSettings } from '../../services/settingsService'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'

function AdminSettings() {
  const { user, loading: authLoading } = useAuth()
  const { theme, refreshSettings } = useMarketplaceTheme()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [autoSaving, setAutoSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // États du formulaire
  const [formData, setFormData] = useState({
    public_access: true,
    company_name: '',
    primary_color: '#10b981'
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  // Vérification du rôle admin
  useEffect(() => {
    if (user) {
      loadUserRole()
    }
  }, [user])

  useEffect(() => {
    if (user && userRole === 'admin') {
      loadSettings()
    }
  }, [user, userRole])

  // Initialiser le formulaire quand settings se charge
  useEffect(() => {
    if (settings) {
      setFormData({
        public_access: settings.public_access,
        company_name: settings.company_name || '',
        primary_color: settings.primary_color
      })
      setLogoPreview(settings.logo_url || '')
    }
  }, [settings])

  const loadUserRole = async () => {
    try {
      setRoleLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      if (error) throw error
      setUserRole(data.role)
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error)
      setUserRole('client')
    } finally {
      setRoleLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      setSettingsLoading(true)
      const data = await settingsService.getSettings(user!.id)
      setSettings(data)
    } catch (error) {
      console.error('❌ Erreur chargement settings:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifications
      if (!file.type.startsWith('image/')) {
        return
      }
      
      if (file.size > 2 * 1024 * 1024) {
        return
      }
      
      setLogoFile(file)
      
      // Créer l'aperçu
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return null

    try {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, logoFile)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('❌ Erreur upload logo:', error)
      throw new Error('Erreur lors de l\'upload du logo')
    }
  }

  // Sauvegarde automatique avec debounce
  const autoSave = useCallback(async (updatedFormData: typeof formData, logoToUpload?: File | null) => {
    if (!user || !settings) return

    try {
      setAutoSaving(true)
      
      let logoUrl = settings.logo_url

      // Upload du logo si nouveau fichier
      if (logoToUpload) {
        const uploadedLogoUrl = await uploadLogo()
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl
        }
      }

      // Sauvegarder les paramètres
      const updates = {
        ...updatedFormData,
        logo_url: logoUrl
      }

      const updated = await settingsService.updateSettings(user.id, updates)
      setSettings(updated)
      
      if (logoToUpload) {
        setLogoFile(null)
      }
      
      // Forcer le rechargement des paramètres dans le contexte global
      refreshSettings()
      
      setSaveMessage({ type: 'success', text: 'Sauvegardé automatiquement' })
      setTimeout(() => setSaveMessage(null), 3000)
      
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde auto:', error)
      setSaveMessage({ type: 'error', text: 'Erreur de sauvegarde' })
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setAutoSaving(false)
    }
  }, [user, settings, logoFile, refreshSettings])

  // Fonction pour déclencher la sauvegarde avec délai
  const triggerAutoSave = useCallback((updatedFormData: typeof formData, logoToUpload?: File | null) => {
    // Annuler le timeout précédent
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Programmer la sauvegarde dans 1 seconde
    const timeout = setTimeout(() => {
      autoSave(updatedFormData, logoToUpload)
    }, 1000)

    setSaveTimeout(timeout)
  }, [saveTimeout, autoSave])

  // Gestionnaires d'événements avec sauvegarde automatique
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    const updatedFormData = { ...formData, [field]: value }
    setFormData(updatedFormData)
    triggerAutoSave(updatedFormData)
  }

  const handleLogoChangeWithAutoSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleLogoChange(e)
    if (e.target.files?.[0]) {
      triggerAutoSave(formData, e.target.files[0])
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [saveTimeout])

  // Chargements et accès
  if (authLoading || roleLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}></div>
          <div className="text-gray-600">Chargement des paramètres...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">Vous devez être administrateur pour accéder à cette page.</p>
            <div className="space-y-3">
              <Link 
                to="/admin"
                className="block w-full text-white px-6 py-3 rounded-xl hover:opacity-90 transition-colors text-center font-medium"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Paramètres introuvables</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">Impossible de charger les paramètres de votre marketplace.</p>
            <Link 
              to="/admin" 
              className="block w-full text-white px-6 py-3 rounded-xl hover:opacity-90 transition-colors text-center font-medium"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* En-tête moderne */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">Paramètres</h1>
                <p className="text-gray-600">Personnalisez votre marketplace</p>
              </div>
            </div>

            {/* Indicateur de sauvegarde */}
            <div className="flex items-center gap-3">
              {autoSaving && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-800 font-medium">Sauvegarde...</span>
                </div>
              )}
              
              {saveMessage && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <svg className={`w-4 h-4 ${
                    saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {saveMessage.type === 'success' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <span className={`text-sm font-medium ${
                    saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>{saveMessage.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section Identité */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: `${theme.primaryColor}20` }}>
                  <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a4 4 0 004-4V5a2 2 0 00-2-2h-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Identité visuelle</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Logo de l'entreprise
                  </label>
                  
                  <div className="flex items-start gap-6">
                    {/* Aperçu du logo */}
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="text-xs">Logo</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload */}
                    <div className="flex-1 space-y-3">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoChangeWithAutoSave}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center gap-2 px-4 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choisir un logo
                      </label>
                      <p className="text-xs text-gray-600">
                        JPG, PNG ou GIF • Maximum 2 MB
                      </p>
                      {logoFile && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {logoFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nom du marketplace */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-3">
                    Nom du marketplace
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    style={{ 
                    }}
                    placeholder="Nom affiché sur votre marketplace"
                  />
                </div>

                {/* Couleur du thème */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                    Couleur du thème
                  </h3>
                  
                  <div>
                    <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-3">
                      Couleur principale du marketplace
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        className="w-16 h-16 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm font-mono"
                          style={{ 
                          }}
                          placeholder="#10b981"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Cette couleur sera utilisée pour les boutons, liens et éléments interactifs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Paramètres d'accès */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: `${theme.primaryColor}20` }}>
                  <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Paramètres d'accès</h2>
              </div>
            </div>
            
            <div className="p-6">
            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Mode d'accès au marketplace
                </label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.public_access 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      checked={formData.public_access}
                      onChange={() => handleInputChange('public_access', true)}
                      className="mt-1"
                      style={{ accentColor: theme.primaryColor }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-gray-900">Marketplace public</span>
                        {formData.public_access && (
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Activé
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Accès libre au catalogue • Les visiteurs peuvent s'inscrire • Recommandé pour le e-commerce
                      </p>
                    </div>
                  </label>
                  
                  <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    !formData.public_access 
                      ? 'border-orange-300 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      checked={!formData.public_access}
                      onChange={() => handleInputChange('public_access', false)}
                      className="mt-1"
                      style={{ accentColor: theme.primaryColor }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-semibold text-gray-900">Marketplace privé</span>
                        {!formData.public_access && (
                          <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                            Activé
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Connexion obligatoire • Seuls les admins créent des comptes • Idéal pour les partenaires B2B
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Structure produits - Accès direct */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Structure des produits</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 mb-4">
                  Personnalisez la structure de vos produits avec des champs personnalisés selon vos besoins métier.
                </p>
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Fonctionnalités avancées</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Créez des champs personnalisés (texte, nombre, liste, etc.)</li>
                      <li>Configurez l'affichage dans le catalogue et les pages produit</li>
                      <li>Réorganisez l'ordre des champs par drag & drop</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="ml-6">
                <Link
                  to="/admin/product-structure"
                  className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Gérer la structure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings