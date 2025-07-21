import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import type { Product } from '../../services/productService'
import { useAuth } from '../../../shared/context/AuthContext'
import Header from '../../components/layout/Header'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'
import { Toast } from '../../../shared/components/ui/Toast'
import { useUserRole } from '../../../shared/hooks/useUserRole'
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

  // Utiliser le hook personnalisé pour le rôle utilisateur
  const { userRole, loading: roleLoading } = useUserRole()

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


  const loadProducts = async () => {
    try {
      setLoading(true)
      
      // Préparer tous les paramètres pour la requête serveur avec pagination
      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        // Filtres de catégorie
        category_id: filters.category ? parseInt(filters.category) : undefined,
        // Filtres pour l'API backend
        visible: filters.visible ? filters.visible === 'visible' : undefined,
        vendable: filters.vendable ? filters.vendable === 'vendable' : undefined,
        min_price: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
        max_price: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
        in_stock: filters.stockLevel === 'in_stock' ? true : 
                  filters.stockLevel === 'out_of_stock' ? false : undefined
      }

      const response = await productService.getProducts(params)
      
      setProducts(response.products)
      setTotalItems(response.totalCount)
      setTotalPages(Math.ceil(response.totalCount / itemsPerPage))
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