import { productApiClient, productFieldApiClient } from '../../lib/apiClients'
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
 * ✅ CORRIGÉ - Utilise des API clients au lieu de hooks React
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
  field_name: string
  label: string
  display_name: string
  type: ProductField['type']
  field_type: string
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
      const result = await productApiClient.getAll(filter)
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
      return await productApiClient.getById(id)
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
      // Utiliser un filtre pour chercher par référence
      const result = await productApiClient.getAll({ search: reference })
      const product = result.data.find(p => p.reference === reference)
      return product || null
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error)
      return null
    }
  },

  /**
   * Crée un nouveau produit
   */
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const result = await productApiClient.create(data)
    if (!result) {
      throw new Error('Impossible de créer le produit')
    }
    return result
  },

  /**
   * Met à jour un produit
   */
  updateProduct: async (id: string, data: UpdateProductData): Promise<Product> => {
    const result = await productApiClient.update(id, data)
    if (!result) {
      throw new Error('Impossible de mettre à jour le produit')
    }
    return result
  },

  /**
   * Supprime un produit
   */
  deleteProduct: async (id: string): Promise<boolean> => {
    return await productApiClient.delete(id)
  },

  /**
   * Récupère les produits visibles avec pagination
   */
  getVisibleProductsPaginated: async (params: {
    page?: number
    limit?: number
    search?: string
    categoryId?: number
    categoryIds?: number[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    products: Product[]
    total: number
  }> => {
    try {
      const filter: ProductFilter = {
        page: params.page,
        limit: params.limit,
        search: params.search,
        category_id: params.categoryId,
        sort_by: params.sortBy,
        sort_order: params.sortOrder
      }
      
      const result = await productApiClient.getAll(filter)
      return {
        products: result.data,
        total: result.total
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits paginés:', error)
      return {
        products: [],
        total: 0
      }
    }
  },

  /**
   * Ajoute un nouveau produit
   */
  addProduct: async (productData: CreateProductData): Promise<Product | null> => {
    try {
      return await productApiClient.create(productData)
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error)
      return null
    }
  },

  /**
   * Récupère tous les produits (alias pour compatibilité)
   */
  getAllProducts: async (filter?: ProductFilter): Promise<Product[]> => {
    try {
      const result = await productApiClient.getAll(filter)
      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les produits:', error)
      return []
    }
  },

  /**
   * Récupère les valeurs des champs personnalisés d'un produit
   */
  getProductFieldValues: async (productId: string): Promise<any[]> => {
    try {
      return await productFieldApiClient.getProductFieldValues(productId)
    } catch (error) {
      console.error('Erreur lors de la récupération des valeurs des champs:', error)
      return []
    }
  },

  /**
   * Met à jour une valeur de champ personnalisé
   */
  setProductFieldValue: async (productId: string, fieldId: string, value: string): Promise<boolean> => {
    try {
      return await productFieldApiClient.setProductFieldValue(productId, fieldId, value)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du champ:', error)
      return false
    }
  },

  /**
   * Récupère les champs disponibles
   */
  getProductFields: async (): Promise<ProductField[]> => {
    try {
      return await productFieldApiClient.getAll()
    } catch (error) {
      console.error('Erreur lors de la récupération des champs:', error)
      return []
    }
  }
}

// Interface pour un service de gestion des champs produits
export const productFieldService = {
  /**
   * Récupère tous les champs de produits
   */
  getAllFields: async (): Promise<ProductField[]> => {
    try {
      return await productFieldApiClient.getAll()
    } catch (error) {
      console.error('Erreur lors de la récupération des champs:', error)
      return []
    }
  },

  /**
   * Récupère tous les champs avec affichage formaté
   */
  getAllFieldDisplay: async (): Promise<ProductFieldDisplay[]> => {
    try {
      const fields = await productFieldApiClient.getAll()
      return fields.map(field => ({
        id: field.id,
        name: field.name,
        field_name: field.name,
        label: field.label,
        display_name: field.label,
        type: field.type,
        field_type: field.type,
        required: field.required,
        options: field.options,
        default_value: field.default_value,
        active: field.active || true,
        system: field.system || false,
        catalog_order: field.catalog_order || 0,
        product_order: field.product_order || 0
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des champs formatés:', error)
      return []
    }
  },

  /**
   * Initialise les champs système
   */
  initializeSystemFields: async (): Promise<boolean> => {
    try {
      const systemFields = await productFieldApiClient.getSystemFields()
      return systemFields.length > 0
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des champs système:', error)
      return false
    }
  },

  /**
   * Vérifie si les champs système existent
   */
  hasSystemFields: async (): Promise<boolean> => {
    try {
      const systemFields = await productFieldApiClient.getSystemFields()
      return systemFields.length > 0
    } catch (error) {
      console.error('Erreur lors de la vérification des champs système:', error)
      return false
    }
  },

  /**
   * Corrige les valeurs d\'ordre des champs
   */
  fixOrderValues: async (): Promise<boolean> => {
    try {
      const fields = await productFieldApiClient.getAll()
      const reorderData = fields.map((field, index) => ({
        id: field.id,
        order: index + 1
      }))
      return await productFieldApiClient.reorder(reorderData)
    } catch (error) {
      console.error('Erreur lors de la correction des ordres:', error)
      return false
    }
  },

  /**
   * Valide un nom de champ
   */
  validateFieldName: async (name: string): Promise<boolean> => {
    try {
      if (!name || name.trim().length === 0) return false
      const existingField = await productFieldApiClient.getByName(name)
      return existingField === null
    } catch (error) {
      console.error('Erreur lors de la validation du nom:', error)
      return false
    }
  },

  /**
   * Valide un label de champ
   */
  validateFieldLabel: async (label: string): Promise<boolean> => {
    try {
      return !!(label && label.trim().length > 0)
    } catch (error) {
      console.error('Erreur lors de la validation du label:', error)
      return false
    }
  },

  /**
   * Ajoute un nouveau champ
   */
  addField: async (fieldData: {
    name: string
    label: string
    type: ProductField['type']
    required?: boolean
    options?: string[]
  }): Promise<ProductField | null> => {
    try {
      return await productFieldApiClient.create(fieldData)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du champ:', error)
      return null
    }
  },

  /**
   * Met à jour un champ
   */
  updateField: async (id: string, updates: Partial<ProductField>): Promise<ProductField | null> => {
    try {
      return await productFieldApiClient.update(id, updates)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du champ:', error)
      return null
    }
  },

  /**
   * Met à jour l\'affichage des champs
   */
  updateFieldDisplay: async (displayData: ProductFieldDisplay[]): Promise<boolean> => {
    try {
      for (const display of displayData) {
        await productFieldApiClient.update(display.id, {
          catalog_order: display.catalog_order,
          product_order: display.product_order,
          active: display.active
        })
      }
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'affichage:', error)
      return false
    }
  },

  /**
   * Restaure un champ
   */
  restoreField: async (id: string): Promise<boolean> => {
    try {
      const updated = await productFieldApiClient.update(id, { active: true })
      return updated !== null
    } catch (error) {
      console.error('Erreur lors de la restauration du champ:', error)
      return false
    }
  },

  /**
   * Réorganise les champs
   */
  reorderFields: async (fieldIds: string[]): Promise<boolean> => {
    try {
      const reorderData = fieldIds.map((id, index) => ({
        id,
        order: index + 1
      }))
      return await productFieldApiClient.reorder(reorderData)
    } catch (error) {
      console.error('Erreur lors de la réorganisation des champs:', error)
      return false
    }
  }
}

// Export des types pour compatibilité
export type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilter,
  ProductField,
  ProductDisplay,
  ProductFieldDisplay
}