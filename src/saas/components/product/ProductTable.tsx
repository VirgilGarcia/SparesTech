import React from 'react'
import { Link } from 'react-router-dom'
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Product } from '../../services/productService'
import type { Category } from '../../services/categoryService'

interface ProductTableProps {
  products: Product[]
  categories: Category[]
  onDeleteProduct: (product: Product) => void
  onToggleVisibility: (product: Product) => void
  theme: any
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  onDeleteProduct,
  onToggleVisibility,
  theme
}) => {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => String(c.id) === String(categoryId))
    return category ? category.name : 'Sans catégorie'
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Rupture', color: 'bg-red-100 text-red-800' }
    if (stock < 10) return { text: 'Stock faible', color: 'bg-orange-100 text-orange-800' }
    return { text: 'En stock', color: 'bg-green-100 text-green-800' }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500 mb-6">Aucun produit ne correspond à vos critères de recherche</p>
          <Link
            to="/admin/products/add"
            className="inline-flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Ajouter un produit
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock)
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.photo_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.photo_url}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.reference}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(product.category_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                      {stockStatus.text} ({product.stock})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleVisibility(product)}
                        className={`p-1 rounded-full ${
                          product.visible
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={product.visible ? 'Visible' : 'Masqué'}
                      >
                        {product.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.vendable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.vendable ? 'Vendable' : 'Non vendable'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductTable