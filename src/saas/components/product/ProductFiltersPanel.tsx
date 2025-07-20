import React from 'react'
import { Filter, X } from 'lucide-react'
import type { Category } from '../../services/categoryService'

interface ProductFiltersPanelProps {
  filters: {
    category: string
    stockLevel: string
    visible: string
    vendable: string
    priceMin: string
    priceMax: string
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onFilterChange: (filterName: string, value: string) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  onClearFilters: () => void
  showFilters: boolean
  onToggleFilters: () => void
  categories: Category[]
  theme: any
}

const ProductFiltersPanel: React.FC<ProductFiltersPanelProps> = ({
  filters,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortChange,
  onClearFilters,
  showFilters,
  onToggleFilters,
  categories,
  theme
}) => {
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ backgroundColor: `${theme.primaryColor}20` }}>
            <Filter className="w-5 h-5" style={{ color: theme.primaryColor }} />
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
              onClick={onClearFilters}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Effacer tout
            </button>
          )}
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showFilters 
                ? 'text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            style={showFilters ? { backgroundColor: theme.primaryColor } : {}}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

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
                onChange={(e) => onFilterChange('category', e.target.value)}
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
                onChange={(e) => onFilterChange('stockLevel', e.target.value)}
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
                onChange={(e) => onFilterChange('visible', e.target.value)}
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
                onChange={(e) => onFilterChange('vendable', e.target.value)}
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
                onChange={(e) => onFilterChange('priceMin', e.target.value)}
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
                onChange={(e) => onFilterChange('priceMax', e.target.value)}
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
                  onSortChange(field, order as 'asc' | 'desc')
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
  )
}

export default ProductFiltersPanel