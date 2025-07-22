/**
 * API Clients pour services wrapper
 * Alternative aux hooks React pour utilisation dans les services
 */

import { api } from './api'
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilter
} from '../hooks/api/useProductApi'
import type { ProductField } from '../hooks/api/useProductFieldApi'
import type { Category, CreateCategoryData } from '../hooks/api/useCategoryApi'
import type { Order, CreateOrderData } from '../hooks/api/useOrderApi'
import type { UserProfile } from '../hooks/api/useUserApi'
import type { StartupUser } from '../hooks/api/useAuthApi'
import type { StartupSubscriptionPlan } from '../hooks/api/useStartupSubscriptionApi'

/**
 * Client API pour les produits
 */
export const productApiClient = {
  async getAll(filter?: ProductFilter): Promise<{ data: Product[], total: number }> {
    const params = filter ? { 
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      category_id: filter.category_id,
      sort_by: filter.sort_by,
      sort_order: filter.sort_order
    } : undefined

    const response = await api.get<{ products: Product[], total: number }>('/products', { params })
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des produits')
    }
    
    return {
      data: response.data?.products || [],
      total: response.data?.total || 0
    }
  },

  async getById(id: string): Promise<Product | null> {
    const response = await api.get<Product>(`/products/${id}`)
    
    if (!response.success) {
      if (response.error?.includes('404')) {
        return null
      }
      throw new Error(response.error || 'Erreur lors de la récupération du produit')
    }
    
    return response.data || null
  },

  async create(data: CreateProductData): Promise<Product> {
    const response = await api.post<Product>('/products', data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la création du produit')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la mise à jour du produit')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async delete(id: string): Promise<boolean> {
    const response = await api.delete(`/products/${id}`)
    return response.success
  }
}

/**
 * Client API pour les champs de produits
 */
export const productFieldApiClient = {
  async getProductFieldValues(productId: string): Promise<Array<{
    id: string
    product_id: string
    product_field_id: string
    value: string
    product_fields?: ProductField
  }>> {
    const response = await api.get(`/products/${productId}/field-values`)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des valeurs des champs')
    }
    
    return response.data || []
  },

  async setProductFieldValue(productId: string, fieldId: string, value: string): Promise<boolean> {
    const response = await api.post(`/products/${productId}/field-values`, {
      product_field_id: fieldId,
      value
    })
    
    return response.success
  },

  async getAll(activeOnly = true): Promise<ProductField[]> {
    const params = activeOnly ? { active: 'true' } : {}
    const response = await api.get<ProductField[]>('/product-fields', { params })
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des champs')
    }
    
    return response.data || []
  },

  async getById(id: string): Promise<ProductField | null> {
    const response = await api.get<ProductField>(`/product-fields/${id}`)
    
    if (!response.success) {
      if (response.error?.includes('404')) {
        return null
      }
      throw new Error(response.error || 'Erreur lors de la récupération du champ')
    }
    
    return response.data || null
  },

  async getByName(name: string): Promise<ProductField | null> {
    const response = await api.get<ProductField>(`/product-fields/name/${name}`)
    
    if (!response.success) {
      if (response.error?.includes('404')) {
        return null
      }
      throw new Error(response.error || 'Erreur lors de la récupération du champ')
    }
    
    return response.data || null
  },

  async getSystemFields(): Promise<ProductField[]> {
    const response = await api.get<ProductField[]>('/product-fields/system')
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des champs système')
    }
    
    return response.data || []
  },

  async getCustomFields(): Promise<ProductField[]> {
    const response = await api.get<ProductField[]>('/product-fields/custom')
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des champs personnalisés')
    }
    
    return response.data || []
  },

  async create(data: {
    name: string
    label: string
    type: ProductField['type']
    required?: boolean
    options?: string[]
  }): Promise<ProductField> {
    const response = await api.post<ProductField>('/product-fields', data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la création du champ')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async update(id: string, data: Partial<ProductField>): Promise<ProductField> {
    const response = await api.put<ProductField>(`/product-fields/${id}`, data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la mise à jour du champ')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async remove(id: string): Promise<boolean> {
    const response = await api.delete<{ message: string }>(`/product-fields/${id}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la suppression du champ')
    }
    
    return true
  },

  async reorder(fields: Array<{ id: string, order: number }>): Promise<boolean> {
    const response = await api.post('/product-fields/reorder', { fields })
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la réorganisation des champs')
    }
    
    return true
  }
}

/**
 * Client API pour les catégories
 */
export const categoryApiClient = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories')
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des catégories')
    }
    
    return response.data || []
  },

  async getById(id: number): Promise<Category | null> {
    const response = await api.get<Category>(`/categories/${id}`)
    
    if (!response.success) {
      if (response.error?.includes('404')) {
        return null
      }
      throw new Error(response.error || 'Erreur lors de la récupération de la catégorie')
    }
    
    return response.data || null
  },

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<Category>('/categories', data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la création de la catégorie')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async update(id: number, data: Partial<CreateCategoryData>): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la mise à jour de la catégorie')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async remove(id: number): Promise<boolean> {
    const response = await api.delete<{ message: string }>(`/categories/${id}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la suppression de la catégorie')
    }
    
    return true
  }
}

/**
 * Client API pour les commandes
 */
export const orderApiClient = {
  async getAll(filter?: any): Promise<{ data: Order[], total: number }> {
    const params = filter ? {
      page: filter.page,
      limit: filter.limit,
      status: filter.status,
      userId: filter.userId
    } : undefined

    const response = await api.get<{ orders: Order[], total: number }>('/orders', { params })
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des commandes')
    }
    
    return {
      data: response.data?.orders || [],
      total: response.data?.total || 0
    }
  },

  async getById(id: number): Promise<Order | null> {
    const response = await api.get<Order>(`/orders/${id}`)
    
    if (!response.success) {
      if (response.error?.includes('404')) {
        return null
      }
      throw new Error(response.error || 'Erreur lors de la récupération de la commande')
    }
    
    return response.data || null
  },

  async create(data: CreateOrderData): Promise<Order> {
    const response = await api.post<Order>('/orders', data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la création de la commande')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async updateStatus(orderId: number, status: string): Promise<boolean> {
    const response = await api.patch<{ message: string }>(`/orders/${orderId}/status`, { status })
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la mise à jour du statut')
    }
    
    return true
  }
}

/**
 * Client API pour les utilisateurs
 */
export const userApiClient = {
  async getById(id: string): Promise<UserProfile | null> {
    const response = await api.get<UserProfile>(`/saas/users/${id}`)
    
    if (!response.success) {
      if (response.error?.includes('404')) {
        return null
      }
      throw new Error(response.error || 'Erreur lors de la récupération de l\'utilisateur')
    }
    
    return response.data || null
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put<UserProfile>(`/saas/users/${userId}`, updates)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la mise à jour de l\'utilisateur')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  },

  async createUser(userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const response = await api.post<UserProfile>('/saas/users', userData)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la création de l\'utilisateur')
    }
    
    if (!response.data) {
      throw new Error('Données de réponse manquantes')
    }
    
    return response.data
  }
}

/**
 * Client API pour l'authentification startup
 */
export const authApiClient = {
  async createOrGetProfile(data: {
    email: string
    first_name: string
    last_name: string
    company_name: string
    phone: string
  }): Promise<StartupUser | null> {
    const response = await api.post<StartupUser>('/startup/auth/profile', data)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la création du profil')
    }
    
    return response.data || null
  },

  async getProfile(): Promise<StartupUser | null> {
    const response = await api.get<StartupUser>('/startup/auth/profile')
    
    if (!response.success) {
      if (response.error?.includes('404')) {
        return null
      }
      throw new Error(response.error || 'Erreur lors de la récupération du profil')
    }
    
    return response.data || null
  },

  async updateProfile(updates: Partial<StartupUser>): Promise<StartupUser | null> {
    const response = await api.put<StartupUser>('/startup/auth/profile', updates)
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la mise à jour du profil')
    }
    
    return response.data || null
  }
}

/**
 * Client API pour les abonnements startup
 */
export const subscriptionApiClient = {
  async getActivePlans(): Promise<StartupSubscriptionPlan[]> {
    const response = await api.get<StartupSubscriptionPlan[]>('/startup/marketplace/plans')
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des plans')
    }
    
    return response.data || []
  }
}