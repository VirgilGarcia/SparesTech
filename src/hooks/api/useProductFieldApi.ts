import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'

export interface ProductField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'boolean'
  required: boolean
  options?: string[]
  default_value?: string
  tenant_id?: string
  created_at: string
  active?: boolean
  system?: boolean
  catalog_order?: number
  product_order?: number
}

export interface CreateProductFieldData {
  name: string
  label: string
  type: ProductField['type']
  required?: boolean
  options?: string[]
  default_value?: string
  active?: boolean
  catalog_order?: number
  product_order?: number
}

export interface UpdateProductFieldData {
  label?: string
  type?: ProductField['type']
  required?: boolean
  options?: string[]
  default_value?: string
  active?: boolean
  catalog_order?: number
  product_order?: number
}

/**
 * Hook pour la gestion des champs de produits via l'API backend
 */
export const useProductFieldApi = () => {
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les champs de produits
   */
  const getAll = useCallback(async (activeOnly = true): Promise<ProductField[]> => {
    setLoading(true)
    setError(null)
    try {
      const params = activeOnly ? { active: true } : {}
      const response = await api.get('/product-fields', { params })
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les champs de produits'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère un champ par ID
   */
  const getById = useCallback(async (id: string): Promise<ProductField | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/product-fields/${id}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer le champ'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère un champ par nom
   */
  const getByName = useCallback(async (name: string): Promise<ProductField | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/product-fields/name/${name}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer le champ'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Crée un nouveau champ
   */
  const create = useCallback(async (data: CreateProductFieldData): Promise<ProductField> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/product-fields', data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de créer le champ'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Met à jour un champ
   */
  const update = useCallback(async (id: string, data: UpdateProductFieldData): Promise<ProductField> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put(`/product-fields/${id}`, data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de mettre à jour le champ'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Supprime un champ
   */
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/product-fields/${id}`)
      return true
    } catch (err) {
      const errorMessage = 'Impossible de supprimer le champ'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Réorganise les champs (met à jour l'ordre)
   */
  const reorder = useCallback(async (fields: Array<{ id: string, order: number }>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/product-fields/reorder', { fields })
      return true
    } catch (err) {
      const errorMessage = 'Impossible de réorganiser les champs'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Active/désactive un champ
   */
  const toggleActive = useCallback(async (id: string, active: boolean): Promise<ProductField> => {
    return update(id, { active })
  }, [update])

  /**
   * Récupère les champs système (non modifiables)
   */
  const getSystemFields = useCallback(async (): Promise<ProductField[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/product-fields/system')
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les champs système'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère les champs personnalisés (modifiables)
   */
  const getCustomFields = useCallback(async (): Promise<ProductField[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/product-fields/custom')
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les champs personnalisés'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère les champs ordonnés pour le catalogue
   */
  const getCatalogFields = useCallback(async (): Promise<ProductField[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/product-fields/catalog-order')
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les champs du catalogue'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère les champs ordonnés pour l'édition de produit
   */
  const getProductEditFields = useCallback(async (): Promise<ProductField[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/product-fields/product-order')
      return response.data || []
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les champs d\'édition'
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
    getById,
    getByName,
    create,
    update,
    remove,

    // Méthodes spécifiques
    reorder,
    toggleActive,
    getSystemFields,
    getCustomFields,
    getCatalogFields,
    getProductEditFields
  }
}