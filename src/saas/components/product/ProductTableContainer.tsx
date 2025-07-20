import React from 'react'
import { Link } from 'react-router-dom'
import { Package, Tag, Edit2, Trash2 } from 'lucide-react'
import { Pagination } from '../../../shared/components/ui/Pagination'
import type { Product } from '../../services/productService'

interface ProductTableContainerProps {
  products: Product[]
  loading: boolean
  searchQuery: string
  onDelete: (product: Product) => void
  totalItems: number
  currentPage: number
  totalPages: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  activeFiltersCount: number
  theme: any
}

const ProductTableContainer: React.FC<ProductTableContainerProps> = ({
  products,
  loading,
  searchQuery,
  onDelete,
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  activeFiltersCount,
  theme
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}>
          </div>
          <p className="text-gray-600 font-medium">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ backgroundColor: `${theme.primaryColor}20` }}>
            <Package className="w-5 h-5" style={{ color: theme.primaryColor }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Produits ({totalItems}){searchQuery && ` pour "${searchQuery}"`}
            {activeFiltersCount > 0 && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Table */}
      {products.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden mr-4 shadow-sm">
                          {product.photo_url ? (
                            <img
                              src={product.photo_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/default-product-image.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 mb-1">{product.name}</div>
                          {product.product_categories && product.product_categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.product_categories.map((pc) => (
                                <span 
                                  key={pc.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  {pc.categories?.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              Aucune catégorie
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full w-fit">
                        <Tag className="w-3 h-3" />
                        <span className="font-mono font-medium">{product.reference}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                        {typeof product.prix === 'string' ? parseFloat(product.prix).toFixed(2) : product.prix?.toFixed(2)}€
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {(() => {
                        const stockLevel = product.stock > 10 ? 'high' : product.stock > 0 ? 'medium' : 'low'
                        const stockConfig = {
                          high: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
                          medium: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' },
                          low: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' }
                        }
                        const config = stockConfig[stockLevel]
                        
                        return (
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-fit ${config.bg} ${config.border}`}>
                            <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                            <span className={`text-xs font-semibold ${config.text}`}>
                              {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                            </span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${
                          product.visible 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            product.visible ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className={`text-xs font-semibold ${
                            product.visible ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {product.visible ? 'Visible' : 'Masqué'}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${
                          product.vendable 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-orange-50 border border-orange-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            product.vendable ? 'bg-blue-500' : 'bg-orange-500'
                          }`}></div>
                          <span className={`text-xs font-semibold ${
                            product.vendable ? 'text-blue-800' : 'text-orange-800'
                          }`}>
                            {product.vendable ? 'Vendable' : 'Non vendable'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => onDelete(product)}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-6 py-5 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} produit{totalItems > 1 ? 's' : ''}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun produit trouvé</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            {searchQuery 
              ? `Aucun produit ne correspond à "${searchQuery}". Essayez de modifier votre recherche.`
              : 'Aucun produit n\'a été créé pour le moment. Commencez par ajouter votre premier produit.'
            }
          </p>
          <div className="space-y-3">
            <Link
              to="/admin/products/add"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl transition-all hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Package className="w-5 h-5" />
              {searchQuery ? 'Ajouter un produit' : 'Ajouter le premier produit'}
            </Link>
            {searchQuery && (
              <div>
                <button
                  onClick={() => {
                    window.location.reload()
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                  Voir tous les produits
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductTableContainer