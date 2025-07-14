import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { productService } from '../services/productService'
import { productStructureService } from '../services/productStructureService'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import FieldRenderer from '../components/FieldRenderer'
import type { Product, ProductFieldDisplay, ProductFieldValue, ProductField } from '../services/productService'

interface ProductFieldValueWithField extends ProductFieldValue {
  product_fields: ProductField
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { display, theme } = useTheme()
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
        setProduct(data)
      } else {
        setError('Produit non trouvé')
      }
    } catch (err: any) {
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

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      // Ajouter la quantité spécifiée
      for (let i = 0; i < quantity; i++) {
        addToCart(product)
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
          <h1 key={display.id} className="text-2xl font-bold text-gray-900 mb-2">
            {value}
          </h1>
        )
      }

      if (display.field_name === 'reference') {
        return (
          <div key={display.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
            </svg>
            <span className="font-mono font-medium">Ref: {value}</span>
          </div>
        )
      }

      if (display.field_name === 'prix') {
        return (
          <div key={display.id} className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
            {value}€
          </div>
        )
      }

      if (display.field_name === 'stock') {
        return (
          <div key={display.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            product && product.stock > 10 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : product && product.stock > 0 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              product && product.stock > 10 ? 'bg-green-500' : product && product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span>{product && product.stock > 0 ? `${value} en stock` : 'Rupture de stock'}</span>
          </div>
        )
      }

      // Champs personnalisés avec FieldRenderer
      if (display.field_type === 'custom') {
        // Trouver les informations du champ personnalisé
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
        <div key={display.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">
            {getFieldDisplayName(display.field_name)}
          </span>
          <span className="text-sm text-gray-900 font-medium">{value}</span>
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
        <div className="w-full max-w-none px-3 py-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Chargement du produit...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full max-w-none px-3 py-4">
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-base font-medium text-gray-900 mb-2">Produit non trouvé</p>
            <p className="text-sm text-gray-500 mb-4">Le produit que vous recherchez n'existe pas ou n'est plus disponible</p>
            <Link 
              to="/catalog"
              className="text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors font-medium shadow-sm text-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
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
      <div className="w-full max-w-screen-2xl mx-auto px-3 py-3">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link to="/catalog" className="hover:text-gray-900 transition-colors">
            Catalogue
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="w-full max-w-screen-2xl mx-auto px-3 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galerie photos - Fixe lors du scroll */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
            {/* Image principale */}
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden group">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-product-image.svg';
                }}
              />
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selectedImage === index 
                        ? 'border-emerald-500 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
          <div className="space-y-6">

            
            {/* En-tête avec champs dans l'ordre configuré */}
            <div className="space-y-3">
              {renderOrderedFields()}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {product.vendable && product.stock > 0 ? (
                <div className="space-y-3">
                  {/* Sélecteur de quantité */}
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Quantité:</label>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-4 py-1.5 text-gray-900 font-medium bg-gray-50 border-x border-gray-300">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      <span className="text-base">Ajouter au panier</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className={`rounded-lg p-4 text-center border ${
                  !product.vendable 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    !product.vendable ? 'bg-orange-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      !product.vendable ? 'text-orange-600' : 'text-red-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className={`text-base font-semibold mb-1 ${
                    !product.vendable ? 'text-orange-800' : 'text-red-800'
                  }`}>
                    {!product.vendable ? 'Produit non disponible' : 'Rupture de stock'}
                  </h3>
                  <p className={`text-xs ${
                    !product.vendable ? 'text-orange-700' : 'text-red-700'
                  }`}>
                    {!product.vendable 
                      ? 'Ce produit n\'est pas disponible à la vente'
                      : 'Ce produit est temporairement en rupture de stock'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 