import { useState, useEffect } from 'react'
import { categoryService, type CategoryTree } from '../../services/categoryService'

interface CategorySelectorProps {
  value?: number | null
  onChange: (categoryId: number | null) => void
  placeholder?: string
  className?: string
  required?: boolean
}

function CategorySelector({ 
  value, 
  onChange, 
  placeholder = "Sélectionner une catégorie",
  className = "",
  required = false
}: CategorySelectorProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (value) {
      loadSelectedCategoryPath(value)
    } else {
      setSelectedCategoryPath('')
    }
  }, [value])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const tree = await categoryService.getCategoriesTree()
      setCategoryTree(tree)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSelectedCategoryPath = async (categoryId: number) => {
    try {
      const path = await categoryService.getCategoryPath(categoryId)
      setSelectedCategoryPath(path.map(cat => cat.name).join(' > '))
    } catch (error) {
      console.error('Erreur lors du chargement du chemin de la catégorie:', error)
    }
  }

  const handleCategorySelect = (category: CategoryTree) => {
    onChange(category.id)
    setSelectedCategoryPath(category.path)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setSelectedCategoryPath('')
    setIsOpen(false)
  }

  const renderCategoryOption = (category: CategoryTree, level: number = 0): React.ReactNode => {
    return (
      <div key={category.id}>
        <button
          type="button"
          onClick={() => handleCategorySelect(category)}
          className={`
            w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors
            ${level > 0 ? 'pl-' + (level * 4 + 3) : 'pl-3'}
            ${value === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
          `}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm">{category.name}</span>
            {(category.children || []).length > 0 && (
              <span className="text-xs text-gray-500">({(category.children || []).length})</span>
            )}
          </div>
        </button>
        
        {/* Sous-catégories */}
        {(category.children || []).length > 0 && (
          <div className="border-l border-gray-200 ml-3">
            {(category.children || []).map(child => renderCategoryOption(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Catégorie {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors
            ${isOpen ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}
            ${selectedCategoryPath ? 'text-gray-900' : 'text-gray-500'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">
              {selectedCategoryPath || placeholder}
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

        {/* Bouton pour effacer la sélection */}
        {selectedCategoryPath && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <span className="text-xs">Chargement...</span>
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Aucune catégorie disponible
            </div>
          ) : (
            <div className="py-1">
              {categoryTree.map(category => renderCategoryOption(category))}
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default CategorySelector 