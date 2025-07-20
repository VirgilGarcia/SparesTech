import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import type { Product } from '../../services/productService'
import { useAuth } from '../../../shared/context/AuthContext'
import Header from '../../components/layout/Header'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'
import { Toast } from '../../../shared/components/ui/Toast'
import { supabase } from '../../../lib/supabase'
import { categoryService } from '../../services/categoryService'
import type { Category } from '../../services/categoryService'
import { 
  ProductListHeader,
  ProductSearchBar,
  ProductFiltersPanel,
  ProductTableContainer,
  ProductLoadingState,
  ProductAccessDenied
} from '../../components/product'

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

      const response = await productService.getAllProductsPaginated(params)
      
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

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setCurrentPage(1)
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true })
  }

  // Chargements et accès
  if (authLoading) {
    return <ProductLoadingState message="Vérification de l'authentification..." theme={theme} />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roleLoading) {
    return <ProductLoadingState message="Vérification des permissions..." theme={theme} />
  }
  if (userRole !== 'admin') {
    return <ProductAccessDenied theme={theme} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        <ProductListHeader totalItems={totalItems} theme={theme} />
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <ProductSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearch}
            theme={theme}
          />
          
          <ProductFiltersPanel
            filters={filters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onClearFilters={clearFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            categories={categories}
            theme={theme}
          />
        </div>

        <ProductTableContainer
          products={products}
          loading={loading}
          searchQuery={searchQuery}
          onDelete={handleDelete}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          activeFiltersCount={getActiveFiltersCount()}
          theme={theme}
        />
      </div>

      {/* Dialogues */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer le produit ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce produit ?"
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