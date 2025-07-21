// Types pour les commandes

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  product_name: string
  product_reference: string
  product_data: Record<string, unknown> | null
  created_at: string
  product?: {
    id: string
    name: string
    reference: string
    price: number
  }
}

export interface Order {
  id: string
  tenant_id: string
  user_id: string | null
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  total_amount: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  currency: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  payment_method: string | null
  payment_reference: string | null
  created_at: string
  updated_at: string
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  
  // Informations client
  customer_email: string
  customer_first_name: string | null
  customer_last_name: string | null
  customer_company: string | null
  customer_phone: string | null
  
  // Adresse de livraison
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_postal_code: string | null
  shipping_state: string | null
  shipping_country: string | null
  
  // Adresse de facturation
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_postal_code: string | null
  billing_state: string | null
  billing_country: string | null
  
  notes: string | null
  internal_notes: string | null
  tracking_number: string | null
  carrier: string | null
  
  order_items: OrderItem[]
}

export interface CreateOrderData {
  tenant_id: string
  user_id?: string
  customer_email: string
  customer_first_name?: string
  customer_last_name?: string
  customer_company?: string
  customer_phone?: string
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_postal_code?: string
  shipping_state?: string
  shipping_country?: string
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_postal_code?: string
  billing_state?: string
  billing_country?: string
  notes?: string
  items: CreateOrderItemData[]
}

export interface CreateOrderItemData {
  product_id: string
  quantity: number
  unit_price: number
  product_name: string
  product_reference: string
  product_data?: Record<string, unknown>
}

export interface UpdateOrderData {
  status?: Order['status']
  payment_status?: Order['payment_status']
  payment_method?: string
  payment_reference?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  customer_first_name?: string
  customer_last_name?: string
  customer_company?: string
  customer_phone?: string
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_postal_code?: string
  shipping_state?: string
  shipping_country?: string
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_postal_code?: string
  billing_state?: string
  billing_country?: string
  notes?: string
  internal_notes?: string
  tracking_number?: string
  carrier?: string
}

export interface OrderFilter {
  tenant_id?: string
  user_id?: string
  status?: Order['status']
  payment_status?: Order['payment_status']
  customer_email?: string
  start_date?: string
  end_date?: string
  search?: string
  limit?: number
  offset?: number
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  total_revenue: number
  average_order_value: number
  orders_by_status: Record<string, number>
  revenue_by_month: Array<{
    month: string
    revenue: number
    orders: number
  }>
}