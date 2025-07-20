import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'

export interface Category {
  id: number
  name: string
  description?: string
  parent_id?: number | null
  level: number
  path: string
  order_index: number
  is_active: boolean
  tenant_id?: string
  created_at: string
  updated_at: string
  children?: Category[]
  product_count?: number
}

export interface CreateCategoryData {
  name: string
  description?: string
  parent_id?: number | null
  order_index?: number
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  parent_id?: number | null
  order_index?: number
  is_active?: boolean
}

/**
 * Hook pour la gestion des catégories via l'API backend
 */
export const useCategoryApi = () => {
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère toutes les catégories
   */
  const getAll = useCallback(async (): Promise<Category[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/categories')
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les catégories'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère l'arbre des catégories
   */
  const getTree = useCallback(async (): Promise<Category[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/categories/tree')
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer l\'arbre des catégories'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère une catégorie par ID
   */
  const getById = useCallback(async (id: number): Promise<Category | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/categories/${id}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer la catégorie'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Crée une nouvelle catégorie
   */
  const create = useCallback(async (data: CreateCategoryData): Promise<Category> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/categories', data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de créer la catégorie'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Met à jour une catégorie
   */
  const update = useCallback(async (id: number, data: UpdateCategoryData): Promise<Category> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put(`/categories/${id}`, data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de mettre à jour la catégorie'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Supprime une catégorie
   */
  const remove = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/categories/${id}`)
      return true
    } catch (err) {
      const errorMessage = 'Impossible de supprimer la catégorie'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Réorganise les catégories
   */
  const reorder = useCallback(async (categories: Array<{ id: number, order_index: number }>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/categories/reorder', { categories })
      return true
    } catch (err) {
      const errorMessage = 'Impossible de réorganiser les catégories'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  return {
    // État
    loading,
    error,

    // Méthodes CRUD
    getAll,
    getTree,
    getById,
    create,
    update,
    remove,

    // Méthodes spécifiques
    reorder
  }
}