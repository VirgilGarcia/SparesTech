import { useState, useEffect } from 'react'
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
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // États du formulaire
  const [formData, setFormData] = useState({
    public_access: true,
    company_name: '',
    primary_color: '#10b981',
    secondary_color: '#f3f4f6'
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
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color
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
      setError('Erreur lors du chargement des paramètres')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifications
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image')
        return
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setError('Le fichier doit faire moins de 2MB')
        return
      }
      
      setError('')
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

  const handleSaveAll = async () => {
    if (!user || !settings) return

    try {
      setSaving(true)
      setError('')
      
      let logoUrl = settings.logo_url

      // Upload du logo si nouveau fichier
      if (logoFile) {
        const uploadedLogoUrl = await uploadLogo()
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl
        }
      }

      // Sauvegarder tous les paramètres
      const updates = {
        ...formData,
        logo_url: logoUrl
      }

  
      
      const updated = await settingsService.updateSettings(user.id, updates)
      setSettings(updated)
      setLogoFile(null)
      
      // Forcer le rechargement des paramètres dans le contexte global
      refreshSettings()
      
      setSuccess('Tous les paramètres ont été sauvegardés avec succès !')
      setTimeout(() => setSuccess(''), 5000)
      
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error)
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (!settings) return false
    
    return (
      logoFile !== null ||
      formData.public_access !== settings.public_access ||
      formData.company_name !== (settings.company_name || '') ||
      formData.primary_color !== settings.primary_color ||
      formData.secondary_color !== settings.secondary_color
    )
  }

  // Chargements
  if (authLoading || roleLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement des paramètres...</div>
      </div>
    )
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/login" replace />
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paramètres introuvables</h1>
          <Link to="/admin" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre et bouton de sauvegarde */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Paramètres</h1>
            <p className="text-sm text-gray-600">Personnalisez votre marketplace</p>
          </div>
          
          {/* Bouton de sauvegarde unique */}
          <div className="flex items-center space-x-3">
            {success && (
              <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}
            
            <button
              onClick={handleSaveAll}
              disabled={saving || !hasChanges()}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                saving
                  ? 'bg-blue-500 text-white cursor-not-allowed'
                  : hasChanges()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? '💾 Sauvegarde...' : hasChanges() ? '💾 Sauvegarder' : '✅ Sauvegardé'}
            </button>
            
            <button
              onClick={() => {
                refreshSettings()
                setSuccess('Paramètres rechargés !')
                setTimeout(() => setSuccess(''), 3000)
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              title="Forcer le rechargement des paramètres"
            >
              🔄 Recharger
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Branding */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🎨 Identité</h2>
            
            <div className="space-y-4">
              {/* Logo */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Logo
                </label>
                
                <div className="flex items-start space-x-4">
                  {/* Aperçu du logo */}
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">🏢</div>
                        <div className="text-xs">Logo</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-block px-3 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors cursor-pointer text-sm"
                    >
                      📤 Choisir
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      JPG, PNG • Max 2MB
                    </p>
                    {logoFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ {logoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Nom de l'entreprise */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Nom affiché sur le marketplace"
                />
              </div>

              {/* Couleurs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primary_color" className="block text-sm font-semibold text-gray-900 mb-2">
                    Couleur principale
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="primary_color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      placeholder="#10b981"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="secondary_color" className="block text-sm font-semibold text-gray-900 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="secondary_color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      placeholder="#f3f4f6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Paramètres d'accès */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔐 Accès</h2>
            
            <div className="space-y-4">
              {/* Mode d'accès */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Mode d'accès
                </label>
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      checked={formData.public_access}
                      onChange={() => setFormData(prev => ({ ...prev, public_access: true }))}
                      className="text-blue-600 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">🌐 Public</div>
                      <div className="text-xs text-gray-600">
                        Accès libre au marketplace • Inscription publique autorisée
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      checked={!formData.public_access}
                      onChange={() => setFormData(prev => ({ ...prev, public_access: false }))}
                      className="text-blue-600 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">🔒 Privé</div>
                      <div className="text-xs text-gray-600">
                        Connexion obligatoire • Seuls les admins peuvent créer des comptes
                      </div>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>


        </div>

        {/* Gestion de la structure des produits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">🏗️ Structure des Produits</h2>
              <p className="text-sm text-gray-600 mt-1">
                Personnalisez la structure de vos produits selon vos besoins métier
              </p>
            </div>
            <Link
              to="/admin/product-structure"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: theme.primaryColor }}
            >
              🛠️ Gérer la structure
            </Link>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-emerald-500 text-lg">💡</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Personnalisation avancée</h3>
                <p className="text-sm text-gray-600">
                  Créez vos propres champs de produits, choisissez leur type (texte, nombre, liste, etc.) 
                  et configurez leur affichage dans le catalogue et les pages de détail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <Link
            to="/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings