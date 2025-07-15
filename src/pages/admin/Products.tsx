import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import type { Product } from '../../services/productService'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import { useMarketplaceTheme } from '../../context/ThemeContext'
import { Pagination } from '../../components/Pagination'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Toast } from '../../components/Toast'

function AdminProducts() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // États pour les dialogues
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })

  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user, currentPage, searchQuery])

  const loadProducts = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc' as const
      }

      const response = await productService.getAllProductsPaginated(params)
      
      setProducts(response.data)
      setTotalItems(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      showToast('Erreur lors du chargement des produits', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      await productService.deleteProduct(productToDelete.id)
      setProducts(products.filter(p => p.id !== productToDelete.id))
      showToast('Produit supprimé avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showToast('Erreur lors de la suppression du produit', 'error')
    } finally {
      setShowDeleteDialog(false)
      setProductToDelete(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true })
  }

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
              <p className="text-gray-600 mt-1">
                {totalItems > 0 ? `${totalItems} produit${totalItems > 1 ? 's' : ''} au total` : 'Aucun produit'}
              </p>
            </div>
            
            <Link
              to="/admin/products/add"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Ajouter un produit
            </Link>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des produits...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Référence
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.photo_url ? (
                              <img
                                src={product.photo_url}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">📦</span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.product_categories?.[0]?.categories?.name || 'Aucune catégorie'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {product.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.prix}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.visible 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.visible ? 'Visible' : 'Masqué'}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.vendable 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.vendable ? 'Vendable' : 'Non vendable'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              Modifier
                            </Link>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-red-600 hover:text-red-900"
                            >
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
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `Aucun produit ne correspond à "${searchQuery}"`
                  : 'Aucun produit n\'a été créé pour le moment'
                }
              </p>
              <Link
                to="/admin/products/add"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Ajouter le premier produit
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dialogues */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer le produit "${productToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setProductToDelete(null)
        }}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}

export default AdminProducts