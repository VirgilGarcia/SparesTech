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
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

async function generateUniqueOrderNumber(): Promise<string> {
  let orderNumber = ''
  let exists = true
  
  while (exists) {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const day = String(new Date().getDate()).padStart(2, '0')
    
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    
    orderNumber = `CMD-${year}-${month}${day}-${randomNum}`
    
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single()
    
    exists = !!data
  }
  
  return orderNumber
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

  // Récupérer une commande par numéro de commande
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Créer une nouvelle commande (AVEC TOUS LES CHAMPS + NUMÉRO AUTO)
  async createOrder(orderData: {
    user_id: string
    total_amount: number
    customer_email: string
    customer_company?: string
    customer_phone?: string
    customer_address?: string
    customer_city?: string
    customer_postal_code?: string
    notes?: string
    items: {
      product_id: number
      product_name: string
      product_reference: string
      quantity: number
      unit_price: number
      total_price: number
    }[]
  }): Promise<Order> {
    
    // Générer un numéro de commande unique
    const orderNumber = await generateUniqueOrderNumber()
    
    // Créer la commande AVEC TOUS LES CHAMPS + NUMÉRO
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id,
        order_number: orderNumber,
        total_amount: orderData.total_amount,
        customer_email: orderData.customer_email,
        customer_company: orderData.customer_company,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        customer_city: orderData.customer_city,
        customer_postal_code: orderData.customer_postal_code,
        notes: orderData.notes,
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
  },

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
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

  // Rechercher des commandes par critères
  async searchOrders(criteria: {
    orderNumber?: string
    customerEmail?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)

    if (criteria.orderNumber) {
      query = query.ilike('order_number', `%${criteria.orderNumber}%`)
    }
    
    if (criteria.customerEmail) {
      query = query.ilike('customer_email', `%${criteria.customerEmail}%`)
    }
    
    if (criteria.status) {
      query = query.eq('status', criteria.status)
    }
    
    if (criteria.dateFrom) {
      query = query.gte('created_at', criteria.dateFrom)
    }
    
    if (criteria.dateTo) {
      query = query.lte('created_at', criteria.dateTo)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}