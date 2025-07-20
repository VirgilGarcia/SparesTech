import React from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, Edit, Trash2, Plus } from 'lucide-react'
import type { CategoryTree as CategoryTreeType } from '../../services/categoryService'

interface Theme {
  primaryColor: string
  companyName: string
  logoUrl: string | null
}

interface CategoryTreeProps {
  categoryTree: CategoryTreeType[]
  onEdit: (category: CategoryTreeType) => void
  onDelete: (category: CategoryTreeType) => void
  onAddChild: (parentId: number) => void
  expandedCategories: Set<number>
  onToggleExpanded: (categoryId: number) => void
  searchQuery: string
  theme: Theme
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categoryTree,
  onEdit,
  onDelete,
  onAddChild,
  expandedCategories,
  onToggleExpanded,
  searchQuery,
  theme
}) => {
  const filterCategories = (categories: CategoryTreeType[], query: string): CategoryTreeType[] => {
    if (!query) return categories

    return categories.filter(category => {
      const matchesQuery = category.name.toLowerCase().includes(query.toLowerCase()) ||
                          category.description?.toLowerCase().includes(query.toLowerCase())
      
      const hasMatchingChildren = category.children && 
                                 filterCategories(category.children, query).length > 0
      
      return matchesQuery || hasMatchingChildren
    }).map(category => ({
      ...category,
      children: category.children ? filterCategories(category.children, query) : []
    }))
  }

  const renderCategory = (category: CategoryTreeType, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0
    const paddingLeft = level * 24

    return (
      <div key={category.id} className="border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center flex-1" style={{ paddingLeft }}>
            {hasChildren ? (
              <button
                onClick={() => onToggleExpanded(category.id)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 mr-2" />
            )}
            
            <div className="flex items-center mr-3">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                ) : (
                  <Folder className="w-5 h-5 text-blue-500" />
                )
              ) : (
                <Folder className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {category.product_count || 0} produits
                </span>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span>ID: {category.id}</span>
                <span className="mx-2">•</span>
                <span>Chemin: {category.path}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAddChild(category.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full"
              title="Ajouter une sous-catégorie"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const filteredCategories = filterCategories(categoryTree, searchQuery)

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
        </h3>
        <p className="text-gray-500 mb-6">
          {searchQuery 
            ? `Aucune catégorie ne correspond à "${searchQuery}"`
            : 'Commencez par créer votre première catégorie'
          }
        </p>
        {!searchQuery && (
          <button
            onClick={() => onAddChild(0)}
            className="inline-flex items-center px-4 py-2 text-white rounded-md hover:opacity-90"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une catégorie
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {filteredCategories.map(category => renderCategory(category))}
    </div>
  )
}

export default CategoryTree