import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { productStructureService } from '../../services/productStructureService'
import { useAuth } from '../../../shared/context/AuthContext'
import { useMarketplaceSettings } from '../../hooks/useMarketplaceSettings'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { Navigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import DynamicProductFields from '../../components/product/DynamicProductFields'
import MultiCategorySelector from '../../components/category/MultiCategorySelector'
import { supabase } from '../../../lib/supabase'

function AddProduct() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const navigate = useNavigate()
  const { settings, loading: settingsLoading } = useMarketplaceSettings()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    prix: '',
    stock: '',
    photo_url: '',
    visible: true,
    vendable: true,
    category_ids: [] as number[]
  })

  // État pour les champs personnalisés
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({}) 
  const [submitting, setSubmitting] = useState(false)

  // Charger le rôle utilisateur
  useEffect(() => {
    if (user) {
      loadUserRole()
    }
  }, [user])

  // Initialiser les valeurs par défaut depuis les settings
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        visible: true,
        vendable: true
      }))
    }
  }, [settings])

  const loadUserRole = async () => {
    if (!user) return
    
    try {
      setRoleLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom du produit est obligatoire'
    }
    
    if (!formData.reference.trim()) {
      errors.reference = 'La référence est obligatoire'
    }
    
    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      errors.prix = 'Le prix doit être supérieur à 0'
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      errors.stock = 'Le stock ne peut pas être négatif'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Préparer les données du produit
      const productData = {
        name: formData.name,
        reference: formData.reference,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock),
        photo_url: formData.photo_url || undefined,
        visible: formData.visible,
        vendable: formData.vendable,
        category_ids: formData.category_ids
      }

      // Ajouter le produit
      const newProduct = await productService.addProduct(productData)

      // Sauvegarder les valeurs des champs personnalisés
      for (const [fieldName, value] of Object.entries(customFields)) {
        if (value !== undefined && value !== '') {
          // Récupérer l'ID du champ personnalisé
          const fields = await productStructureService.getAllFields()
          const field = fields.find(f => f.name === fieldName)
          if (field) {
            await productService.setProductFieldValue(newProduct.id, field.id, value.toString())
          }
        }
      }
      
      setSuccess('Produit créé avec succès !')
      setTimeout(() => {
        navigate('/admin/products')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du produit')
    } finally {
      setSubmitting(false)
    }
  }

  // Chargements et accès
  if (authLoading || settingsLoading) {
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
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}></div>
          <div className="text-gray-600">Vérification des permissions...</div>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/admin/products" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Retour aux produits</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${theme.primaryColor}20` }}>
              <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">Ajouter un produit</h1>
              <p className="text-gray-600">Créez un nouveau produit pour votre catalogue</p>
            </div>
          </div>
        </div>

        {/* Messages de statut */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Formulaire principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Informations du produit</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Section Informations de base */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                  Informations de base
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                        validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      style={!validationErrors.name ? {} : {}}
                      placeholder="Ex: Roulement à billes 6200"
                      required
                    />
                    {validationErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                      Référence *
                    </label>
                    <input
                      type="text"
                      id="reference"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                        validationErrors.reference ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      style={!validationErrors.reference ? {} : {}}
                      placeholder="Ex: REF-6200-001"
                      required
                    />
                    {validationErrors.reference && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.reference}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (€) *
                    </label>
                    <input
                      type="number"
                      id="prix"
                      name="prix"
                      value={formData.prix}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                        validationErrors.prix ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      style={!validationErrors.prix ? {} : {}}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                    {validationErrors.prix && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.prix}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                        validationErrors.stock ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      style={!validationErrors.stock ? {} : {}}
                      placeholder="0"
                      min="0"
                      required
                    />
                    {validationErrors.stock && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.stock}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-2">
                      URL de l'image
                    </label>
                    <input
                      type="url"
                      id="photo_url"
                      name="photo_url"
                      value={formData.photo_url}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                      placeholder="https://exemple.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Section Catégories */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                  Catégories
                </h3>
                
                <MultiCategorySelector
                  value={formData.category_ids}
                  onChange={(categoryIds) => setFormData(prev => ({ ...prev, category_ids: categoryIds }))}
                />
              </div>

              {/* Section Visibilité */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                  Options de visibilité
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Produit visible</p>
                        <p className="text-sm text-gray-600">Visible dans le catalogue public</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="visible"
                        checked={formData.visible}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                           style={{ 
                             backgroundColor: formData.visible ? theme.primaryColor : undefined,
                             boxShadow: formData.visible ? `0 0 0 4px ${theme.primaryColor}20` : undefined
                           }}>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3M7 13l1.5 3m0 0h9m-9-3a2 2 0 110 4 2 2 0 010-4zm9 0a2 2 0 110 4 2 2 0 010-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Produit vendable</p>
                        <p className="text-sm text-gray-600">Peut être ajouté au panier</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="vendable"
                        checked={formData.vendable}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                           style={{ 
                             backgroundColor: formData.vendable ? theme.primaryColor : undefined,
                             boxShadow: formData.vendable ? `0 0 0 4px ${theme.primaryColor}20` : undefined
                           }}>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section Champs personnalisés */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                  Champs personnalisés
                </h3>
                
                <DynamicProductFields
                  values={customFields}
                  onChange={setCustomFields}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-100">
              <Link
                to="/admin/products"
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création...
                  </div>
                ) : (
                  'Créer le produit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct