import { supabase } from '../lib/supabase'
import { generateOrderNumber } from '../utils/orderUtils'
import type { Order } from '../types/order'

export const userOrderService = {
  // Récupérer les commandes d'un utilisateur
  async getUserOrders(userId: string): Promise<Order[]> {
    // Récupérer les commandes de l'utilisateur
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    // Récupérer les items pour chaque commande
    const ordersWithItems = await Promise.all(
      (ordersData || []).map(async (order, index) => {
        // Récupérer les items de la commande
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        if (itemsError) {
          console.error('❌ Erreur items pour commande', order.id, ':', itemsError)
          return {
            ...order,
            order_number: order.order_number || generateOrderNumber(index),
            order_items: []
          }
        }

        // Récupérer les détails des produits
        const itemsWithProducts = await Promise.all(
          (itemsData || []).map(async (item) => {
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('name, reference')
              .eq('id', item.product_id)
              .single()

            if (productError) {
              console.error('❌ Erreur produit pour item', item.id, ':', productError)
              return {
                ...item,
                product: {
                  name: `Produit ID: ${item.product_id}`,
                  reference: 'REF-UNKNOWN'
                }
              }
            }

            return {
              ...item,
              product: productData
            }
          })
        )

        return {
          ...order,
          order_number: order.order_number || generateOrderNumber(index),
          order_items: itemsWithProducts
        }
      })
    )

    return ordersWithItems
  },

  // Récupérer une commande spécifique d'un utilisateur
  async getUserOrder(userId: string, orderId: string): Promise<Order | null> {
    // Récupérer la commande
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null // Commande non trouvée
      }
      throw orderError
    }

    // Récupérer les items de la commande
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.id)

    if (itemsError) {
      console.error('❌ Erreur items:', itemsError)
      throw itemsError
    }

    // Récupérer les détails des produits
    const itemsWithProducts = await Promise.all(
      (itemsData || []).map(async (item) => {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('name, reference')
          .eq('id', item.product_id)
          .single()

        if (productError) {
          console.error('❌ Erreur produit:', productError)
          return {
            ...item,
            product: {
              name: `Produit ID: ${item.product_id}`,
              reference: 'REF-UNKNOWN'
            }
          }
        }

        return {
          ...item,
          product: productData
        }
      })
    )

    return {
      ...orderData,
      order_items: itemsWithProducts
    }
  }
}