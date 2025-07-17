import { useState, useEffect } from 'react'
import { categoryService, type CategoryTree } from '../../services/categoryService'

interface MultiCategorySelectorProps {
  value?: number[]
  onChange: (categoryIds: number[]) => void
  placeholder?: string
  className?: string
  required?: boolean
}

function MultiCategorySelector({ 
  value, 
  onChange, 
  placeholder = "Sélectionner des catégories",
  className = "",
  required = false
}: MultiCategorySelectorProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<{ id: number, name: string, path: string }[]>([])

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (value && value.length > 0) {
      loadSelectedCategories(value)
    } else {
      setSelectedCategories([])
    }
  }, [value])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const tree = await categoryService.getCategoryTree()
      setCategoryTree(tree)
      // Par défaut, on ouvre le premier niveau
      setExpanded(new Set(tree.map(cat => cat.id)))
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSelectedCategories = async (categoryIds: number[]) => {
    try {
      const categories = await Promise.all(
        categoryIds.map(id => categoryService.getCategoryById(id))
      )
      const validCategories = categories
        .filter(cat => cat !== null)
        .map(cat => ({
          id: cat!.id,
          name: cat!.name,
          path: cat!.path
        }))
      setSelectedCategories(validCategories)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories sélectionnées:', error)
    }
  }

  const handleCategorySelect = (category: CategoryTree) => {
    const currentValue = value || []
    const newValue = currentValue.includes(category.id)
      ? currentValue.filter(id => id !== category.id)
      : [...currentValue, category.id]
    onChange(newValue)
  }

  const handleRemoveCategory = (categoryId: number) => {
    const currentValue = value || []
    const newValue = currentValue.filter(id => id !== categoryId)
    onChange(newValue)
  }

  const toggleExpand = (categoryId: number) => {
    setExpanded(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderCategoryOption = (category: CategoryTree, level: number = 0): React.ReactNode => {
    const isSelected = value?.includes(category.id) || false
    const isExpanded = expanded.has(category.id)
    const hasChildren = category.children.length > 0
    return (
      <div key={category.id}>
        <div className="flex items-center" style={{ paddingLeft: `${level * 20 + 8}px` }}>
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpand(category.id)}
              className="mr-1 focus:outline-none"
              tabIndex={-1}
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleCategorySelect(category)}
            className={`flex-1 text-left py-1.5 px-2 rounded transition-colors flex items-center gap-2
              ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}
            `}
          >
            <span className="flex items-center gap-1">
              <span>{category.name}</span>
            </span>
            {isSelected && (
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
        {/* Sous-catégories */}
        {hasChildren && isExpanded && (
          <div>
            {category.children.map(child => renderCategoryOption(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Catégories {required && <span className="text-red-500">*</span>}
      </label>
      {/* Affichage des catégories sélectionnées */}
      {selectedCategories.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <span
              key={category.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              <span>{category.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveCategory(category.id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Bouton pour ouvrir le sélecteur */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg text-left transition-colors
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-gray-400'}
          ${selectedCategories.length === 0 ? 'text-gray-500' : 'text-gray-900'}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedCategories.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {selectedCategories.length === 0 
              ? placeholder 
              : `${selectedCategories.length} catégorie${selectedCategories.length !== 1 ? 's' : ''} sélectionnée${selectedCategories.length !== 1 ? 's' : ''}`
            }
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          <div className="p-2">
            {categoryTree.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucune catégorie disponible
              </div>
            ) : (
              categoryTree.map(category => renderCategoryOption(category))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiCategorySelector 