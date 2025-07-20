import React from 'react'
import { Package, Eye, EyeOff, ShoppingCart } from 'lucide-react'

interface ProductPreviewProps {
  formData: {
    name: string
    reference: string
    prix: string
    stock: string
    photo_url: string
    visible: boolean
    vendable: boolean
    category_ids: number[]
  }
  customFields: Record<string, string>
  categories?: Array<{ id: number; name: string }>
  theme: any
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  formData,
  customFields,
  categories,
  theme
}) => {
  const selectedCategories = categories?.filter(cat => 
    formData.category_ids.includes(cat.id)
  )

  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    return isNaN(num) ? '0,00' : num.toFixed(2).replace('.', ',')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Aperçu du produit</h2>
        <p className="text-sm text-gray-600">
          Voici comment votre produit apparaîtra sur le site
        </p>
      </div>

      <div className="p-6">
        <div className="max-w-sm mx-auto">
          {/* Card produit */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Image */}
            <div className="aspect-w-1 aspect-h-1 bg-gray-200">
              {formData.photo_url ? (
                <img
                  src={formData.photo_url}
                  alt={formData.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-4">
              {/* Catégories */}
              {selectedCategories && selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedCategories.map(category => (
                    <span
                      key={category.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Nom et référence */}
              <h3 className="font-semibold text-gray-900 mb-1">
                {formData.name || 'Nom du produit'}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Réf: {formData.reference || 'REF-001'}
              </p>

              {/* Prix et stock */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                  {formatPrice(formData.prix)} €
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  parseInt(formData.stock) > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {parseInt(formData.stock) > 0 ? 'En stock' : 'Rupture'}
                </span>
              </div>

              {/* Champs personnalisés */}
              {Object.entries(customFields).length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Détails
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(customFields).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">
                            {key.replace('_', ' ')}:
                          </span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Statuts */}
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                <div className="flex items-center">
                  {formData.visible ? (
                    <Eye className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400 mr-1" />
                  )}
                  <span className="text-xs text-gray-600">
                    {formData.visible ? 'Visible' : 'Masqué'}
                  </span>
                </div>
                <div className="flex items-center">
                  <ShoppingCart className={`w-4 h-4 mr-1 ${
                    formData.vendable ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className="text-xs text-gray-600">
                    {formData.vendable ? 'Vendable' : 'Consultation'}
                  </span>
                </div>
              </div>

              {/* Bouton d'action */}
              {formData.vendable && formData.visible && parseInt(formData.stock) > 0 && (
                <button
                  className="w-full mt-3 px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Ajouter au panier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPreview