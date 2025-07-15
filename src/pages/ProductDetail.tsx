import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useMarketplaceTheme } from '../context/ThemeContext'
import { productService } from '../services/productService'
import { productStructureService } from '../services/productStructureService'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import FieldRenderer from '../components/FieldRenderer'
import CategoryBreadcrumb from '../components/CategoryBreadcrumb'
import type { Product, ProductFieldDisplay, ProductFieldValue, ProductField } from '../services/productService'

interface ProductFieldValueWithField extends ProductFieldValue {
  product_fields: ProductField
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { display, theme } = useMarketplaceTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [fieldDisplay, setFieldDisplay] = useState<ProductFieldDisplay[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: string]: string }>({})
  const [customFields, setCustomFields] = useState<ProductField[]>([])
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (id) {
      loadProduct()
      loadFieldDisplay()
      loadCustomFieldValues()
      loadCustomFields()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await productService.getProductById(id!)
      if (data) {
        console.log('📦 Données produit chargées:', data)
        console.log('🏷️ Categories du produit:', data.product_categories)
        setProduct(data)
      } else {
        setError('Produit non trouvé')
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement du produit:', err)
      setError('Erreur lors du chargement du produit')
    } finally {
      setLoading(false)
    }
  }

  const loadFieldDisplay = async () => {
    try {
      const data = await productStructureService.getAllFieldDisplay()
      setFieldDisplay(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration d\'affichage:', error)
    }
  }

  const loadCustomFieldValues = async () => {
    try {
      const fieldValues = await productService.getProductFieldValues(id!) as ProductFieldValueWithField[]
      const values: { [key: string]: string } = {}
      fieldValues.forEach(fv => {
        if (fv.product_fields) {
          values[fv.product_fields.name] = fv.value
        }
      })
      setCustomFieldValues(values)
    } catch (error) {
      console.error('Erreur lors du chargement des valeurs des champs personnalisés:', error)
    }
  }

  const loadCustomFields = async () => {
    try {
      const fields = await productStructureService.getAllFields()
      setCustomFields(fields)
    } catch (error) {
      console.error('Erreur lors du chargement des champs personnalisés:', error)
    }
  }

  const handleAddToCart = async () => {
    if (product && quantity > 0) {
      setAddingToCart(true)
      try {
        // Ajouter la quantité spécifiée
        for (let i = 0; i < quantity; i++) {
          addToCart(product)
        }
        // Animation de succès
        setTimeout(() => setAddingToCart(false), 1000)
      } catch (error) {
        setAddingToCart(false)
      }
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity)
    }
  }

  // Fonctions utilitaires pour vérifier l'affichage des champs
  const shouldShowField = (fieldName: string): boolean => {
    const field = fieldDisplay.find(f => f.field_name === fieldName)
    return field ? field.show_in_product : false
  }

  const getFieldValue = (fieldName: string): string | null => {
    if (fieldDisplay.find(f => f.field_name === fieldName)?.field_type === 'system') {
      return product?.[fieldName]?.toString() || null
    } else {
      return customFieldValues[fieldName] || null
    }
  }

  const getFieldDisplayName = (fieldName: string): string => {
    const field = fieldDisplay.find(f => f.field_name === fieldName)
    return field ? field.display_name : fieldName
  }

  // Fonction helper pour obtenir la catégorie principale d'un produit
  const getMainCategoryId = (product: Product): number | null => {
    if (!product.product_categories || product.product_categories.length === 0) {
      console.log('🔍 Pas de catégories trouvées pour le produit:', product.name)
      return null
    }
    const categoryId = product.product_categories[0].category_id
    console.log('🔍 Catégorie principale trouvée:', categoryId, 'pour le produit:', product.name)
    return categoryId
  }

  // Fonction pour afficher tous les champs dans l'ordre configuré (page produit)
  const renderOrderedFields = () => {
    const allFields = fieldDisplay
      .filter(display => display.show_in_product)
      .filter(display => !['visible', 'vendable', 'photo_url'].includes(display.field_name))
      .sort((a, b) => a.product_order - b.product_order)

    return allFields.map(display => {
      const value = getFieldValue(display.field_name)
      if (!value) return null

      // Rendu spécial pour certains champs système
      if (display.field_name === 'name') {
        return (
          <h1 key={display.id} className="text-2xl font-bold text-gray-900 leading-tight">
            {value}
          </h1>
        )
      }

      if (display.field_name === 'reference') {
        return (
          <div key={display.id} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full w-fit">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="font-mono font-medium">{value}</span>
          </div>
        )
      }

      if (display.field_name === 'prix') {
        return (
          <div key={display.id} className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
            {parseFloat(value).toFixed(2)}€
          </div>
        )
      }

      if (display.field_name === 'stock') {
        const stockLevel = product && product.stock > 10 ? 'high' : product && product.stock > 0 ? 'medium' : 'low'
        const stockConfig = {
          high: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
          medium: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' },
          low: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' }
        }
        const config = stockConfig[stockLevel]
        
        return (
          <div key={display.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-fit ${config.bg} ${config.border}`}>
            <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
            <span className={`text-xs font-semibold ${config.text}`}>
              {product && product.stock > 0 ? `${value} en stock` : 'Rupture de stock'}
            </span>
          </div>
        )
      }

      // Champs personnalisés avec FieldRenderer
      if (display.field_type === 'custom') {
        const customField = customFields.find(f => f.name === display.field_name)
        if (!customField) return null

        return (
          <FieldRenderer
            key={display.id}
            fieldName={display.field_name}
            fieldType={customField.type}
            value={value}
            displayName={getFieldDisplayName(display.field_name)}
            context="product"
            options={customField.options || []}
          />
        )
      }

      // Autres champs système (fallback)
      return (
        <div key={display.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            {getFieldDisplayName(display.field_name)}
          </span>
          <span className="text-sm text-gray-900 font-semibold">{value}</span>
        </div>
      )
    })
  }

  // Créer un tableau d'images (image principale + images supplémentaires si disponibles)
  const getImages = () => {
    if (!product) return []
    const images = [product.photo_url || '/default-product-image.svg']
    // Ici on pourrait ajouter d'autres images si on avait un champ images supplémentaires
    return images
  }

  const images = getImages()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-16 xl:px-32 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.primaryColor }}></div>
            <p className="text-lg text-gray-600">Chargement du produit...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-16 xl:px-32 py-20">
          <div className="text-center bg-white rounded-2xl shadow-lg border border-gray-100 p-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Produit non trouvé</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Le produit que vous recherchez n'existe pas ou n'est plus disponible
            </p>
            <Link 
              to="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="w-full px-6 lg:px-16 xl:px-32 py-6">
        <nav className="flex items-center space-x-3 text-sm text-gray-600 mb-8">
          {/* Breadcrumb des catégories */}
          {getMainCategoryId(product) ? (
            <div className="flex items-center space-x-3">
              <CategoryBreadcrumb 
                categoryId={getMainCategoryId(product)}
                onCategorySelect={(categoryId) => {
                  if (categoryId === -1) {
                    navigate('/catalog')
                  } else {
                    navigate(`/catalog?category=${categoryId}`)
                  }
                }}
              />
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-semibold truncate">{product.name}</span>
            </div>
          ) : (
            // Fallback si pas de catégorie
            <div className="flex items-center space-x-3">
              <Link 
                to="/catalog" 
                className="hover:text-gray-900 transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Catalogue
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-semibold truncate">{product.name}</span>
            </div>
          )}
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="w-full px-6 lg:px-16 xl:px-32 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
            
          {/* Galerie photos - Fixe lors du scroll */}
          <div className="xl:sticky xl:top-8 xl:self-start space-y-6">
            {/* Image principale */}
            <div className="h-[calc(100vh-12rem)] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl overflow-hidden">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-product-image.svg';
                }}
              />
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${
                      selectedImage === index 
                        ? 'border-2 shadow-lg' 
                        : 'border-gray-200'
                    }`}
                    style={{ 
                      borderColor: selectedImage === index ? theme.primaryColor : undefined 
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div className="max-w-xl">
            {/* Card principale avec infos essentielles */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              
              {/* Header avec titre et référence */}
              <div className="p-6 border-b border-gray-100">
                <div className="space-y-3">
                  {renderOrderedFields()}
                </div>
              </div>

              {/* Actions d'achat */}
              <div className="p-6">
                {product.vendable && product.stock > 0 ? (
                  <div className="space-y-4">
                    {/* Quantité et bouton sur la même ligne */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Qté:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-semibold bg-gray-50 border-x border-gray-300 min-w-[50px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= product.stock}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Bouton ajouter au panier */}
                      <button 
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {addingToCart ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span className="text-sm">Ajout...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3M7 13l1.5 3m0 0h9m-9-3a2 2 0 110 4 2 2 0 010-4zm9 0a2 2 0 110 4 2 2 0 010-4z" />
                              </svg>
                              <span>Ajouter au panier</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-lg p-4 text-center border ${
                    !product.vendable 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`w-8 h-8 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      !product.vendable ? 'bg-orange-100' : 'bg-red-100'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        !product.vendable ? 'text-orange-600' : 'text-red-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className={`text-sm font-semibold mb-1 ${
                      !product.vendable ? 'text-orange-800' : 'text-red-800'
                    }`}>
                      {!product.vendable ? 'Non disponible' : 'Rupture de stock'}
                    </h3>
                    <p className={`text-xs ${
                      !product.vendable ? 'text-orange-700' : 'text-red-700'
                    }`}>
                      {!product.vendable 
                        ? 'Produit non disponible à la vente'
                        : 'Temporairement en rupture de stock'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 