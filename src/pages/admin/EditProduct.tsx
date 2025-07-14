import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { productStructureService } from '../../services/productStructureService'
import { categoryService } from '../../services/categoryService'
import { useAuth } from '../../context/AuthContext'
import { useMarketplaceSettings } from '../../hooks/useMarketplaceSettings'
import { Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import DynamicProductFields from '../../components/DynamicProductFields'
import MultiCategorySelector from '../../components/MultiCategorySelector'

function EditProduct() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { settings, loading: settingsLoading } = useMarketplaceSettings()
  
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    price: '',
    stock: '',
    image_url: '',
    category_ids: [] as number[],
    // Options de visibilité
    is_visible: true,
    is_sellable: true
  })

  // État pour les champs personnalisés - nouvelle approche
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [error, setError] = useState('')



  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoadingProduct(true)
      const product = await productService.getProductById(id!)
      if (product) {
        // Charger les catégories du produit
        const productCategories = await categoryService.getProductCategories(id!)
        const categoryIds = productCategories.map(pc => pc.category_id)

        setFormData({
          name: product.name,
          reference: product.reference,
          price: product.prix.toString(),
          stock: product.stock.toString(),
          image_url: product.photo_url || '',
          category_ids: categoryIds,
          // Options de visibilité
          is_visible: product.visible,
          is_sellable: product.vendable
        })

        // Charger les valeurs des champs personnalisés existantes avec les informations complètes
        const fieldValues = await productService.getProductFieldValues(id!)
        const customFieldValues: Record<string, string> = {}
        fieldValues.forEach(fv => {
          if (fv.product_fields) {
            customFieldValues[fv.product_fields.name] = fv.value
          }
        })
        setCustomFields(customFieldValues)
      }
    } catch (err: any) {
      setError('Erreur lors du chargement du produit')
    } finally {
      setLoadingProduct(false)
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Récupérer tous les champs pour obtenir les IDs
      const allFields = await productStructureService.getAllFields()
      
      // Convertir les champs personnalisés au format attendu par l'API
      const customFieldValues = Object.entries(customFields)
        .map(([fieldName, value]) => {
          const field = allFields.find(f => f.name === fieldName)
          if (!field) return null
          return {
            field_id: field.id,
            value: value.toString()
          }
        })
        .filter(Boolean)

              await productService.updateProduct(id!, {
          name: formData.name,
          reference: formData.reference,
          prix: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          photo_url: formData.image_url,
          category_ids: formData.category_ids,
          // Options de visibilité
          visible: formData.is_visible,
          vendable: formData.is_sellable,
          // Champs personnalisés
          custom_field_values: customFieldValues
        })
      
      navigate('/admin/products')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du produit')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || settingsLoading || loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loadingProduct ? 'Chargement du produit...' : 'Chargement...'}
          </p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Modifier le produit</h1>
          <p className="text-sm text-gray-600">Modifiez les informations du produit</p>
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
                    placeholder="Ex: Roulement SKF 6205-2RS"
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
                    placeholder="Ex: 6205-2RS"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
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
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
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
            {settings?.allow_product_visibility_toggle && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Options de visibilité
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_visible"
                      name="is_visible"
                      checked={formData.is_visible}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="is_visible" className="text-sm font-medium text-gray-700">
                      Visible dans le catalogue
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_sellable"
                      name="is_sellable"
                      checked={formData.is_sellable}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="is_sellable" className="text-sm font-medium text-gray-700">
                      Disponible à la vente
                    </label>
                  </div>
                </div>
              </div>
            )}



            {/* Champs personnalisés */}
            <DynamicProductFields
              values={customFields}
              onChange={setCustomFields}
              productId={id}
            />

            {/* Boutons d'action */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Modification en cours...</span>
                  </div>
                ) : (
                  'Modifier le produit'
                )}
              </button>

              <Link 
                to="/admin/products"
                className="flex-1 py-2 px-4 rounded-lg font-medium text-center border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProduct