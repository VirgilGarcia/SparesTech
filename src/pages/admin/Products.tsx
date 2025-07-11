import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import type { ProductDB } from '../../services/productService'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import { useTheme } from '../../context/ThemeContext'

function AdminProducts() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const [products, setProducts] = useState<ProductDB[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAllProductsAdmin()
      setProducts(data)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      await productService.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du produit')
    }
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
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre et actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Produits</h1>
            <p className="text-sm text-gray-600">{products.length} produit(s) au total</p>
          </div>
          <Link to="/admin/products/add">
            <button 
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              + Ajouter
            </button>
          </Link>
        </div>

        {/* Recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Table des produits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Nom</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Référence</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Catégorie</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Prix</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Stock</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Visibilité</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-600 text-sm">
                      Chargement des produits...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-600 text-sm">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  products
                    .filter(product => 
                      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      product.reference.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((product) => (
                      <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                          <div className="text-xs text-gray-600">{product.description}</div>
                        </td>
                        <td className="p-3 text-gray-600 text-sm">{product.reference}</td>
                        <td className="p-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-sm" style={{ color: theme.primaryColor }}>
                          {product.price} €
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-700' 
                              : product.stock > 0 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.is_visible 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.is_visible ? '👁️ Visible' : '🚫 Masqué'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.is_sellable 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {product.is_sellable ? '💰 Vendu' : '⛔ Invendu'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Link to={`/admin/products/edit/${product.id}`}>
                              <button className="text-blue-600 hover:text-blue-800 p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProducts