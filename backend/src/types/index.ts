// Types partagés entre Startup et SaaS

// === Enums ===
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'unpaid'
export type BillingCycle = 'monthly' | 'yearly'
export type UserRole = 'admin' | 'manager' | 'employee' | 'client'
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethodType = 'card' | 'bank_transfer' | 'paypal'

// === Startup Types ===
export interface StartupUser {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StartupSubscriptionPlan {
  id: string
  name: string
  display_name: string
  description?: string
  price_monthly: number
  price_yearly?: number
  features: any[]
  limits: Record<string, any>
  custom_domain_allowed: boolean
  priority_support: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StartupSubscription {
  id: string
  customer_id: string
  plan_id: string
  tenant_id?: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  current_period_start?: string
  current_period_end?: string
  trial_end?: string
  cancelled_at?: string
  payment_method_id?: string
  created_at: string
  updated_at: string
}

// === SaaS/Tenant Types ===
export interface Tenant {
  id: string
  name: string
  subdomain?: string
  custom_domain?: string
  custom_domain_verified: boolean
  owner_id: string
  subscription_status: SubscriptionStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantSettings {
  id: string
  tenant_id: string
  company_name: string
  logo_url?: string
  primary_color: string
  show_prices: boolean
  show_stock: boolean
  show_categories: boolean
  public_access: boolean
  contact_email?: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  tenant_id: string
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  reference: string
  name: string
  description?: string
  price: number
  stock_quantity: number
  is_visible: boolean
  is_sellable: boolean
  featured_image_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  tenant_id: string
  name: string
  description?: string
  parent_id?: number
  level: number
  path: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  tenant_id: string
  user_id?: string
  order_number: string
  status: OrderStatus
  customer_email: string
  customer_first_name?: string
  customer_last_name?: string
  customer_company?: string
  customer_phone?: string
  customer_address?: string
  customer_city?: string
  customer_postal_code?: string
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id?: string
  product_reference: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

// === API Request/Response Types ===
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: string[]
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// === Marketplace Creation ===
export interface MarketplaceCreationRequest {
  company_name: string
  admin_first_name: string
  admin_last_name: string
  admin_email: string
  admin_password?: string
  subdomain: string
  custom_domain?: string
  public_access: boolean
  primary_color?: string
  plan_id: string
  billing_cycle: BillingCycle
}

export interface MarketplaceCreationResult {
  success: boolean
  tenant_id?: string
  subscription_id?: string
  marketplace_url?: string
  admin_login_url?: string
  error?: string
  errors?: string[]
}