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
  className = '',
  selectedCategoryId
}: CategoryNavigationProps) {

  const handleCategoryClick = (category: CategoryTree) => {
    if (onCategorySelect) {
      onCategorySelect(category.id, category.path)
    }
  }

  const renderCategory = (category: CategoryTree, level: number = 0): React.ReactNode => {
    const isSelected = selectedCategoryId === category.id
    
    // Afficher seulement les catégories de niveau 0 (racines)
    if (level > 0) {
      return <></>
    }

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
          onClick={() => handleCategoryClick(category)}
        >
          <span className="flex-1">{category.name}</span>
          
          {showProductCounts && category.product_count !== undefined && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {category.product_count}
            </span>
          )}
        </div>
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