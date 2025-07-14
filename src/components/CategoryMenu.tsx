import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { categoryService, type CategoryTree } from '../services/categoryService'
import { useTheme } from '../context/ThemeContext'

interface CategoryMenuProps {
  className?: string
  maxLevels?: number
}

function CategoryMenu({ className = '', maxLevels = 2 }: CategoryMenuProps) {
  const { theme } = useTheme()
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const tree = await categoryService.getCategoryTree()
      setCategoryTree(tree)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderCategoryItem = (category: CategoryTree, level: number = 0): JSX.Element => {
    const hasChildren = category.children.length > 0 && level < maxLevels - 1
    const isHovered = hoveredCategory === category.id

    return (
      <div key={category.id} className="relative">
        <Link
          to={`/catalog?category=${category.id}`}
          className={`
            flex items-center justify-between px-4 py-2 text-sm transition-colors
            ${level > 0 ? 'pl-6' : ''}
            ${isHovered ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
          `}
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
          </div>
          
          {hasChildren && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>

        {/* Sous-menu */}
        {hasChildren && isHovered && (
          <div className="absolute left-full top-0 z-50 min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            {category.children.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <span>Catégories</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    )
  }

  if (categoryTree.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span>Catégories</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 min-w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1">
          <div className="py-2">
            {/* Lien vers toutes les catégories */}
            <Link
              to="/catalog"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">📋</span>
              Toutes les catégories
            </Link>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Catégories principales */}
            {categoryTree.map(category => renderCategoryItem(category))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryMenu 