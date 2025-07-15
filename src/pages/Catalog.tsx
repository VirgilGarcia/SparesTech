import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { useMarketplaceTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import CategoryNavigation from '../components/CategoryNavigation'
import CategoryBreadcrumb from '../components/CategoryBreadcrumb'
import { Pagination } from '../components/Pagination'
import { useCache } from '../hooks/useCache'
import { fieldUtils } from '../utils/fieldUtils'
import { useMarketplaceSettings } from '../hooks/useMarketplaceSettings'
import type { Product } from '../services/productService'
import type { CategoryTree } from '../services/categoryService'
import type { ProductFieldDisplay, ProductFieldValue } from '../services/productService'

function Catalog() {
  const { addToCart } = useCart()
  const { display, theme } = useMarketplaceTheme()
  const { user } = useAuth()
  const { settings } = useMarketplaceSettings()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [fieldValues, setFieldValues] = useState<{ [productId: string]: { [fieldName: string]: string } }>({})

  // Cache pour les données statiques
  const { data: categoryTree } = useCache(
    () => categoryService.getCategoryTree(),
    [],
    { ttl: 10 * 60 * 1000 } // 10 minutes
  )

  const { data: fieldDisplay } = useCache(
    () => fieldUtils.loadFieldDisplay(),
    [],
    { ttl: 5 * 60 * 1000 } // 5 minutes
  )

  // Mode d'affichage fixe : toujours afficher sous-catégories ET produits
  const catalogDisplayMode = 'subcategories_with_products'

  // Charger tous les produits au démarrage et gérer les paramètres d'URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const pageParam = searchParams.get('page')
    const searchParam = searchParams.get('search')
    
    let hasChanges = false
    
    if (categoryParam) {
      const categoryId = parseInt(categoryParam)
      if (!isNaN(categoryId) && categoryId !== selectedCategoryId) {
        setSelectedCategoryId(categoryId)
        hasChanges = true
        // Trouver le chemin de la catégorie
        if (categoryTree) {
          const findCategoryPath = (categories: CategoryTree[], targetId: number): string | null => {
            for (const cat of categories) {
              if (cat.id === targetId) {
                return cat.path
              }
              if (cat.children.length > 0) {
                const childPath = findCategoryPath(cat.children, targetId)
                if (childPath) return childPath
              }
            }
            return null
          }
          const path = findCategoryPath(categoryTree, categoryId)
          if (path) {
            setSelectedCategoryPath(path)
          }
        }
      }
    } else if (selectedCategoryId !== null) {
      setSelectedCategoryId(null)
      setSelectedCategoryPath('')
      hasChanges = true
    }
    
    if (pageParam) {
      const page = parseInt(pageParam)
      if (!isNaN(page) && page > 0 && page !== currentPage) {
        setCurrentPage(page)
        hasChanges = true
      }
    } else if (currentPage !== 1) {
      setCurrentPage(1)
      hasChanges = true
    }
    
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam || '')
      hasChanges = true
    }
  }, [searchParams, categoryTree])

  // Charger les produits quand les paramètres changent
  useEffect(() => {
    loadProducts()
  }, [currentPage, selectedCategoryId, searchQuery])

  // Charger le rôle utilisateur
  useEffect(() => {
    const loadUserRole = async () => {
      if (!user) {
        setUserRole(null)
        return
      }

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setUserRole(profile?.role || null)
      } catch (error) {
        console.error('Erreur lors du chargement du rôle:', error)
        setUserRole(null)
      }
    }

    loadUserRole()
  }, [user])

  const loadProducts = async () => {
    try {
      setLoading(true)
      let categoryIds: number[] | undefined = undefined
      if (selectedCategoryId && categoryTree) {
        // Récupérer SEULEMENT les produits directement tagués dans cette catégorie (pas les sous-catégories)
        categoryIds = [selectedCategoryId]
        console.log('🔍 Filtrage par catégorie (directe seulement):', {
          selectedCategoryId,
          categoryIds,
          categoryTreeLength: categoryTree.length
        })
      } else {
        console.log('🔍 Pas de catégorie sélectionnée, pas de filtrage')
      }
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        categoryId: undefined, // on n'utilise plus categoryId seul
        categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc' as const
      }
      console.log('📤 Paramètres envoyés au service:', params)
      const response = await productService.getVisibleProductsPaginated(params)
      console.log('📥 Réponse du service:', {
        totalProducts: response.total,
        productsReturned: response.data.length,
        currentPage: response.page,
        totalPages: response.totalPages
      })
      setProducts(response.data)
      setTotalItems(response.total)
      setTotalPages(response.totalPages)
      if (response.data.length > 0) {
        await loadFieldValues(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFieldValues = async (products: Product[]) => {
    try {
      const productIds = products.map(p => p.id)
      if (productIds.length === 0) return

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
    setCurrentPage(1)
    // Mettre à jour les paramètres d'URL immédiatement
    const newParams = new URLSearchParams()
    if (selectedCategoryId) {
      newParams.set('category', selectedCategoryId.toString())
    }
    if (searchQuery) {
      newParams.set('search', searchQuery)
    }
    setSearchParams(newParams)
  }

  const handleCategorySelect = (categoryId: number, categoryPath: string) => {
    // Cas spécial : retour à l'accueil (categoryId = -1)
    if (categoryId === -1) {
      setSelectedCategoryId(null)
      setSelectedCategoryPath('')
      setCurrentPage(1)
      const newParams = new URLSearchParams()
      if (searchQuery) {
        newParams.set('search', searchQuery)
      }
      setSearchParams(newParams)
      return
    }
    
    setSelectedCategoryId(categoryId)
    setSelectedCategoryPath(categoryPath)
    setCurrentPage(1)
    // Mettre à jour les paramètres d'URL immédiatement, et toujours page=1
    const newParams = new URLSearchParams()
    newParams.set('category', categoryId.toString())
    if (searchQuery) {
      newParams.set('search', searchQuery)
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Mettre à jour les paramètres d'URL immédiatement
    const newParams = new URLSearchParams()
    if (selectedCategoryId) {
      newParams.set('category', selectedCategoryId.toString())
    }
    if (searchQuery) {
      newParams.set('search', searchQuery)
    }
    if (page > 1) {
      newParams.set('page', page.toString())
    }
    setSearchParams(newParams)
  }

  const filteredProducts = products.filter(product => {
    if (!product.visible || !product.vendable) return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        product.name.toLowerCase().includes(query) ||
        product.reference.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  // Trouver la catégorie sélectionnée et ses sous-catégories
  const selectedCategory = selectedCategoryId && categoryTree ? 
    (() => {
      const findCategory = (categories: CategoryTree[], targetId: number): CategoryTree | null => {
        for (const cat of categories) {
          if (cat.id === targetId) return cat
          if (cat.children.length > 0) {
            const found = findCategory(cat.children, targetId)
            if (found) return found
          }
        }
        return null
      }
      return findCategory(categoryTree, selectedCategoryId)
    })() : null

  // Déterminer ce qu'il faut afficher - logique simplifiée
  const hasProducts = totalItems > 0
  const hasSubcategories = selectedCategory && selectedCategory.children.length > 0
  
  // Toujours afficher les sous-catégories ET les produits
  const showProductsSection = true
  const showSubcategoriesSection = hasSubcategories

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full px-6 lg:px-8 py-8">
        {/* En-tête avec recherche */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">Catalogue</h1>
              <p className="text-gray-600">
                {showProductsSection && showSubcategoriesSection 
                  ? `${totalItems} produit${totalItems > 1 ? 's' : ''} et ${selectedCategory?.children.length || 0} sous-catégorie${selectedCategory?.children.length !== 1 ? 's' : ''}`
                  : showProductsSection 
                    ? `${totalItems} produit${totalItems > 1 ? 's' : ''} trouvé${totalItems > 1 ? 's' : ''}`
                    : showSubcategoriesSection 
                      ? `${selectedCategory?.children.length || 0} sous-catégorie${selectedCategory?.children.length !== 1 ? 's' : ''}`
                      : 'Aucun produit trouvé'
                }
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="w-full lg:w-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 lg:w-80 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{ 
                    focusRingColor: theme.primaryColor,
                    focusBorderColor: theme.primaryColor 
                  }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Breadcrumb */}
        {selectedCategoryId && (
          <div className="mb-6">
            <CategoryBreadcrumb 
              categoryId={selectedCategoryId}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar avec catégories */}
          <div className={`lg:w-80 ${showSidebar ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Catégories</h2>
              <CategoryNavigation
                categoryTree={categoryTree || []}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
                showProductCounts={false}
                maxLevels={1}
              />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Bouton toggle sidebar mobile */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Filtrer par catégorie</span>
              </button>
            </div>

            {/* Affichage des sous-catégories EN PREMIER */}
            {showSubcategoriesSection && selectedCategory && (
              <>
                <div className="mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {selectedCategory.children.map((subCategory) => (
                      <div
                        key={subCategory.id}
                        onClick={() => handleCategorySelect(subCategory.id, subCategory.path)}
                        className="group bg-white rounded-2xl border border-gray-100 p-8 cursor-pointer hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                               style={{ backgroundColor: `${theme.primaryColor}15` }}>
                            <svg className="w-8 h-8 transition-all duration-300" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300">{subCategory.name}</h3>
                          <div className="flex items-center justify-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                            <span>Explorer</span>
                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Affichage des produits APRÈS les sous-catégories */}
            {filteredProducts.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      fieldValues={fieldValues[product.id] || {}}
                      fieldDisplay={fieldDisplay || {}}
                      onAddToCart={addToCart}
                      showPrices={display.showPrices}
                      showStock={display.showStock}
                      userRole={userRole}
                    />
                  ))}
                </div>

                {/* Pagination - seulement si on affiche des produits */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Message "Aucun produit trouvé" seulement s'il n'y a ni produits ni sous-catégories */}
            {!loading && filteredProducts.length === 0 && !showSubcategoriesSection && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: `${theme.primaryColor}10` }}>
                  <svg className="w-12 h-12" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou parcourez nos catégories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategoryId(null)
                    setSelectedCategoryPath('')
                    setCurrentPage(1)
                    setSearchParams(new URLSearchParams())
                  }}
                  className="px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Voir tous les produits
                </button>
              </div>
            )}
            
            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-100 p-6 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalog