import { supabase } from '../lib/supabase'
import { tenantService } from './tenantService'

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

// Fonction utilitaire pour obtenir le tenant de l'utilisateur courant
async function getCurrentTenantId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const tenant = await tenantService.getUserTenant(user.id)
  return tenant?.id || null
}

async function generateUniqueOrderNumber(tenantId: string): Promise<string> {
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
      .eq('tenant_id', tenantId)
      .single()
    
    exists = !!data
  }
  
  return orderNumber
}

export const orderService = {
  // Récupérer toutes les commandes
  async getAllOrders(tenantId?: string): Promise<Order[]> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('tenant_id', currentTenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Récupérer les commandes d'un utilisateur spécifique
  async getUserOrders(userId: string, tenantId?: string): Promise<Order[]> {
    try {
      const currentTenantId = tenantId || await getCurrentTenantId()
      if (!currentTenantId) {
        throw new Error('Tenant non trouvé')
      }

      // Récupérer les commandes de l'utilisateur
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Pour chaque commande, récupérer les items avec les produits
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
              order_number: order.order_number || `CMD-${String(index + 1).padStart(4, '0')}`,
              order_items: []
            }
          }

          // Pour chaque item, récupérer le produit correspondant
          const itemsWithProducts = await Promise.all(
            (itemsData || []).map(async (item) => {
              const { data: productData, error: productError } = await supabase
                .from('products')
                .select('name, reference')
                .eq('id', item.product_id)
                .eq('tenant_id', currentTenantId)
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
            order_number: order.order_number || `CMD-${String(index + 1).padStart(4, '0')}`,
            order_items: itemsWithProducts
          }
        })
      )

      return ordersWithItems
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes utilisateur:', error)
      throw error
    }
  },

  // Récupérer une commande par ID
  async getOrderById(id: number, tenantId?: string): Promise<Order | null> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .eq('tenant_id', currentTenantId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Récupérer une commande par numéro de commande
  async getOrderByNumber(orderNumber: string, tenantId?: string): Promise<Order | null> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .eq('tenant_id', currentTenantId)
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
  }, tenantId?: string): Promise<Order> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }
    
    // Générer un numéro de commande unique
    const orderNumber = await generateUniqueOrderNumber(currentTenantId)
    
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
        status: 'pending',
        tenant_id: currentTenantId
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
  }, tenantId?: string): Promise<Order[]> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('tenant_id', currentTenantId)

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
  },

  // Récupérer les commandes d'un utilisateur avec pagination
  async getUserOrdersPaginated(userId: string, page: number = 1, limit: number = 20, searchQuery: string = '', statusFilter: string = '', tenantId?: string) {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const offset = (page - 1) * limit
    
    // Construire la requête de base
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('tenant_id', currentTenantId)
    
    // Appliquer les filtres
    if (searchQuery) {
      query = query.or(`order_number.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`)
    }
    
    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }
    
    // Appliquer la pagination et le tri
    const { data: ordersData, error: ordersError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (ordersError) throw ordersError
    
    // Pour chaque commande, récupérer les items avec les produits
    const ordersWithItems = await Promise.all(
      (ordersData || []).map(async (order) => {
        // Récupérer les items de la commande
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
        
        if (itemsError) {
          console.error('Erreur lors du chargement des items:', itemsError)
          return { ...order, order_items: [] }
        }
        
        // Récupérer les détails des produits pour chaque item
        const itemsWithProducts = await Promise.all(
          (itemsData || []).map(async (item) => {
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('name, reference')
              .eq('id', item.product_id)
              .eq('tenant_id', currentTenantId)
              .single()
            
            if (productError) {
              console.error('Erreur lors du chargement du produit:', productError)
              return { ...item, product: null }
            }
            
            return { ...item, product: productData }
          })
        )
        
        return { ...order, order_items: itemsWithProducts }
      })
    )
    
    return {
      data: ordersWithItems,
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil((count || 0) / limit),
      hasPrevPage: page > 1
    }
  }
}