import React from 'react'
import { Search, Plus, Expand, ChevronsUp } from 'lucide-react'

interface Theme {
  primaryColor: string
  companyName: string
  logoUrl: string | null
}

interface CategorySearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreateCategory: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  totalCategories: number
  theme: Theme
}

const CategorySearch: React.FC<CategorySearchProps> = ({
  searchQuery,
  onSearchChange,
  onCreateCategory,
  onExpandAll,
  onCollapseAll,
  totalCategories,
  theme
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">
            {totalCategories} catégorie{totalCategories > 1 ? 's' : ''}
          </span>
          
          <button
            onClick={onExpandAll}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Tout développer"
          >
            <Expand className="w-4 h-4" />
            <span className="hidden sm:inline">Développer</span>
          </button>
          
          <button
            onClick={onCollapseAll}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Tout réduire"
          >
            <ChevronsUp className="w-4 h-4" />
            <span className="hidden sm:inline">Réduire</span>
          </button>
          
          <button
            onClick={onCreateCategory}
            className="flex items-center gap-1 px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle catégorie</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategorySearch