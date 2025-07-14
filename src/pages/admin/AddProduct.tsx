import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { productStructureService } from '../../services/productStructureService'
import { useAuth } from '../../context/AuthContext'
import { useMarketplaceSettings } from '../../hooks/useMarketplaceSettings'
import { Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import DynamicProductFields from '../../components/DynamicProductFields'
import MultiCategorySelector from '../../components/MultiCategorySelector'

function AddProduct() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { settings, loading: settingsLoading } = useMarketplaceSettings()
  
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
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialiser les valeurs par défaut depuis les settings
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        visible: settings.default_product_visibility,
        vendable: true
      }))
    }
  }, [settings])

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

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
      
      navigate('/admin/products')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du produit')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre de la page */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Link 
              to="/admin/products" 
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Retour aux produits</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Ajouter un produit</h1>
          <p className="text-sm text-gray-600">Créez un nouveau produit pour votre catalogue</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Section Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Informations de base
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Nom du produit"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="REF-001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="24.99"
                    required
                  />
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
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  id="photo_url"
                  name="photo_url"
                  value={formData.photo_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="https://exemple.com/image.jpg"
                />
              </div>

              {/* Sélecteur de catégories multiples */}
              <MultiCategorySelector
                value={formData.category_ids}
                onChange={(categoryIds: number[]) => setFormData(prev => ({ ...prev, category_ids: categoryIds }))}
                placeholder="Sélectionner des catégories (optionnel)"
              />
            </div>

            {/* Section Options de visibilité */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Options de visibilité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="visible"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="visible" className="text-sm font-medium text-gray-700">
                    Visible dans le catalogue
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="vendable"
                    name="vendable"
                    checked={formData.vendable}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="vendable" className="text-sm font-medium text-gray-700">
                    Disponible à la vente
                  </label>
                </div>
              </div>
            </div>

            {/* Champs personnalisés */}
            <DynamicProductFields
              values={customFields}
              onChange={setCustomFields}
            />

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                to="/admin/products"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer le produit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct