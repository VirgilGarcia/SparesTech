// Service wrapper pour migrer progressivement vers l'API backend
// ✅ CORRIGÉ - Utilise des API clients au lieu de hooks React
import { orderApiClient } from '../../lib/apiClients'
import type { Order, CreateOrderData } from '../../hooks/api/useOrderApi'

/**
 * Service de gestion des commandes avec fonctions critiques migrées
 */
export const orderService = {
  
  /**
   * Récupérer toutes les commandes (MIGRÉ vers API)
   */
  getAllOrders: async (filter?: any): Promise<{ orders: Order[], total: number }> => {
    try {
      const result = await orderApiClient.getAll(filter)
      return {
        orders: result.data,
        total: result.total
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return { orders: [], total: 0 }
    }
  },

  /**
   * Récupérer une commande par ID (MIGRÉ vers API)
   */
  getOrderById: async (id: number): Promise<Order | null> => {
    try {
      return await orderApiClient.getById(id)
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error)
      return null
    }
  },

  /**
   * Créer une nouvelle commande (MIGRÉ vers API)
   */
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const result = await orderApiClient.create(data)
    
    if (!result) {
      throw new Error('Erreur lors de la création de la commande')
    }
    
    return result
  },

  /**
   * Récupérer les commandes d'un utilisateur
   */
  getUserOrders: async (userId: string): Promise<Order[]> => {
    try {
      const result = await orderApiClient.getAll({ userId })
      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes utilisateur:', error)
      return []
    }
  },

  /**
   * Mettre à jour le statut d'une commande
   */
  updateOrderStatus: async (orderId: number, status: string): Promise<boolean> => {
    try {
      return await orderApiClient.updateStatus(orderId, status)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  }
}

// Types pour compatibilité
export interface OrderItem {
  id: number
  order_id: number
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  status?: string
  payment_status?: string
}

export interface OrderFilter {
  page?: number
  limit?: number
  status?: string
  userId?: string
}

export interface OrderStats {
  total: number
  pending: number
  completed: number
  cancelled: number
  totalRevenue: number
}

// Service pour les éléments de commande
export const orderItemService = {
  getOrderItems: async (orderId: number): Promise<OrderItem[]> => {
    try {
      const order = await orderApiClient.getById(orderId)
      return (order as any)?.order_items || []
    } catch (error) {
      console.error('Erreur lors de la récupération des éléments de commande:', error)
      return []
    }
  }
}

// Export des types pour compatibilité
export type { Order, CreateOrderData }