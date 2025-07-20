import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_reference: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Order {
  id: number
  user_id: string
  order_number: string
  total_amount: number
  customer_email: string
  customer_company?: string
  customer_phone?: string
  customer_address?: string
  customer_city?: string
  customer_postal_code?: string
  notes?: string
  status: string
  tenant_id?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface CreateOrderData {
  user_id: string
  customer_email: string
  customer_company?: string
  customer_phone?: string
  customer_address?: string
  customer_city?: string
  customer_postal_code?: string
  notes?: string
  items: Array<{
    product_id: number
    product_name: string
    product_reference: string
    quantity: number
    unit_price: number
  }>
}

export interface UpdateOrderData {
  customer_email?: string
  customer_company?: string
  customer_phone?: string
  customer_address?: string
  customer_city?: string
  customer_postal_code?: string
  notes?: string
  status?: string
}

export interface OrderFilter {
  user_id?: string
  status?: string
  customer_email?: string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  search?: string
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  statusBreakdown: Record<string, number>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
  topCustomers: Array<{
    email: string
    totalOrders: number
    totalRevenue: number
  }>
}

/**
 * Hook pour la gestion des commandes via l'API backend
 */
export const useOrderApi = () => {
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère toutes les commandes avec filtres
   */
  const getAll = useCallback(async (filter?: OrderFilter): Promise<{
    data: Order[]
    total: number
  }> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/orders', { params: filter })
      return {
        data: response.data || [],
        total: response.total || 0
      }
    } catch (err) {
      const errorMessage = 'Impossible de récupérer les commandes'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère une commande par ID
   */
  const getById = useCallback(async (id: number): Promise<Order | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer la commande'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Récupère une commande par numéro
   */
  const getByOrderNumber = useCallback(async (orderNumber: string): Promise<Order | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/orders/number/${orderNumber}`)
      return response.data || null
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null
      }
      const errorMessage = 'Impossible de récupérer la commande'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Crée une nouvelle commande
   */
  const create = useCallback(async (data: CreateOrderData): Promise<Order> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/orders', data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de créer la commande'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Met à jour une commande
   */
  const update = useCallback(async (id: number, data: UpdateOrderData): Promise<Order> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put(`/orders/${id}`, data)
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de mettre à jour la commande'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Supprime une commande
   */
  const remove = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/orders/${id}`)
      return true
    } catch (err) {
      const errorMessage = 'Impossible de supprimer la commande'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Met à jour le statut d'une commande
   */
  const updateStatus = useCallback(async (id: number, status: string): Promise<Order> => {
    return update(id, { status })
  }, [update])

  /**
   * Récupère les commandes d'un utilisateur
   */
  const getByUser = useCallback(async (userId: string, filter?: Omit<OrderFilter, 'user_id'>): Promise<{
    data: Order[]
    total: number
  }> => {
    return getAll({ ...filter, user_id: userId })
  }, [getAll])

  /**
   * Recherche de commandes
   */
  const search = useCallback(async (query: string, filters?: Omit<OrderFilter, 'search'>): Promise<{
    data: Order[]
    total: number
  }> => {
    return getAll({ ...filters, search: query })
  }, [getAll])

  /**
   * Récupère les commandes par statut
   */
  const getByStatus = useCallback(async (status: string, filter?: Omit<OrderFilter, 'status'>): Promise<{
    data: Order[]
    total: number
  }> => {
    return getAll({ ...filter, status })
  }, [getAll])

  /**
   * Récupère les commandes d'une période
   */
  const getByDateRange = useCallback(async (startDate: string, endDate: string, filter?: Omit<OrderFilter, 'start_date' | 'end_date'>): Promise<{
    data: Order[]
    total: number
  }> => {
    return getAll({ ...filter, start_date: startDate, end_date: endDate })
  }, [getAll])

  /**
   * Récupère les statistiques des commandes
   */
  const getStats = useCallback(async (startDate?: string, endDate?: string): Promise<OrderStats> => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const response = await api.get('/orders/stats', { params })
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
   * Export des commandes
   */
  const exportOrders = useCallback(async (format: 'csv' | 'json' = 'csv', filter?: OrderFilter): Promise<Blob> => {
    setLoading(true)
    setError(null)
    try {
      const params = { ...filter, format }
      const response = await api.get('/orders/export', {
        params,
        responseType: 'blob'
      })
      return response
    } catch (err) {
      const errorMessage = 'Impossible d\'exporter les commandes'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Génère un PDF de commande
   */
  const generatePDF = useCallback(async (orderId: number): Promise<Blob> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/orders/${orderId}/pdf`, {
        responseType: 'blob'
      })
      return response
    } catch (err) {
      const errorMessage = 'Impossible de générer le PDF'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Envoie la commande par email
   */
  const sendByEmail = useCallback(async (orderId: number, email?: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const data = email ? { email } : {}
      await api.post(`/orders/${orderId}/send-email`, data)
      return true
    } catch (err) {
      const errorMessage = 'Impossible d\'envoyer l\'email'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [api])

  /**
   * Calcule le total d'une commande avant création
   */
  const calculateTotal = useCallback(async (items: Array<{
    product_id: number
    quantity: number
  }>): Promise<{
    total: number
    items: Array<{
      product_id: number
      product_name: string
      product_reference: string
      quantity: number
      unit_price: number
      total_price: number
    }>
  }> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/orders/calculate', { items })
      return response.data
    } catch (err) {
      const errorMessage = 'Impossible de calculer le total'
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
    getByOrderNumber,
    create,
    update,
    remove,

    // Méthodes spécifiques
    updateStatus,
    getByUser,
    search,
    getByStatus,
    getByDateRange,

    // Statistiques et reporting
    getStats,
    exportOrders,
    generatePDF,
    sendByEmail,

    // Utilitaires
    calculateTotal
  }
}