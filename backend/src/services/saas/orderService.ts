import { query, transaction } from '../../lib/database'
import { Order, OrderItem, OrderStatus, ApiResponse, PaginatedResponse } from '../../types'
import logger from '../../lib/logger'

export class OrderService {
  /**
   * Créer une nouvelle commande
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
      product_reference: string
      product_name: string
      quantity: number
      unit_price: number
    }>
    notes?: string
  }): Promise<ApiResponse<Order>> {
    try {
      return await transaction(async (client) => {
        // Calculer les totaux
        const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        const taxRate = 0.20 // 20% TVA
        const taxAmount = subtotal * taxRate
        const totalAmount = subtotal + taxAmount

        // Générer un numéro de commande unique
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        // Créer la commande
        const orderResult = await client.query(
          `INSERT INTO orders (
            tenant_id, user_id, order_number, status, 
            customer_email, customer_first_name, customer_last_name, customer_company, customer_phone,
            customer_address, customer_city, customer_postal_code,
            subtotal, tax_amount, total_amount, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
          RETURNING *`,
          [
            tenantId,
            orderData.user_id || null,
            orderNumber,
            'draft',
            orderData.customer_email,
            orderData.customer_first_name || null,
            orderData.customer_last_name || null,
            orderData.customer_company || null,
            orderData.customer_phone || null,
            orderData.customer_address || null,
            orderData.customer_city || null,
            orderData.customer_postal_code || null,
            subtotal,
            taxAmount,
            totalAmount,
            orderData.notes || null
          ]
        )

        const order = orderResult.rows[0]

        // Créer les éléments de commande
        for (const item of orderData.items) {
          const totalPrice = item.quantity * item.unit_price
          
          await client.query(
            `INSERT INTO order_items (
              order_id, product_id, product_reference, product_name, quantity, unit_price, total_price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              order.id,
              item.product_id,
              item.product_reference,
              item.product_name,
              item.quantity,
              item.unit_price,
              totalPrice
            ]
          )

          // Mettre à jour le stock du produit
          await client.query(
            'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE tenant_id = $2 AND id = $3',
            [item.quantity, tenantId, item.product_id]
          )
        }

        logger.info('Nouvelle commande créée', {
          orderId: order.id,
          orderNumber: order.order_number,
          tenantId,
          totalAmount,
          itemsCount: orderData.items.length
        })

        return order
      })
    } catch (error: any) {
      logger.error('Erreur lors de la création de la commande', {
        error: error.message,
        tenantId,
        orderData
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de la commande'
      }
    }
  }

  /**
   * Récupérer une commande par ID avec ses éléments
   */
  static async getOrderById(tenantId: string, orderId: number): Promise<ApiResponse<Order & { items: OrderItem[] }>> {
    try {
      // Récupérer la commande
      const orderResult = await query(
        'SELECT * FROM orders WHERE tenant_id = $1 AND id = $2',
        [tenantId, orderId]
      )

      if (orderResult.rows.length === 0) {
        return {
          success: false,
          error: 'Commande non trouvée'
        }
      }

      const order = orderResult.rows[0]

      // Récupérer les éléments de la commande
      const itemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
        [orderId]
      )

      const orderWithItems = {
        ...order,
        items: itemsResult.rows
      }

      return {
        success: true,
        data: orderWithItems
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération de la commande', {
        error: error.message,
        tenantId,
        orderId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de la commande'
      }
    }
  }

  /**
   * Récupérer les commandes d'un tenant avec pagination et filtres
   */
  static async getOrdersByTenant(
    tenantId: string,
    pagination: { page?: number; limit?: number },
    filters?: {
      status?: OrderStatus
      customer_email?: string
      order_number?: string
      user_id?: string
      date_from?: string
      date_to?: string
    }
  ): Promise<PaginatedResponse<Order>> {
    try {
      const { page = 1, limit = 10 } = pagination
      const offset = (page - 1) * limit

      // Construire la clause WHERE
      const whereClauses = ['tenant_id = $1']
      const queryParams = [tenantId]
      let paramIndex = 2

      if (filters?.status) {
        whereClauses.push(`status = $${paramIndex}`)
        queryParams.push(filters.status)
        paramIndex++
      }

      if (filters?.customer_email) {
        whereClauses.push(`customer_email ILIKE $${paramIndex}`)
        queryParams.push(`%${filters.customer_email}%`)
        paramIndex++
      }

      if (filters?.order_number) {
        whereClauses.push(`order_number ILIKE $${paramIndex}`)
        queryParams.push(`%${filters.order_number}%`)
        paramIndex++
      }

      if (filters?.user_id) {
        whereClauses.push(`user_id = $${paramIndex}`)
        queryParams.push(filters.user_id)
        paramIndex++
      }

      if (filters?.date_from) {
        whereClauses.push(`created_at >= $${paramIndex}`)
        queryParams.push(filters.date_from)
        paramIndex++
      }

      if (filters?.date_to) {
        whereClauses.push(`created_at <= $${paramIndex}`)
        queryParams.push(filters.date_to)
        paramIndex++
      }

      const whereClause = whereClauses.join(' AND ')

      // Compter le total
      const countResult = await query(
        `SELECT COUNT(*) as total FROM orders WHERE ${whereClause}`,
        queryParams
      )
      const total = parseInt(countResult.rows[0].total)

      // Récupérer les commandes
      const ordersResult = await query(
        `SELECT * FROM orders WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      )

      const totalPages = Math.ceil(total / limit)

      return {
        success: true,
        data: ordersResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des commandes', {
        error: error.message,
        tenantId,
        pagination,
        filters
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des commandes',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  static async updateOrderStatus(tenantId: string, orderId: number, newStatus: OrderStatus): Promise<ApiResponse<Order>> {
    try {
      const result = await query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3 RETURNING *',
        [newStatus, tenantId, orderId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Commande non trouvée'
        }
      }

      logger.info('Statut commande mis à jour', {
        orderId,
        tenantId,
        newStatus
      })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du statut', {
        error: error.message,
        tenantId,
        orderId,
        newStatus
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du statut'
      }
    }
  }

  /**
   * Annuler une commande (remettre le stock)
   */
  static async cancelOrder(tenantId: string, orderId: number): Promise<ApiResponse<Order>> {
    try {
      return await transaction(async (client) => {
        // Vérifier que la commande existe et peut être annulée
        const orderResult = await client.query(
          'SELECT * FROM orders WHERE tenant_id = $1 AND id = $2',
          [tenantId, orderId]
        )

        if (orderResult.rows.length === 0) {
          throw new Error('Commande non trouvée')
        }

        const order = orderResult.rows[0]

        if (['delivered', 'cancelled'].includes(order.status)) {
          throw new Error('Cette commande ne peut plus être annulée')
        }

        // Récupérer les éléments pour remettre le stock
        const itemsResult = await client.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [orderId]
        )

        // Remettre le stock
        for (const item of itemsResult.rows) {
          await client.query(
            'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE tenant_id = $2 AND id = $3',
            [item.quantity, tenantId, item.product_id]
          )
        }

        // Mettre à jour le statut
        const updatedOrderResult = await client.query(
          'UPDATE orders SET status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3 RETURNING *',
          ['cancelled', tenantId, orderId]
        )

        logger.info('Commande annulée', {
          orderId,
          tenantId,
          itemsCount: itemsResult.rows.length
        })

        return updatedOrderResult.rows[0]
      })
    } catch (error: any) {
      logger.error('Erreur lors de l\'annulation de la commande', {
        error: error.message,
        tenantId,
        orderId
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'annulation de la commande'
      }
    }
  }

  /**
   * Calculer les statistiques des commandes pour un tenant
   */
  static async getOrderStats(tenantId: string, period?: { from?: string; to?: string }): Promise<ApiResponse<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    ordersByStatus: Record<string, number>
  }>> {
    try {
      let whereClause = 'tenant_id = $1'
      const queryParams = [tenantId]
      let paramIndex = 2

      if (period?.from) {
        whereClause += ` AND created_at >= $${paramIndex}`
        queryParams.push(period.from)
        paramIndex++
      }

      if (period?.to) {
        whereClause += ` AND created_at <= $${paramIndex}`
        queryParams.push(period.to)
        paramIndex++
      }

      // Statistiques générales
      const statsResult = await query(
        `SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as average_order_value
         FROM orders 
         WHERE ${whereClause}`,
        queryParams
      )

      // Commandes par statut
      const statusResult = await query(
        `SELECT status, COUNT(*) as count 
         FROM orders 
         WHERE ${whereClause} 
         GROUP BY status`,
        queryParams
      )

      const ordersByStatus: Record<string, number> = {}
      statusResult.rows.forEach(row => {
        ordersByStatus[row.status] = parseInt(row.count)
      })

      const stats = {
        totalOrders: parseInt(statsResult.rows[0].total_orders),
        totalRevenue: parseFloat(statsResult.rows[0].total_revenue),
        averageOrderValue: parseFloat(statsResult.rows[0].average_order_value),
        ordersByStatus
      }

      return {
        success: true,
        data: stats
      }
    } catch (error: any) {
      logger.error('Erreur lors du calcul des statistiques', {
        error: error.message,
        tenantId,
        period
      })
      return {
        success: false,
        error: 'Erreur lors du calcul des statistiques'
      }
    }
  }
}