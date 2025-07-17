import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import type { Product } from '../../services/productService'
import { useAuth } from '../../../shared/context/AuthContext'
import { Navigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'
import { Toast } from '../../../shared/components/ui/Toast'
import { supabase } from '../../../lib/supabase'
import { categoryService } from '../../services/categoryService'
import type { Category } from '../../services/categoryService'

function AdminProducts() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // États des filtres
  const [filters, setFilters] = useState({
    category: '',
    stockLevel: '', // 'in_stock', 'low_stock', 'out_of_stock'
    visible: '', // 'visible', 'hidden'
    vendable: '', // 'vendable', 'not_vendable'
    priceMin: '',
    priceMax: ''
  })
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
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
      loadUserRole()
    }
  }, [user])

  useEffect(() => {
    if (userRole === 'admin') {
      loadCategories()
      loadProducts()
    }
  }, [userRole, currentPage, searchQuery, filters, sortBy, sortOrder])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const loadUserRole = async () => {
    if (!user) return
    
    try {
      setRoleLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserRole(data.role)
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error)
      setUserRole('client')
    } finally {
      setRoleLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      
      // Préparer tous les paramètres pour la requête serveur optimisée
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        // Filtres de catégorie
        categoryId: filters.category ? parseInt(filters.category) : undefined,
        // Tous les filtres sont maintenant côté serveur pour optimiser les performances
        stockLevel: filters.stockLevel as 'in_stock' | 'low_stock' | 'out_of_stock' | undefined,
        visible: filters.visible ? filters.visible === 'visible' : undefined,
        vendable: filters.vendable ? filters.vendable === 'vendable' : undefined,
        priceMin: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? parseFloat(filters.priceMax) : undefined
      }

      console.log('📤 Paramètres envoyés au serveur:', params)
      
      const response = await productService.getAllProductsPaginated(params)
      
      console.log('📥 Réponse du serveur:', {
        totalProducts: response.total,
        productsReturned: response.data.length,
        currentPage: response.page,
        totalPages: response.totalPages
      })
      
      // Plus de filtrage côté client - tout est fait côté serveur maintenant
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

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      stockLevel: '',
      visible: '',
      vendable: '',
      priceMin: '',
      priceMax: ''
    })
    setSearchQuery('')
    setSortBy('name')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length +
           (searchQuery ? 1 : 0)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true })
  }

  // Chargements et accès
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}></div>
          <div className="text-gray-600">Vérification de l'authentification...</div>
        </div>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}></div>
          <div className="text-gray-600">Vérification des permissions...</div>
        </div>
      </div>
    )
  }
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">Vous devez être administrateur pour accéder à cette page.</p>
            <div className="space-y-3">
              <Link 
                to="/admin"
                className="block w-full text-white px-6 py-3 rounded-xl hover:opacity-90 transition-colors text-center font-medium"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre et actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">Gestion des produits</h1>
            <p className="text-gray-600">
              {totalItems > 0 ? `${totalItems} produit${totalItems > 1 ? 's' : ''} au total` : 'Aucun produit trouvé'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Link
              to="/admin/products/add"
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Ajouter un produit</span>
            </Link>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recherche et filtres</h2>
              {getActiveFiltersCount() > 0 && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full"
                      style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
                  {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  Effacer tout
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  showFilters 
                    ? 'text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                style={showFilters ? { backgroundColor: theme.primaryColor } : {}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                Filtres
              </button>
            </div>
          </div>
          
          {/* Recherche principale */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un produit par nom ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-white font-medium rounded-xl transition-all hover:opacity-90 shadow-md hover:shadow-lg transform hover:scale-105"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Rechercher
            </button>
          </form>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Filtre par catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre par niveau de stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau de stock
                  </label>
                  <select
                    value={filters.stockLevel}
                    onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="in_stock">En stock (&gt;10)</option>
                    <option value="low_stock">Stock faible (1-10)</option>
                    <option value="out_of_stock">Rupture de stock (0)</option>
                  </select>
                </div>

                {/* Filtre par visibilité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibilité
                  </label>
                  <select
                    value={filters.visible}
                    onChange={(e) => handleFilterChange('visible', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="visible">Visible</option>
                    <option value="hidden">Masqué</option>
                  </select>
                </div>

                {/* Filtre par vendabilité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendabilité
                  </label>
                  <select
                    value={filters.vendable}
                    onChange={(e) => handleFilterChange('vendable', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="vendable">Vendable</option>
                    <option value="not_vendable">Non vendable</option>
                  </select>
                </div>

                {/* Filtre par prix minimum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix minimum (€)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin || ''}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Filtre par prix maximum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix maximum (€)
                  </label>
                  <input
                    type="number"
                    placeholder="999999"
                    value={filters.priceMax || ''}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Options de tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trier par
                  </label>
                  <select
                    value={`${sortBy}_${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('_')
                      setSortBy(field)
                      setSortOrder(order as 'asc' | 'desc')
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                  >
                    <option value="name_asc">Nom (A-Z)</option>
                    <option value="name_desc">Nom (Z-A)</option>
                    <option value="prix_asc">Prix (- cher)</option>
                    <option value="prix_desc">Prix (+ cher)</option>
                    <option value="stock_desc">Stock (+ élevé)</option>
                    <option value="stock_asc">Stock (+ faible)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Produits ({totalItems}){searchQuery && ` pour "${searchQuery}"`}
                {getActiveFiltersCount() > 0 && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''} actif{getActiveFiltersCount() > 1 ? 's' : ''})
                  </span>
                )}
              </h2>
            </div>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                   style={{ 
                     borderColor: `${theme.primaryColor}20`,
                     borderTopColor: theme.primaryColor 
                   }}>
              </div>
              <p className="text-gray-600 font-medium">Chargement des produits...</p>
            </div>
          ) : products.length > 0 ? (
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
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
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
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                      </svg>
                                      {pc.categories?.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  Aucune catégorie
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full w-fit">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Modifier
                            </Link>
                            <button
                              onClick={() => handleDelete(product)}
                              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium rounded-lg hover:bg-red-50 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
                        onPageChange={handlePageChange}
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
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {searchQuery ? 'Ajouter un produit' : 'Ajouter le premier produit'}
                </Link>
                {searchQuery && (
                  <div>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setCurrentPage(1)
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
      </div>

      {/* Dialogues */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer le produit ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce produit ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
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