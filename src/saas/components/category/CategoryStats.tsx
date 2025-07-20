import React from 'react'
import { Folder, FolderOpen, Package, TreePine } from 'lucide-react'
import type { Category } from '../../services/categoryService'

interface CategoryStatsProps {
  categories: Category[]
}

const CategoryStats: React.FC<CategoryStatsProps> = ({ categories }) => {
  const totalCategories = categories.length
  const rootCategories = categories.filter(cat => !cat.parent_id).length
  const subCategories = totalCategories - rootCategories
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)

  const stats = [
    {
      name: 'Total catégories',
      value: totalCategories,
      icon: Folder,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Catégories racines',
      value: rootCategories,
      icon: TreePine,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Sous-catégories',
      value: subCategories,
      icon: FolderOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Produits associés',
      value: totalProducts,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CategoryStats