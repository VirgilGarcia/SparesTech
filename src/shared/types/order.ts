// Types pour les commandes

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  product: {
    name: string
    reference: string
  }
}

export interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at: string
  customer_email: string
  customer_company?: string
  customer_phone?: string
  customer_address?: string
  customer_city?: string
  customer_postal_code?: string
  notes: string | null
  order_items: OrderItem[]
}