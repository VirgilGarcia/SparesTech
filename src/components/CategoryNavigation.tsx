import { useState, useEffect } from 'react'
import { categoryService, type CategoryTree } from '../services/categoryService'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

interface CategoryNavigationProps {
  onCategorySelect?: (categoryId: number, categoryPath: string) => void
  showProductCounts?: boolean
  maxLevels?: number
  className?: string
}

function CategoryNavigation({ 
  onCategorySelect, 
  maxLevels = 10,
  className = ''
}: CategoryNavigationProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const tree = await categoryService.getCategoryTree()
      setCategoryTree(tree)
      // Ne pas étendre les catégories par défaut - elles seront fermées
      setExpandedCategories(new Set())
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: number) => {
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
    setSelectedCategory(category.id)
    if (onCategorySelect) {
      onCategorySelect(category.id, category.path)
    }
  }

  // Mettre à jour la catégorie sélectionnée quand elle change depuis l'extérieur
  useEffect(() => {
    if (selectedCategory !== null) {
      const findAndSelectCategory = (categories: CategoryTree[]): boolean => {
        for (const cat of categories) {
          if (cat.id === selectedCategory) {
            return true
          }
          if (cat.children.length > 0 && findAndSelectCategory(cat.children)) {
            return true
          }
        }
        return false
      }
      if (!findAndSelectCategory(categoryTree)) {
        setSelectedCategory(null)
      }
    }
  }, [categoryTree, selectedCategory])

  // --- NOUVEAU RENDU MODERNE ---
  const renderCategory = (category: CategoryTree, level: number = 0): JSX.Element => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children.length > 0
    const isSelected = selectedCategory === category.id
    const canExpand = (maxLevels === undefined || level < maxLevels - 1) && hasChildren

    return (
      <div key={category.id}>
        <div
          className={`
            flex items-center gap-2 py-1 px-2 rounded-lg
            cursor-pointer transition
            ${isSelected ? 'bg-blue-100 font-semibold text-blue-700' : 'hover:bg-gray-100'}
          `}
          style={{ paddingLeft: `${level * 1.25}rem` }}
          onClick={() => handleCategoryClick(category)}
        >
          {canExpand && (
            <button
              className="mr-1 p-1 rounded hover:bg-blue-50 transition"
              onClick={e => { e.stopPropagation(); toggleCategory(category.id); }}
              aria-label={isExpanded ? 'Réduire' : 'Déplier'}
              tabIndex={-1}
              type="button"
            >
              <ChevronRightIcon
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
          <span className="truncate">{category.name}</span>
          {/* Suppression de la pastille du compteur de produits */}
        </div>
        {canExpand && isExpanded && (
          <div>
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (categoryTree.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        <p className="text-sm">Aucune catégorie disponible</p>
      </div>
    )
  }

  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Catégories
        </h3>
        <p className="text-xs text-gray-600">
          Naviguez dans nos catégories de produits
        </p>
      </div>
      <div className="space-y-0.5">
        {categoryTree.map(category => renderCategory(category))}
      </div>
    </div>
  )
}

export default CategoryNavigation 