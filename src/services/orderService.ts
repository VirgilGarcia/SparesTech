import { supabase } from '../lib/supabase'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_reference: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: number
  user_id: string
  total_amount: number
  status: string
  customer_email: string
  customer_company: string
  billing_address?: any
  notes?: string
  created_at: string
  order_items?: OrderItem[]
}

export const orderService = {
  // Récupérer toutes les commandes
  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Récupérer une commande par ID
  async getOrderById(id: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Supprimer une commande
  async deleteOrder(id: number): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Créer une nouvelle commande
    async createOrder(orderData: {
    user_id: string
    total_amount: number
    customer_email: string
    customer_company: string
    items: {
        product_id: number
        product_name: string
        product_reference: string
        quantity: number
        unit_price: number
        total_price: number
    }[]
    }): Promise<Order> {
    // Créer la commande
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        customer_email: orderData.customer_email,
        customer_company: orderData.customer_company,
        status: 'pending'
        }])
        .select()
        .single()

    if (orderError) throw orderError

    // Créer les éléments de commande
    const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_reference: item.product_reference,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) throw itemsError

    return order
    }
}