import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import type { ProductDB } from '../../services/productService'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

function AdminProducts() {
  const { user, loading: authLoading } = useAuth()
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
      const data = await productService.getAllProducts()
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
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header Admin */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="text-stone-600 hover:text-stone-800">
                ← Retour
              </Link>
              <h1 className="text-xl font-semibold text-stone-800">Gestion des Produits</h1>
            </div>
            <Link to="/admin/products/add">
              <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium">
                + Ajouter un produit
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Table des produits */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left p-4 font-medium text-stone-700">Nom</th>
                  <th className="text-left p-4 font-medium text-stone-700">Référence</th>
                  <th className="text-left p-4 font-medium text-stone-700">Catégorie</th>
                  <th className="text-left p-4 font-medium text-stone-700">Prix</th>
                  <th className="text-left p-4 font-medium text-stone-700">Stock</th>
                  <th className="text-left p-4 font-medium text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-stone-600">
                      Chargement des produits...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-stone-600">
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
                      <tr key={product.id} className="border-t border-stone-200 hover:bg-stone-50">
                        <td className="p-4">
                          <div className="font-medium text-stone-800">{product.name}</div>
                          <div className="text-sm text-stone-600">{product.description}</div>
                        </td>
                        <td className="p-4 text-stone-600">{product.reference}</td>
                        <td className="p-4">
                          <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded-lg text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-emerald-600">{product.price} €</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-sm ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-700' 
                              : product.stock > 0 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Link to={`/admin/products/edit/${product.id}`}>
                              <button className="text-blue-600 hover:text-blue-800 p-2">
                                ✏️
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              🗑️
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