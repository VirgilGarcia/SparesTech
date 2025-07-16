import { useState, useEffect } from 'react'
import { categoryService, type Category } from '../services/categoryService'
import { useMarketplaceTheme } from '../context/ThemeContext'

interface CategoryBreadcrumbProps {
  categoryId?: number | null
  categoryPath?: string
  onCategorySelect?: (categoryId: number, categoryPath: string) => void
  className?: string
}

function CategoryBreadcrumb({ 
  categoryId, 
  categoryPath, 
  onCategorySelect,
  className = ''
}: CategoryBreadcrumbProps) {
  const { theme } = useMarketplaceTheme()
  const [breadcrumbPath, setBreadcrumbPath] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (categoryId) {
      console.log('🍞 CategoryBreadcrumb: Chargement du chemin pour categoryId:', categoryId)
      loadBreadcrumbPath(categoryId)
    } else if (categoryPath) {
      console.log('🍞 CategoryBreadcrumb: Parsing du chemin:', categoryPath)
      parseCategoryPath(categoryPath)
    } else {
      console.log('🍞 CategoryBreadcrumb: Pas de catégorie, réinitialisation du chemin')
      setBreadcrumbPath([])
    }
  }, [categoryId, categoryPath])

  const loadBreadcrumbPath = async (id: number) => {
    try {
      setLoading(true)
      console.log('🍞 Chargement du chemin pour la catégorie ID:', id)
      const path = await categoryService.getCategoryPath(id)
      console.log('🍞 Chemin de catégorie récupéré:', path)
      setBreadcrumbPath(path)
    } catch (error) {
      console.error('❌ Erreur lors du chargement du fil d\'Ariane:', error)
      setBreadcrumbPath([])
    } finally {
      setLoading(false)
    }
  }

  const parseCategoryPath = async (path: string) => {
    try {
      setLoading(true)
      // Le path est au format "parent > child > grandchild"
      const categoryNames = path.split(' > ').map(name => name.trim())
      
      // Charger toutes les catégories pour trouver les IDs
      const allCategories = await categoryService.getAllCategories()
      const breadcrumb: Category[] = []
      
      for (const categoryName of categoryNames) {
        const category = allCategories.find(cat => cat.name === categoryName)
        if (category) {
          breadcrumb.push(category)
        }
      }
      
      setBreadcrumbPath(breadcrumb)
    } catch (error) {
      console.error('Erreur lors du parsing du path:', error)
      setBreadcrumbPath([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category.id, category.path)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
      </div>
    )
  }

  if (breadcrumbPath.length === 0) {
    return null
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Fil d'Ariane">
      {/* Accueil */}
      <button
        onClick={() => {
          if (onCategorySelect) {
            // Utiliser un ID spécial pour indiquer la sélection de "Accueil"
            onCategorySelect(-1, '') // Reset to root
          }
        }}
        className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Accueil</span>
      </button>

      {/* Séparateur */}
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      {/* Catégories */}
      {breadcrumbPath.map((category, index) => (
        <div key={category.id} className="flex items-center space-x-2">
          <button
            onClick={() => handleCategoryClick(category)}
            className={`
              flex items-center space-x-1 transition-colors hover:opacity-80
              ${index === breadcrumbPath.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
            style={{
              color: index === breadcrumbPath.length - 1 ? theme.primaryColor : undefined
            }}
          >
            <span>{category.name}</span>
          </button>

          {/* Séparateur (sauf pour le dernier élément) */}
          {index < breadcrumbPath.length - 1 && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </nav>
  )
}

export default CategoryBreadcrumb 