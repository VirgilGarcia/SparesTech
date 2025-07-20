import React from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

interface ProductListHeaderProps {
  totalItems: number
  theme: any
}

const ProductListHeader: React.FC<ProductListHeaderProps> = ({ totalItems, theme }) => {
  return (
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
          <Plus className="w-5 h-5" />
          <span>Ajouter un produit</span>
        </Link>
      </div>
    </div>
  )
}

export default ProductListHeader