// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du wrapper qui utilise l'API backend
import { orderService } from './orderServiceWrapper'
import type { Order } from '../../hooks/api/useOrderApi'

export const userOrderService = {
  // Récupérer les commandes d'un utilisateur (MIGRÉ vers API)
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return orderService.getUserOrders(userId)
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes utilisateur:', error)
      return []
    }
  },

  // Récupérer une commande spécifique d'un utilisateur (MIGRÉ vers API)
  async getUserOrder(userId: string, orderId: string): Promise<Order | null> {
    try {
      const order = await orderService.getOrderById(parseInt(orderId))
      
      // Vérifier que la commande appartient bien à l'utilisateur
      if (order && order.user_id === userId) {
        return order
      }
      
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande utilisateur:', error)
      return null
    }
  }
}