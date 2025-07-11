import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { settingsService } from '../../services/settingsService'
import type { MarketplaceSettings } from '../../services/settingsService'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'

function AdminSettings() {
  const { user, loading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // États du formulaire
  const [formData, setFormData] = useState({
    // Accès
    public_access: true,
    allow_public_registration: true,
    
    // Affichage de base
    show_prices: true,
    show_stock: true,
    show_references: true,
    show_descriptions: true,
    show_categories: true,
    
    // Nouvelles options d'affichage produits
    show_weight: false,
    show_dimensions: false,
    show_sku: true,
    show_brand: false,
    show_supplier: false,
    show_technical_specs: false,
    show_warranty: false,
    show_delivery_info: true,
    
    // Options de visibilité produits
    allow_product_visibility_toggle: true,
    default_product_visibility: true,
    
    // Branding
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
        allow_public_registration: settings.allow_public_registration,
        show_prices: settings.show_prices,
        show_stock: settings.show_stock,
        show_references: settings.show_references,
        show_descriptions: settings.show_descriptions,
        show_categories: settings.show_categories,
        // Nouvelles options d'affichage produits
        show_weight: settings.show_weight ?? false,
        show_dimensions: settings.show_dimensions ?? false,
        show_sku: settings.show_sku ?? true,
        show_brand: settings.show_brand ?? false,
        show_supplier: settings.show_supplier ?? false,
        show_technical_specs: settings.show_technical_specs ?? false,
        show_warranty: settings.show_warranty ?? false,
        show_delivery_info: settings.show_delivery_info ?? true,
        // Options de visibilité produits
        allow_product_visibility_toggle: settings.allow_product_visibility_toggle ?? true,
        default_product_visibility: settings.default_product_visibility ?? true,
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

      console.log('💾 Sauvegarde complète:', updates)
      
      const updated = await settingsService.updateSettings(user.id, updates)
      setSettings(updated)
      setLogoFile(null)
      
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
      formData.allow_public_registration !== settings.allow_public_registration ||
      formData.show_prices !== settings.show_prices ||
      formData.show_stock !== settings.show_stock ||
      formData.show_references !== settings.show_references ||
      formData.show_descriptions !== settings.show_descriptions ||
      formData.show_categories !== settings.show_categories ||
      // Nouvelles options d'affichage produits
      formData.show_weight !== (settings.show_weight ?? false) ||
      formData.show_dimensions !== (settings.show_dimensions ?? false) ||
      formData.show_sku !== (settings.show_sku ?? true) ||
      formData.show_brand !== (settings.show_brand ?? false) ||
      formData.show_supplier !== (settings.show_supplier ?? false) ||
      formData.show_technical_specs !== (settings.show_technical_specs ?? false) ||
      formData.show_warranty !== (settings.show_warranty ?? false) ||
      formData.show_delivery_info !== (settings.show_delivery_info ?? true) ||
      // Options de visibilité produits
      formData.allow_product_visibility_toggle !== (settings.allow_product_visibility_toggle ?? true) ||
      formData.default_product_visibility !== (settings.default_product_visibility ?? true) ||
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
              {/* Mode public/privé */}
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
                        Accès libre au marketplace
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
                        Connexion obligatoire
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Inscription publique */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Inscription
                </label>
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      checked={formData.allow_public_registration}
                      onChange={() => setFormData(prev => ({ ...prev, allow_public_registration: true }))}
                      className="text-blue-600 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">✅ Libre</div>
                      <div className="text-xs text-gray-600">
                        Inscription publique
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      checked={!formData.allow_public_registration}
                      onChange={() => setFormData(prev => ({ ...prev, allow_public_registration: false }))}
                      className="text-blue-600 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">🛡️ Contrôlée</div>
                      <div className="text-xs text-gray-600">
                        Admins seulement
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Affichage des produits */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📦 Affichage Produits</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choisissez les informations à afficher
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_prices}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_prices: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">💰 Prix</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_stock: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">📦 Stock</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_references}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_references: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">🏷️ Références</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_descriptions}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_descriptions: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">📝 Descriptions</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_categories}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_categories: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">📁 Catégories</div>
                </div>
              </label>
            </div>
          </div>

          {/* Nouvelles options d'affichage produits */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔧 Informations Techniques</h2>
            <p className="text-sm text-gray-600 mb-4">
              Options d'affichage pour les détails techniques des produits
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_weight: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">⚖️ Poids</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_dimensions: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">📏 Dimensions</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_sku: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">🏷️ SKU</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_brand: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">🏭 Marque</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_supplier: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">🏢 Fournisseur</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_technical_specs}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_technical_specs: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">⚙️ Spécifications</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_warranty}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_warranty: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">🛡️ Garantie</div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.show_delivery_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_delivery_info: e.target.checked }))}
                  className="text-blue-600 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">🚚 Livraison</div>
                </div>
              </label>
            </div>
          </div>

          {/* Options de visibilité produits */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">👁️ Visibilité Produits</h2>
            <p className="text-sm text-gray-600 mb-4">
              Contrôlez la visibilité des produits sur le marketplace
            </p>
            
            <div className="space-y-4">
              {/* Activer le toggle de visibilité */}
              <div>
                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.allow_product_visibility_toggle}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_product_visibility_toggle: e.target.checked }))}
                    className="text-blue-600 mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">🎛️ Activer le contrôle de visibilité</div>
                    <div className="text-xs text-gray-600">
                      Permettre de rendre les produits invisibles ou invendables
                    </div>
                  </div>
                </label>
              </div>

              {/* Visibilité par défaut */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Visibilité par défaut des nouveaux produits
                </label>
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      checked={formData.default_product_visibility}
                      onChange={() => setFormData(prev => ({ ...prev, default_product_visibility: true }))}
                      className="text-blue-600 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">✅ Visible</div>
                      <div className="text-xs text-gray-600">
                        Nouveaux produits visibles par défaut
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      checked={!formData.default_product_visibility}
                      onChange={() => setFormData(prev => ({ ...prev, default_product_visibility: false }))}
                      className="text-blue-600 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">🚫 Masqué</div>
                      <div className="text-xs text-gray-600">
                        Nouveaux produits masqués par défaut
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminSettings