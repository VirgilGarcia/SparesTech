// Service wrapper pour migrer progressivement vers l'API backend
// ✅ CORRIGÉ - Utilise des API clients au lieu de hooks React
import { categoryApiClient } from '../../lib/apiClients'
import type { Category, CreateCategoryData } from '../../hooks/api/useCategoryApi'

// Type pour l'arbre de catégories (compatibilité avec l'ancien service)
export interface CategoryTree extends Category {
  children?: CategoryTree[]
}

/**
 * Service de gestion des catégories avec fonctions critiques migrées
 */
export const categoryService = {
  
  /**
   * Récupérer toutes les catégories (MIGRÉ vers API)
   */
  getAllCategories: async (): Promise<Category[]> => {
    try {
      return await categoryApiClient.getAll()
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      return []
    }
  },

  /**
   * Récupérer une catégorie par ID (MIGRÉ vers API)
   */
  getCategoryById: async (id: number): Promise<Category | null> => {
    try {
      return await categoryApiClient.getById(id)
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie:', error)
      return null
    }
  },

  /**
   * Créer une nouvelle catégorie (MIGRÉ vers API)
   */
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const result = await categoryApiClient.create(data)
    
    if (!result) {
      throw new Error('Erreur lors de la création de la catégorie')
    }
    
    return result
  },

  /**
   * Construire l'arbre de catégories à partir de la liste plate
   */
  getCategoryTree: async (): Promise<CategoryTree[]> => {
    try {
      const categories = await categoryApiClient.getAll()
      
      // Convertir en arbre hiérarchique
      const categoryMap = new Map<number, CategoryTree>()
      const roots: CategoryTree[] = []
      
      // Première passe : créer tous les noeuds
      categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] })
      })
      
      // Deuxième passe : construire la hiérarchie
      categories.forEach(cat => {
        const node = categoryMap.get(cat.id)!
        
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          const parent = categoryMap.get(cat.parent_id)!
          parent.children = parent.children || []
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      })
      
      return roots
    } catch (error) {
      console.error('Erreur lors de la construction de l\'arbre des catégories:', error)
      return []
    }
  },

  /**
   * Récupérer les catégories racines
   */
  getRootCategories: async (): Promise<Category[]> => {
    try {
      const categories = await categoryApiClient.getAll()
      return categories.filter(cat => !cat.parent_id)
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories racines:', error)
      return []
    }
  },

  /**
   * Récupérer les sous-catégories d'une catégorie
   */
  getSubCategories: async (parentId: number): Promise<Category[]> => {
    try {
      const categories = await categoryApiClient.getAll()
      return categories.filter(cat => cat.parent_id === parentId)
    } catch (error) {
      console.error('Erreur lors de la récupération des sous-catégories:', error)
      return []
    }
  },

  /**
   * Obtenir l'arbre des catégories (alias pour compatibilité)
   */
  getCategoriesTree: async (): Promise<CategoryTree[]> => {
    return categoryService.getCategoryTree()
  },

  /**
   * Obtenir le chemin d'une catégorie
   */
  getCategoryPath: async (categoryId: number): Promise<Category[]> => {
    try {
      const categories = await categoryApiClient.getAll()
      const categoryMap = new Map(categories.map(c => [c.id, c]))
      const path: Category[] = []
      
      let currentCat = categoryMap.get(categoryId)
      while (currentCat) {
        path.unshift(currentCat)
        currentCat = currentCat.parent_id ? categoryMap.get(currentCat.parent_id) : undefined
      }
      
      return path
    } catch (error) {
      console.error('Erreur lors de la récupération du chemin de catégorie:', error)
      return []
    }
  },

  /**
   * Vérifie s'il y a des catégories
   */
  hasCategories: async (): Promise<boolean> => {
    try {
      const categories = await categoryApiClient.getAll()
      return categories.length > 0
    } catch (error) {
      console.error('Erreur lors de la vérification des catégories:', error)
      return false
    }
  },

  /**
   * Met à jour une catégorie
   */
  updateCategory: async (id: number, data: Partial<CreateCategoryData>): Promise<Category | null> => {
    try {
      return await categoryApiClient.update(id, data)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error)
      return null
    }
  },

  /**
   * Ajoute une catégorie (alias pour compatibilité)
   */
  addCategory: async (data: CreateCategoryData): Promise<Category> => {
    return categoryService.createCategory(data)
  },

  /**
   * Supprime une catégorie
   */
  deleteCategory: async (id: number): Promise<boolean> => {
    try {
      return await categoryApiClient.remove(id)
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error)
      return false
    }
  }
}

// Export des types pour compatibilité
export type { Category, CreateCategoryData }

// Export de UpdateCategoryData pour compatibilité
export type UpdateCategoryData = Partial<CreateCategoryData>

// Export du type CategoryTree (résolution du conflit)
export type { CategoryTree }