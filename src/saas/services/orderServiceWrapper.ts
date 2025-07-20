import { useOrderApi } from '../../hooks/api/useOrderApi'
import type {
  Order,
  OrderItem,
  CreateOrderData,
  UpdateOrderData,
  OrderFilter,
  OrderStats
} from '../../hooks/api/useOrderApi'

/**
 * Service wrapper pour la gestion des commandes
 * Route les appels critiques vers l'API backend pour éviter les problèmes RLS
 */

export const orderService = {
  
  /**
   * Récupère toutes les commandes avec filtres
   */
  getOrders: async (filter?: OrderFilter): Promise<{
    orders: Order[]
    totalCount: number
  }> => {
    try {
      const api = useOrderApi()
      const result = await api.getAll(filter)
      return {
        orders: result.data || [],
        totalCount: result.total || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return {
        orders: [],
        totalCount: 0
      }
    }
  },

  /**
   * Récupère une commande par ID
   */
  getOrderById: async (id: number): Promise<Order | null> => {
    try {
      const api = useOrderApi()
      return api.getById(id)
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error)
      return null
    }
  },

  /**
   * Récupère une commande par numéro
   */
  getOrderByNumber: async (orderNumber: string): Promise<Order | null> => {
    try {
      const api = useOrderApi()
      return api.getByOrderNumber(orderNumber)
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error)
      return null
    }
  },

  /**
   * Crée une nouvelle commande
   */
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const api = useOrderApi()
    const result = await api.create(data)
    if (!result) {
      throw new Error('Impossible de créer la commande')
    }
    return result
  },

  /**
   * Met à jour une commande
   */
  updateOrder: async (id: number, data: UpdateOrderData): Promise<Order> => {
    const api = useOrderApi()
    const result = await api.update(id, data)
    if (!result) {
      throw new Error('Impossible de mettre à jour la commande')
    }
    return result
  },

  /**
   * Supprime une commande
   */
  deleteOrder: async (id: number): Promise<boolean> => {
    try {
      const api = useOrderApi()
      return api.remove(id)
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error)
      return false
    }
  },

  /**
   * Met à jour le statut d'une commande
   */
  updateOrderStatus: async (id: number, status: string): Promise<Order | null> => {
    try {
      const api = useOrderApi()
      return api.updateStatus(id, status)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return null
    }
  },

  /**
   * Récupère les commandes d'un utilisateur
   */
  getUserOrders: async (userId: string, filter?: Omit<OrderFilter, 'user_id'>): Promise<Order[]> => {
    try {
      const api = useOrderApi()
      const result = await api.getByUser(userId, filter)
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes utilisateur:', error)
      return []
    }
  },

  /**
   * Recherche de commandes
   */
  searchOrders: async (query: string, filters?: Omit<OrderFilter, 'search'>): Promise<Order[]> => {
    try {
      const api = useOrderApi()
      const result = await api.search(query, filters)
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return []
    }
  },

  /**
   * Récupère les commandes par statut
   */
  getOrdersByStatus: async (status: string): Promise<Order[]> => {
    try {
      const api = useOrderApi()
      const result = await api.getByStatus(status)
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return []
    }
  },

  /**
   * Récupère les commandes d'une période
   */
  getOrdersByDateRange: async (startDate: string, endDate: string): Promise<Order[]> => {
    try {
      const api = useOrderApi()
      const result = await api.getByDateRange(startDate, endDate)
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return []
    }
  },

  /**
   * Récupère les statistiques des commandes
   */
  getOrderStats: async (startDate?: string, endDate?: string): Promise<OrderStats> => {
    try {
      const api = useOrderApi()
      return api.getStats(startDate, endDate)
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        statusBreakdown: {},
        monthlyRevenue: [],
        topCustomers: []
      }
    }
  },

  /**
   * Export des commandes
   */
  exportOrders: async (format: 'csv' | 'json' = 'csv', filter?: OrderFilter): Promise<Blob> => {
    const api = useOrderApi()
    return api.exportOrders(format, filter)
  },

  /**
   * Génère un PDF de commande
   */
  generateOrderPDF: async (orderId: number): Promise<Blob> => {
    const api = useOrderApi()
    return api.generatePDF(orderId)
  },

  /**
   * Envoie la commande par email
   */
  sendOrderByEmail: async (orderId: number, email?: string): Promise<boolean> => {
    try {
      const api = useOrderApi()
      return api.sendByEmail(orderId, email)
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error)
      return false
    }
  },

  /**
   * Calcule le total d'une commande avant création
   */
  calculateOrderTotal: async (items: Array<{
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
    const api = useOrderApi()
    return api.calculateTotal(items)
  },

  /**
   * Génère un numéro de commande unique
   */
  generateOrderNumber: async (): Promise<string> => {
    // Cette méthode sera gérée par l'API backend lors de la création
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const day = String(new Date().getDate()).padStart(2, '0')
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    
    return `${year}${month}${day}${randomNum}`
  },

  /**
   * Valide une commande avant création
   */
  validateOrder: async (orderData: CreateOrderData): Promise<{
    isValid: boolean
    errors: string[]
  }> => {
    const errors: string[] = []

    // Validation des données requises
    if (!orderData.customer_email) {
      errors.push('L\'email du client est requis')
    }

    if (!orderData.items || orderData.items.length === 0) {
      errors.push('Au moins un article est requis')
    }

    // Validation des articles
    if (orderData.items) {
      orderData.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`Article ${index + 1}: ID du produit requis`)
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Article ${index + 1}: Quantité invalide`)
        }
        if (!item.unit_price || item.unit_price <= 0) {
          errors.push(`Article ${index + 1}: Prix invalide`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Service pour la gestion des articles de commande (OrderItems)
 */
export const orderItemService = {
  
  /**
   * Ajoute un article à une commande
   */
  addItem: async (_orderId: number, _item: {
    product_id: number
    product_name: string
    product_reference: string
    quantity: number
    unit_price: number
  }): Promise<OrderItem> => {
    // Cette fonctionnalité serait implémentée dans l'API backend
    throw new Error('Fonctionnalité non encore implémentée dans l\'API')
  },

  /**
   * Met à jour un article de commande
   */
  updateItem: async (_itemId: number, _updates: {
    quantity?: number
    unit_price?: number
  }): Promise<OrderItem> => {
    // Cette fonctionnalité serait implémentée dans l'API backend
    throw new Error('Fonctionnalité non encore implémentée dans l\'API')
  },

  /**
   * Supprime un article de commande
   */
  removeItem: async (_itemId: number): Promise<boolean> => {
    // Cette fonctionnalité serait implémentée dans l'API backend
    throw new Error('Fonctionnalité non encore implémentée dans l\'API')
  }
}

// Export des types pour compatibilité
export type {
  Order,
  OrderItem,
  CreateOrderData,
  UpdateOrderData,
  OrderFilter,
  OrderStats
}