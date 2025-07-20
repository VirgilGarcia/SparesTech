import { useCategoryApi } from '../../hooks/api/useCategoryApi'
import type { Category, CreateCategoryData, UpdateCategoryData } from '../../hooks/api/useCategoryApi'

/**
 * Service wrapper pour la gestion des catégories
 * Route les appels vers l'API backend pour éviter les problèmes RLS
 */

export const categoryService = {
  
  /**
   * Récupère toutes les catégories
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const api = useCategoryApi()
      return api.getAll()
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      return []
    }
  },

  /**
   * Récupère l'arbre des catégories
   */
  getCategoriesTree: async (): Promise<Category[]> => {
    try {
      const api = useCategoryApi()
      return api.getTree()
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'arbre des catégories:', error)
      return []
    }
  },

  /**
   * Récupère une catégorie par ID
   */
  getCategoryById: async (id: number): Promise<Category | null> => {
    try {
      const api = useCategoryApi()
      return api.getById(id)
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie:', error)
      return null
    }
  },

  /**
   * Crée une nouvelle catégorie
   */
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const api = useCategoryApi()
    const result = await api.create(data)
    if (!result) {
      throw new Error('Impossible de créer la catégorie')
    }
    return result
  },

  /**
   * Met à jour une catégorie
   */
  updateCategory: async (id: number, data: UpdateCategoryData): Promise<Category> => {
    const api = useCategoryApi()
    const result = await api.update(id, data)
    if (!result) {
      throw new Error('Impossible de mettre à jour la catégorie')
    }
    return result
  },

  /**
   * Supprime une catégorie
   */
  deleteCategory: async (id: number): Promise<boolean> => {
    try {
      const api = useCategoryApi()
      return api.remove(id)
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error)
      return false
    }
  },

  /**
   * Réorganise les catégories
   */
  reorderCategories: async (categories: Array<{ id: number, order_index: number }>): Promise<boolean> => {
    try {
      const api = useCategoryApi()
      return api.reorder(categories)
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error)
      return false
    }
  }
}

// Export des types pour compatibilité
export type { Category, CreateCategoryData, UpdateCategoryData }