import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import CategoryNavigation from '../components/CategoryNavigation'
import CategoryBreadcrumb from '../components/CategoryBreadcrumb'
import type { Product } from '../services/productService'
import type { CategoryTree } from '../services/categoryService'
import type { ProductFieldDisplay, ProductFieldValue } from '../services/productService'
import { productStructureService } from '../services/productStructureService'

function Catalog() {
  const { addToCart } = useCart()
  const { display, theme } = useTheme()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([])
  const [fieldDisplay, setFieldDisplay] = useState<ProductFieldDisplay[]>([])
  const [fieldValues, setFieldValues] = useState<{ [productId: string]: { [fieldName: string]: string } }>({})

  // Charger l'arbre des catégories au montage
  useEffect(() => {
    const loadTree = async () => {
      const tree = await categoryService.getCategoryTree()
      setCategoryTree(tree)
    }
    loadTree()
  }, [])

  // Charger la configuration d'affichage des champs (une seule fois)
  useEffect(() => {
    const loadFieldDisplay = async () => {
      try {
        const data = await productStructureService.getAllFieldDisplay()
        setFieldDisplay(data)
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration d\'affichage:', error)
      }
    }
    loadFieldDisplay()
  }, [])

  // Charger tous les produits au démarrage et gérer les paramètres d'URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      const categoryId = parseInt(categoryParam)
      if (!isNaN(categoryId)) {
        setSelectedCategoryId(categoryId)
        loadProducts(categoryId)
        return
      }
    }
    loadProducts()
  }, [searchParams, categoryTree])

  // Charger le rôle utilisateur
  useEffect(() => {
    if (user) {
      loadUserRole()
    }
  }, [user])

  const loadUserRole = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setUserRole(data.role)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error)
    }
  }

  const loadProducts = async (categoryId?: number) => {
    try {
      setLoading(true)
      let data: Product[] = []
      if (categoryId && categoryTree.length > 0) {
        const ids = categoryService.getAllDescendantCategoryIds(categoryTree, categoryId)
        data = await productService.getProductsForCatalog(ids)
      } else {
        data = await productService.getProductsForCatalog()
      }
      setProducts(data)
      
      // Charger les valeurs des champs custom pour tous les produits en une fois
      await loadAllFieldValues(data)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllFieldValues = async (products: Product[]) => {
    try {
      const productIds = products.map(p => p.id)
      if (productIds.length === 0) return

      // Récupérer toutes les valeurs des champs custom pour tous les produits
      const { data, error } = await supabase
        .from('product_field_values')
        .select(`
          *,
          product_fields (
            id,
            name,
            label,
            type,
            options
          )
        `)
        .in('product_id', productIds)

      if (error) throw error

      // Organiser les valeurs par produit
      const values: { [productId: string]: { [fieldName: string]: string } } = {}
      data?.forEach(fv => {
        if (fv.product_fields) {
          if (!values[fv.product_id]) {
            values[fv.product_id] = {}
          }
          values[fv.product_id][fv.product_fields.name] = fv.value
        }
      })

      setFieldValues(values)
    } catch (error) {
      console.error('Erreur lors du chargement des valeurs des champs:', error)
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
      const data = await productService.getVisibleProducts()
      // Filtrer côté client pour la recherche
      const filteredData = data.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.reference.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setProducts(filteredData)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer par catégorie
  const handleCategorySelect = async (categoryId: number, categoryPath: string) => {
    setSelectedCategoryId(categoryId)
    setSelectedCategoryPath(categoryPath)
    setSearchParams({ category: categoryId.toString() })
    await loadProducts(categoryId)
  }

  // Réinitialiser les filtres
  const handleClearFilters = () => {
    setSelectedCategoryId(null)
    setSelectedCategoryPath('')
    setSearchQuery('')
    setSearchParams({})
    loadProducts()
  }

  // Déterminer la catégorie sélectionnée dans l'arbre
  const selectedCategory = selectedCategoryId
    ? (function findCategoryById(tree, id) {
        for (const cat of tree) {
          if (cat.id === id) return cat
          if (cat.children && cat.children.length > 0) {
            const found = findCategoryById(cat.children, id)
            if (found) return found
          }
        }
        return null
      })(categoryTree, selectedCategoryId)
    : null
  const hasChildren = selectedCategory && selectedCategory.children && selectedCategory.children.length > 0

  // Déterminer le mode d'affichage du catalogue
  const catalogDisplayMode = display.catalogDisplayMode

  // Rendu conditionnel selon le mode
  const renderCatalogContent = () => {
    if (catalogDisplayMode === 'subcategories_and_products' && hasChildren) {
      // Afficher sous-catégories ET articles
      return (
        <>
          <div className="mb-6">
            <h4 className="text-base font-semibold mb-2">Sous-catégories</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedCategory.children.map(cat => (
                <div key={cat.id} className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center hover:shadow transition">
                  <span className="text-2xl mb-2">📁</span>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  <button
                    className="mt-2 text-xs text-blue-600 hover:underline"
                    onClick={() => handleCategorySelect(cat.id, cat.path)}
                  >
                    Voir
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-2">Articles</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  fieldDisplay={fieldDisplay} 
                  fieldValues={fieldValues[product.id] || {}} 
                />
              ))}
            </div>
          </div>
        </>
      )
    }
    if (catalogDisplayMode === 'subcategories_only' && hasChildren) {
      // Afficher uniquement les sous-catégories si elles existent
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {selectedCategory.children.map(cat => (
            <div key={cat.id} className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center hover:shadow transition">
              <span className="text-2xl mb-2">📁</span>
              <span className="font-medium text-gray-800">{cat.name}</span>
              <button
                className="mt-2 text-xs text-blue-600 hover:underline"
                onClick={() => handleCategorySelect(cat.id, cat.path)}
              >
                Voir
              </button>
            </div>
          ))}
        </div>
      )
    }
    // Sinon, afficher les articles
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            fieldDisplay={fieldDisplay} 
            fieldValues={fieldValues[product.id] || {}} 
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-3 py-4">
        {/* En-tête du catalogue */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">Catalogue</h1>
            <p className="text-xs text-gray-600">{products.length} produit(s) disponible(s)</p>
          </div>
          
          {/* Bouton toggle sidebar */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Fil d'Ariane */}
        {(selectedCategoryId || selectedCategoryPath) && (
          <div className="mb-3">
            <CategoryBreadcrumb
              categoryId={selectedCategoryId}
              categoryPath={selectedCategoryPath}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        )}

        <div className="flex gap-4">
          {/* Sidebar avec navigation des catégories */}
          {display.showCategories && (
            <div className={`
              ${showSidebar ? 'block' : 'hidden'} 
              lg:block lg:w-64 flex-shrink-0
            `}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-20">
                <CategoryNavigation
                  onCategorySelect={handleCategorySelect}
                  showProductCounts={true}
                />
                
                {/* Bouton pour réinitialiser les filtres */}
                {(selectedCategoryId || searchQuery) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={handleClearFilters}
                      className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-medium"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Barre de recherche */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Rechercher une pièce, référence, marque..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-colors text-sm"
                  style={{ 
                    borderColor: theme.primaryColor
                  }}
                />
                <button 
                  type="submit"
                  className="text-white px-4 py-2 rounded hover:opacity-90 transition-colors font-medium shadow-sm text-sm"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Rechercher
                </button>
              </form>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Chargement des produits...</p>
              </div>
            )}

            {/* Liste des produits */}
            {!loading && products.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {searchQuery || selectedCategoryId 
                    ? 'Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.'
                    : 'Aucun produit n\'est disponible pour le moment.'
                  }
                </p>
                {(searchQuery || selectedCategoryId) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
                  >
                    Voir tous les produits
                  </button>
                )}
              </div>
            )}

            {/* Grille des produits */}
            {!loading && products.length > 0 && (
              renderCatalogContent()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalog