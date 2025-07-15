import { useState, useEffect } from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import type { CategoryTree } from '../services/categoryService'

interface CategoryNavigationProps {
  categoryTree: CategoryTree[]
  onCategorySelect?: (categoryId: number, categoryPath: string) => void
  showProductCounts?: boolean
  maxLevels?: number
  className?: string
  selectedCategoryId?: number | null
}

function CategoryNavigation({ 
  categoryTree,
  onCategorySelect, 
  showProductCounts = false,
  maxLevels = 10,
  className = '',
  selectedCategoryId
}: CategoryNavigationProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  const toggleCategory = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleCategoryClick = (category: CategoryTree) => {
    if (onCategorySelect) {
      onCategorySelect(category.id, category.path)
    }
  }

  const renderCategory = (category: CategoryTree, level: number = 0): JSX.Element => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children.length > 0
    const isSelected = selectedCategoryId === category.id
    const canExpand = hasChildren && level < maxLevels

    return (
      <div key={category.id}>
        <div
          className={`
            flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all
            ${isSelected 
              ? 'bg-blue-100 text-blue-700 font-medium' 
              : 'hover:bg-gray-100'
            }
          `}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => handleCategoryClick(category)}
        >
          {canExpand && (
            <button
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              onClick={(e) => toggleCategory(category.id, e)}
              type="button"
            >
              <ChevronRightIcon
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
          
          <span className="flex-1">{category.name}</span>
          
          {showProductCounts && category.product_count !== undefined && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {category.product_count}
            </span>
          )}
        </div>
        
        {canExpand && isExpanded && (
          <div className="mt-1">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!categoryTree || categoryTree.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        <p className="text-sm">Aucune catégorie disponible</p>
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {categoryTree.map(category => renderCategory(category))}
    </div>
  )
}

export default CategoryNavigation 