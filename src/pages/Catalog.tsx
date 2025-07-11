import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { productService } from '../services/productService'
import type { ProductDB } from '../services/productService'

function Catalog() {
  const { addToCart } = useCart()
  const { display, theme } = useTheme()
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
      // Filtrer côté client puisque nous avons déjà les données
      const allProducts = await productService.getAllProducts()
      const filteredProducts = allProducts.filter(product => 
        product.category?.name === category
      )
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Erreur lors du filtrage:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtenir les catégories uniques - CORRIGÉ: Gestion des types
  const categories = [...new Set(products.map(p => {
    if (typeof p.category === 'object' && p.category?.name) {
      return p.category.name
    }
    return typeof p.category === 'string' ? p.category : String(p.category || '')
  }).filter(Boolean))]

  // Helper function pour afficher le nom de la catégorie - CORRIGÉ
  const getCategoryDisplayName = (category: ProductDB['category']): string => {
    if (typeof category === 'object' && category?.name) {
      return category.name
    }
    return typeof category === 'string' ? category : String(category || '')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-6">Catalogue</h1>
          
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Rechercher une pièce..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm"
              />
              <button 
                type="submit"
                className="text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-colors text-sm font-medium shadow-sm"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Filtres par catégorie - Affiché seulement si activé */}
          {display.showCategories && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter('')}
                  className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
                    selectedCategory === '' 
                      ? 'text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ 
                    backgroundColor: selectedCategory === '' ? theme.primaryColor : undefined
                  }}
                >
                  Toutes
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
                      selectedCategory === category 
                        ? 'text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ 
                      backgroundColor: selectedCategory === category ? theme.primaryColor : undefined
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-600 text-sm">Chargement des produits...</div>
          </div>
        )}

        {/* Produits */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product: ProductDB) => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">{product.name}</h3>
                  
                  {/* Référence - Affiché seulement si activé */}
                  {display.showReferences && (
                    <p className="text-gray-500 text-xs mb-1">Référence: {product.reference}</p>
                  )}
                  
                  {/* Catégorie - Affiché seulement si activé - CORRIGÉ */}
                  {display.showCategories && (
                    <p className="text-gray-500 text-xs mb-1">
                      Catégorie: {getCategoryDisplayName(product.category)}
                    </p>
                  )}
                  
                  {/* Description - Affiché seulement si activé */}
                  {display.showDescriptions && product.description && (
                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">{product.description}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  {/* Prix - Affiché seulement si activé */}
                  {display.showPrices ? (
                    <p className="font-semibold text-base" style={{ color: theme.primaryColor }}>
                      {product.price} €
                    </p>
                  ) : (
                    <p className="text-gray-600 text-xs">Prix sur demande</p>
                  )}
                  
                  {/* Stock - Affiché seulement si activé */}
                  {display.showStock && (
                    <p className="text-gray-500 text-xs">Stock: {product.stock}</p>
                  )}
                </div>
                
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-2 rounded-md font-medium transition-colors text-sm ${
                    product.stock > 0
                      ? 'text-white hover:opacity-90 shadow-sm'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ 
                    backgroundColor: product.stock > 0 ? theme.primaryColor : undefined
                  }}
                >
                  {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Aucun produit trouvé */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm mb-4">Aucun produit trouvé</p>
            <button 
              onClick={loadProducts}
              className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors text-sm font-medium shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
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