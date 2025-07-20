import { useProductApi } from '../../hooks/api/useProductApi'
import { useProductFieldApi } from '../../hooks/api/useProductFieldApi'
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilter
} from '../../hooks/api/useProductApi'
import type { ProductField } from '../../hooks/api/useProductFieldApi'

/**
 * Service wrapper pour la gestion des produits
 * Route les appels critiques vers l'API backend pour éviter les problèmes RLS
 */

// Interfaces pour compatibilité avec l'ancien service
export interface ProductDisplay {
  [fieldName: string]: {
    value: any
    field: ProductField
  }
}

export interface ProductFieldDisplay {
  id: string
  name: string
  label: string
  type: ProductField['type']
  required: boolean
  options?: string[]
  default_value?: string
  active: boolean
  system: boolean
  catalog_order: number
  product_order: number
}

export const productService = {
  
  /**
   * Récupère tous les produits avec filtres
   */
  getProducts: async (filter?: ProductFilter): Promise<{
    products: Product[]
    totalCount: number
  }> => {
    try {
      const api = useProductApi()
      const result = await api.getAll(filter)
      return {
        products: result.data || [],
        totalCount: result.total || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      return {
        products: [],
        totalCount: 0
      }
    }
  },

  /**
   * Récupère un produit par ID
   */
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const api = useProductApi()
      return api.getById(id)
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error)
      return null
    }
  },

  /**
   * Récupère un produit par référence
   */
  getProductByReference: async (reference: string): Promise<Product | null> => {
    try {
      const api = useProductApi()
      return api.getByReference(reference)
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error)
      return null
    }
  },

  /**
   * Crée un nouveau produit
   */
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const api = useProductApi()
    const result = await api.create(data)
    if (!result) {
      throw new Error('Impossible de créer le produit')
    }
    return result
  },

  /**
   * Met à jour un produit
   */
  updateProduct: async (id: string, data: UpdateProductData): Promise<Product> => {
    const api = useProductApi()
    const result = await api.update(id, data)
    if (!result) {
      throw new Error('Impossible de mettre à jour le produit')
    }
    return result
  },

  /**
   * Supprime un produit
   */
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const api = useProductApi()
      return api.remove(id)
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error)
      return false
    }
  },

  /**
   * Upload d'une image produit
   */
  uploadProductImage: async (productId: string, file: File): Promise<string> => {
    const api = useProductApi()
    return api.uploadImage(productId, file)
  },

  /**
   * Recherche de produits
   */
  searchProducts: async (query: string, filters?: Omit<ProductFilter, 'search'>): Promise<Product[]> => {
    try {
      const api = useProductApi()
      const result = await api.search(query, filters)
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return []
    }
  },

  /**
   * Récupère les produits par catégorie
   */
  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    try {
      const api = useProductApi()
      const result = await api.getByCategory(categoryId)
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      return []
    }
  },

  /**
   * Récupère les produits visibles (pour le catalogue public)
   */
  getVisibleProducts: async (filters?: Omit<ProductFilter, 'visible'>): Promise<Product[]> => {
    try {
      const api = useProductApi()
      const result = await api.getVisible(filters)
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      return []
    }
  },

  /**
   * Met à jour le stock d'un produit
   */
  updateProductStock: async (id: string, newStock: number): Promise<Product | null> => {
    try {
      const api = useProductApi()
      return api.updateStock(id, newStock)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error)
      return null
    }
  },

  /**
   * Met à jour la visibilité d'un produit
   */
  updateProductVisibility: async (id: string, visible: boolean): Promise<Product | null> => {
    try {
      const api = useProductApi()
      return api.updateVisibility(id, visible)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visibilité:', error)
      return null
    }
  },

  /**
   * Récupère les statistiques des produits
   */
  getProductStats: async (): Promise<{
    total: number
    visible: number
    inStock: number
    lowStock: number
    totalValue: number
  }> => {
    try {
      const api = useProductApi()
      return api.getStats()
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        total: 0,
        visible: 0,
        inStock: 0,
        lowStock: 0,
        totalValue: 0
      }
    }
  },

  /**
   * Export de produits
   */
  exportProducts: async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const api = useProductApi()
    return api.exportProducts(format)
  },

  /**
   * Import de produits
   */
  importProducts: async (file: File): Promise<{
    success: number
    errors: string[]
  }> => {
    const api = useProductApi()
    return api.importProducts(file)
  }
}

/**
 * Service pour la gestion des champs de produits
 */
export const productFieldService = {
  
  /**
   * Récupère tous les champs de produits
   */
  getProductFields: async (activeOnly = true): Promise<ProductField[]> => {
    try {
      const api = useProductFieldApi()
      return api.getAll(activeOnly)
    } catch (error) {
      console.error('Erreur lors de la récupération des champs:', error)
      return []
    }
  },

  /**
   * Récupère un champ par ID
   */
  getProductFieldById: async (id: string): Promise<ProductField | null> => {
    try {
      const api = useProductFieldApi()
      return api.getById(id)
    } catch (error) {
      console.error('Erreur lors de la récupération du champ:', error)
      return null
    }
  },

  /**
   * Crée un nouveau champ
   */
  createProductField: async (data: {
    name: string
    label: string
    type: ProductField['type']
    required?: boolean
    options?: string[]
    default_value?: string
  }): Promise<ProductField> => {
    const api = useProductFieldApi()
    const result = await api.create(data)
    if (!result) {
      throw new Error('Impossible de créer le champ')
    }
    return result
  },

  /**
   * Met à jour un champ
   */
  updateProductField: async (id: string, data: Partial<ProductField>): Promise<ProductField> => {
    const api = useProductFieldApi()
    const result = await api.update(id, data)
    if (!result) {
      throw new Error('Impossible de mettre à jour le champ')
    }
    return result
  },

  /**
   * Supprime un champ
   */
  deleteProductField: async (id: string): Promise<boolean> => {
    try {
      const api = useProductFieldApi()
      return api.remove(id)
    } catch (error) {
      console.error('Erreur lors de la suppression du champ:', error)
      return false
    }
  },

  /**
   * Réorganise les champs
   */
  reorderProductFields: async (fields: Array<{ id: string, order: number }>): Promise<boolean> => {
    try {
      const api = useProductFieldApi()
      return api.reorder(fields)
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error)
      return false
    }
  },

  /**
   * Récupère les champs système
   */
  getSystemFields: async (): Promise<ProductField[]> => {
    try {
      const api = useProductFieldApi()
      return api.getSystemFields()
    } catch (error) {
      console.error('Erreur lors de la récupération des champs système:', error)
      return []
    }
  },

  /**
   * Récupère les champs personnalisés
   */
  getCustomFields: async (): Promise<ProductField[]> => {
    try {
      const api = useProductFieldApi()
      return api.getCustomFields()
    } catch (error) {
      console.error('Erreur lors de la récupération des champs personnalisés:', error)
      return []
    }
  },

  /**
   * Récupère les champs ordonnés pour le catalogue
   */
  getCatalogFields: async (): Promise<ProductField[]> => {
    try {
      const api = useProductFieldApi()
      return api.getCatalogFields()
    } catch (error) {
      console.error('Erreur lors de la récupération des champs du catalogue:', error)
      return []
    }
  },

  /**
   * Récupère les champs ordonnés pour l'édition de produit
   */
  getProductEditFields: async (): Promise<ProductField[]> => {
    try {
      const api = useProductFieldApi()
      return api.getProductEditFields()
    } catch (error) {
      console.error('Erreur lors de la récupération des champs d\'édition:', error)
      return []
    }
  }
}

// Export des types pour compatibilité
export type {
  Product,
  ProductField,
  CreateProductData,
  UpdateProductData,
  ProductFilter
}