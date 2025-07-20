import React from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'
import type { Category } from '../../services/categoryService'

interface ProductFiltersState {
  category: string
  stockLevel: string
  visible: string
  vendable: string
  priceMin: string
  priceMax: string
}

interface ProductFiltersProps {
  filters: ProductFiltersState
  onFiltersChange: (filters: ProductFiltersState) => void
  categories: Category[]
  showFilters: boolean
  onToggleFilters: () => void
  onResetFilters: () => void
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  showFilters,
  onToggleFilters,
  onResetFilters,
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <button
          onClick={onToggleFilters}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          </div>
          {showFilters ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Niveau de stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <select
                value={filters.stockLevel}
                onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les niveaux</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture de stock</option>
              </select>
            </div>

            {/* Visibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilité
              </label>
              <select
                value={filters.visible}
                onChange={(e) => handleFilterChange('visible', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="visible">Visible</option>
                <option value="hidden">Masqué</option>
              </select>
            </div>

            {/* Vendable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendable
              </label>
              <select
                value={filters.vendable}
                onChange={(e) => handleFilterChange('vendable', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="vendable">Vendable</option>
                <option value="not_vendable">Non vendable</option>
              </select>
            </div>

            {/* Prix minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Prix maximum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="999.99"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilters