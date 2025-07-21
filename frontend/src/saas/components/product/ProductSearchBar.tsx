import React from 'react'
import { Search } from 'lucide-react'

interface ProductSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSubmit: (e: React.FormEvent) => void
  theme: any
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSubmit,
  theme
}) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un produit par nom ou référence..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
  )
}

export default ProductSearchBar