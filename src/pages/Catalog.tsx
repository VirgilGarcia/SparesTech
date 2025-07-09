import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { productService } from '../services/productService'
import type { ProductDB } from '../services/productService'

function Catalog() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<ProductDB[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Charger tous les produits au démarrage
  useEffect(() => {
    loadProducts()
  }, [])

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

  // Recherche
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadProducts()
      return
    }
    
    try {
      setLoading(true)
      const data = await productService.searchProducts(searchQuery)
      setProducts(data)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer par catégorie
  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category)
    if (category === '') {
      loadProducts()
      return
    }
    
    try {
      setLoading(true)
      const data = await productService.getProductsByCategory(category)
      setProducts(data)
    } catch (error) {
      console.error('Erreur lors du filtrage:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtenir les catégories uniques
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">Catalogue</h1>
        
        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Rechercher une pièce..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
            />
            <button 
              type="submit"
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Filtres par catégorie */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === '' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              Toutes
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-stone-600">Chargement des produits...</div>
          </div>
        )}

        {/* Produits */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product: ProductDB) => (
              <div key={product.id} className="bg-stone-50 p-6 rounded-2xl hover:shadow-sm transition-shadow">
                <div className="mb-4">
                  <h3 className="font-semibold text-stone-800 mb-1">{product.name}</h3>
                  <p className="text-stone-600 text-sm">Référence: {product.reference}</p>
                  <p className="text-stone-500 text-sm">Catégorie: {product.category}</p>
                  {product.description && (
                    <p className="text-stone-600 text-sm mt-2">{product.description}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <p className="text-emerald-600 font-bold text-lg">{product.price} €</p>
                  <p className="text-stone-500 text-sm">Stock: {product.stock}</p>
                </div>
                
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    product.stock > 0
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Aucun produit trouvé */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-600">Aucun produit trouvé</p>
            <button 
              onClick={loadProducts}
              className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Voir tous les produits
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalog