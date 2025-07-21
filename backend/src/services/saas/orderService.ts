import { supabaseServiceRole } from '../../lib/supabase'
import { Order, OrderItem, OrderStatus, ApiResponse, PaginatedResponse } from '../../types'
import logger from '../../lib/logger'

export class OrderService {
  /**
   * Créer une commande
   */
  static async createOrder(tenantId: string, orderData: {
    user_id?: string
    customer_email: string
    customer_first_name?: string
    customer_last_name?: string
    customer_company?: string
    customer_phone?: string
    customer_address?: string
    customer_city?: string
    customer_postal_code?: string
    items: Array<{
      product_id: string
      quantity: number
    }>
    notes?: string
  }): Promise<ApiResponse<Order & { items: OrderItem[] }>> {
    try {
      // Générer un numéro de commande unique
      const orderNumber = await this.generateOrderNumber(tenantId)

      // Calculer les totaux à partir des produits
      let subtotal = 0
      const orderItems: Array<{
        product_id: string
        product_reference: string
        product_name: string
        quantity: number
        unit_price: number
        total_price: number
      }> = []

      for (const item of orderData.items) {
        // Récupérer les infos du produit
        const { data: product, error: productError } = await supabaseServiceRole
          .from('products')
          .select('id, reference, name, price, stock_quantity')
          .eq('tenant_id', tenantId)
          .eq('id', item.product_id)
          .eq('is_sellable', true)
          .single()

        if (productError || !product) {
          return {
            success: false,
            error: `Produit non trouvé ou non vendable: ${item.product_id}`
          }
        }

        // Vérifier le stock
        if (product.stock_quantity < item.quantity) {
          return {
            success: false,
            error: `Stock insuffisant pour ${product.name} (disponible: ${product.stock_quantity})`
          }
        }

        const itemTotal = product.price * item.quantity
        subtotal += itemTotal

        orderItems.push({
          product_id: product.id,
          product_reference: product.reference,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: product.price,
          total_price: itemTotal
        })
      }

      // Calculer les taxes (20% pour la France)
      const taxRate = 0.20
      const taxAmount = subtotal * taxRate
      const totalAmount = subtotal + taxAmount

      // Créer la commande
      const { data: order, error: orderError } = await supabaseServiceRole
        .from('orders')
        .insert([{
          tenant_id: tenantId,
          user_id: orderData.user_id || null,
          order_number: orderNumber,
          status: 'pending' as OrderStatus,
          customer_email: orderData.customer_email.toLowerCase(),
          customer_first_name: orderData.customer_first_name || null,
          customer_last_name: orderData.customer_last_name || null,
          customer_company: orderData.customer_company || null,
          customer_phone: orderData.customer_phone || null,
          customer_address: orderData.customer_address || null,
          customer_city: orderData.customer_city || null,
          customer_postal_code: orderData.customer_postal_code || null,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          notes: orderData.notes || null
        }])
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // Créer les items de commande
      const { data: items, error: itemsError } = await supabaseServiceRole
        .from('order_items')
        .insert(
          orderItems.map(item => ({
            order_id: order.id,
            ...item
          }))
        )
        .select()

      if (itemsError) {
        throw itemsError
      }

      // Mettre à jour le stock des produits
      for (const item of orderData.items) {
        // Récupérer le stock actuel
        const { data: product } = await supabaseServiceRole
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()
        
        if (product) {
          const newStock = Math.max(0, product.stock_quantity - item.quantity)
          await supabaseServiceRole
            .from('products')
            .update({
              stock_quantity: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.product_id)
        }
      }

      logger.info('Commande créée', { 
        tenantId, 
        orderId: order.id, 
        orderNumber,
        totalAmount 
      })

      return {
        success: true,
        data: {
          ...order,
          items: items || []
        }
      }

    } catch (error: any) {
      logger.error('Erreur lors de la création de la commande', { 
        tenantId, 
        orderData, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la création de la commande'
      }
    }
  }

  /**
   * Récupérer les commandes d'un tenant
   */
  static async getOrders(
    tenantId: string,
    params: {
      status?: OrderStatus
      customer_email?: string
      page?: number
      limit?: number
      sort_by?: string
      sort_order?: 'asc' | 'desc'
    }
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      const {
        status,
        customer_email,
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params

      const offset = (page - 1) * limit

      let query = supabaseServiceRole
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)

      // Filtres
      if (status) {
        query = query.eq('status', status)
      }

      if (customer_email) {
        query = query.ilike('customer_email', `%${customer_email}%`)
      }

      // Tri et pagination
      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        success: true,
        data: {
          data: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération des commandes', { 
        tenantId, 
        params, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des commandes'
      }
    }
  }

  /**
   * Récupérer une commande par ID avec ses items
   */
  static async getOrderById(tenantId: string, orderId: number): Promise<ApiResponse<Order & { items: OrderItem[] }>> {
    try {
      const { data: order, error: orderError } = await supabaseServiceRole
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', orderId)
        .single()

      if (orderError) {
        if (orderError.code === 'PGRST116') {
          return {
            success: false,
            error: 'Commande non trouvée'
          }
        }
        throw orderError
      }

      const { data: items, error: itemsError } = await supabaseServiceRole
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('id')

      if (itemsError) {
        throw itemsError
      }

      return {
        success: true,
        data: {
          ...order,
          items: items || []
        }
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération de la commande', { 
        tenantId, 
        orderId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de la commande'
      }
    }
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  static async updateOrderStatus(
    tenantId: string, 
    orderId: number, 
    status: OrderStatus
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId)
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Statut de commande mis à jour', { tenantId, orderId, status })
      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du statut', { 
        tenantId, 
        orderId, 
        status, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du statut'
      }
    }
  }

  /**
   * Générer un numéro de commande unique
   */
  private static async generateOrderNumber(tenantId: string): Promise<string> {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    const prefix = `${year}${month}${day}`
    
    // Récupérer le dernier numéro du jour
    const { data: lastOrder } = await supabaseServiceRole
      .from('orders')
      .select('order_number')
      .eq('tenant_id', tenantId)
      .like('order_number', `${prefix}%`)
      .order('order_number', { ascending: false })
      .limit(1)
      .single()

    let sequence = 1
    if (lastOrder?.order_number) {
      const lastSequence = parseInt(lastOrder.order_number.slice(-4))
      sequence = lastSequence + 1
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`
  }
}