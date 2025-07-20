import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'

export interface Product {
  id: string
  reference: string
  name: string
  prix: number
  stock: number
  visible: boolean
  vendable: boolean
  photo_url?: string
  tenant_id?: string
  created_at: string
  updated_at: string
  product_categories?: {
    id: string
    category_id: number
    categories: {
      id: number
      name: string
      path: string
    }
  }[]
  [key: string]: any
}

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

export interface CreateProductData {
  reference: string
  name: string
  prix: number
  stock: number
  visible?: boolean
  vendable?: boolean
  photo_url?: string
  categories?: number[]
  customFields?: Record<string, any>
}

export interface UpdateProductData {
  reference?: string
  name?: string
  prix?: number
  stock?: number
  visible?: boolean
  vendable?: boolean
  photo_url?: string
  categories?: number[]
  customFields?: Record<string, any>
}

export interface ProductFilter {
  search?: string
  category_id?: number
  visible?: boolean
  vendable?: boolean
  min_price?: number
  max_price?: number
  in_stock?: boolean
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

/**
 * Hook pour la gestion des produits via l'API backend
 */
export const useProductApi = () => {
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les produits avec filtres
   */
  const getAll = useCallback(async (filter?: ProductFilter): Promise<{
    data: Product[]
    total: number
  }> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/products', { params: filter })
      return {
        data: response.data || [],
        total: response.total || 0
      }
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les produits'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère un produit par ID
   */
  const getById = useCallback(async (id: string): Promise<Product | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/products/${id}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer le produit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère un produit par référence
   */
  const getByReference = useCallback(async (reference: string): Promise<Product | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/products/reference/${reference}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer le produit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Crée un nouveau produit
   */
  const create = useCallback(async (data: CreateProductData): Promise<Product> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/products', data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de créer le produit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Met à jour un produit
   */
  const update = useCallback(async (id: string, data: UpdateProductData): Promise<Product> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put(`/products/${id}`, data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de mettre à jour le produit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Supprime un produit
   */
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/products/${id}`)
      return true
    } catch (err) {
      const errorMessage = 'Impossible de supprimer le produit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Upload d'une image produit
   */
  const uploadImage = useCallback(async (productId: string, file: File): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post(`/products/${productId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.photo_url
    } catch (err) {
      const errorMessage = 'Impossible d\'uploader l\'image'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Recherche de produits
   */
  const search = useCallback(async (query: string, filters?: Omit<ProductFilter, 'search'>): Promise<{
    data: Product[]
    total: number
  }> => {
    return getAll({ ...filters, search: query })
  }, [getAll])

  /**
   * Récupère les produits par catégorie
   */
  const getByCategory = useCallback(async (categoryId: number, filters?: Omit<ProductFilter, 'category_id'>): Promise<{
    data: Product[]
    total: number
  }> => {
    return getAll({ ...filters, category_id: categoryId })
  }, [getAll])

  /**
   * Récupère les produits visibles (pour le catalogue public)
   */
  const getVisible = useCallback(async (filters?: Omit<ProductFilter, 'visible'>): Promise<{
    data: Product[]
    total: number
  }> => {
    return getAll({ ...filters, visible: true })
  }, [getAll])

  /**
   * Met à jour le stock d'un produit
   */
  const updateStock = useCallback(async (id: string, newStock: number): Promise<Product> => {
    return update(id, { stock: newStock })
  }, [update])

  /**
   * Met à jour la visibilité d'un produit
   */
  const updateVisibility = useCallback(async (id: string, visible: boolean): Promise<Product> => {
    return update(id, { visible })
  }, [update])

  /**
   * Met à jour le statut vendable d'un produit
   */
  const updateSaleable = useCallback(async (id: string, vendable: boolean): Promise<Product> => {
    return update(id, { vendable })
  }, [update])

  /**
   * Récupère les statistiques des produits
   */
  const getStats = useCallback(async (): Promise<{
    total: number
    visible: number
    inStock: number
    lowStock: number
    totalValue: number
  }> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/products/stats')
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les statistiques'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Import/Export de produits
   */
  const exportProducts = useCallback(async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/products/export?format=${format}`, {
        responseType: 'blob'
      })
      return response
    } catch (err) {
      const errorMessage = 'Impossible d\'exporter les produits'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  const importProducts = useCallback(async (file: File): Promise<{
    success: number
    errors: string[]
  }> => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post('/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible d\'importer les produits'
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
    getByReference,
    create,
    update,
    remove,

    // Méthodes de recherche
    search,
    getByCategory,
    getVisible,

    // Méthodes spécifiques
    uploadImage,
    updateStock,
    updateVisibility,
    updateSaleable,

    // Statistiques et import/export
    getStats,
    exportProducts,
    importProducts
  }
}