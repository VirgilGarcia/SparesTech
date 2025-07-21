// Types pour la facturation et les paiements

export interface BillingAddress {
  id: string
  customer_id: string
  company_name: string | null
  first_name: string
  last_name: string
  address_line1: string
  address_line2: string | null
  city: string
  postal_code: string
  state: string | null
  country: string
  vat_number: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  customer_id: string
  subscription_id: string | null
  invoice_number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  amount_ht: number
  amount_ttc: number
  tax_rate: number
  tax_amount: number
  currency: string
  due_date: string
  paid_at: string | null
  billing_address: BillingAddress | null
  created_at: string
  updated_at: string
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  period_start: string | null
  period_end: string | null
  created_at: string
}

export interface PaymentMethod {
  id: string
  customer_id: string
  type: 'card' | 'sepa' | 'paypal' | 'bank_transfer'
  is_default: boolean
  is_active: boolean
  card_last4: string | null
  card_brand: string | null
  card_exp_month: number | null
  card_exp_year: number | null
  sepa_iban_last4: string | null
  paypal_email: string | null
  provider_payment_method_id: string | null
  provider_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  customer_id: string
  subscription_id: string | null
  invoice_id: string | null
  payment_method_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded'
  payment_method: string
  transaction_id: string | null
  provider_transaction_id: string | null
  provider_fee: number | null
  payment_data: Record<string, unknown> | null
  error_message: string | null
  processed_at: string | null
  refunded_at: string | null
  refund_amount: number | null
  created_at: string
  updated_at: string
}

export interface CreateInvoiceData {
  customer_id: string
  subscription_id?: string
  lines: CreateInvoiceLineData[]
  due_date?: string
  billing_address_id?: string
}

export interface CreateInvoiceLineData {
  description: string
  quantity: number
  unit_price: number
  period_start?: string
  period_end?: string
}

export interface UpdateInvoiceData {
  status?: Invoice['status']
  due_date?: string
  billing_address_id?: string
}

export interface CreatePaymentMethodData {
  customer_id: string
  type: PaymentMethod['type']
  is_default?: boolean
  card_last4?: string
  card_brand?: string
  card_exp_month?: number
  card_exp_year?: number
  sepa_iban_last4?: string
  paypal_email?: string
  provider_payment_method_id?: string
  provider_customer_id?: string
}

export interface UpdatePaymentMethodData {
  is_default?: boolean
  is_active?: boolean
  card_exp_month?: number
  card_exp_year?: number
}

export interface CreatePaymentTransactionData {
  customer_id: string
  subscription_id?: string
  invoice_id?: string
  payment_method_id?: string
  amount: number
  currency?: string
  payment_method: string
  transaction_id?: string
  provider_transaction_id?: string
  payment_data?: Record<string, unknown>
}

export interface UpdatePaymentTransactionData {
  status?: PaymentTransaction['status']
  transaction_id?: string
  provider_transaction_id?: string
  provider_fee?: number
  payment_data?: Record<string, unknown>
  error_message?: string
  processed_at?: string
  refunded_at?: string
  refund_amount?: number
}

export interface CreateBillingAddressData {
  customer_id: string
  company_name?: string
  first_name: string
  last_name: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  state?: string
  country: string
  vat_number?: string
  is_default?: boolean
}

export interface UpdateBillingAddressData {
  company_name?: string
  first_name?: string
  last_name?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  state?: string
  country?: string
  vat_number?: string
  is_default?: boolean
}

export interface InvoiceFilter {
  customer_id?: string
  subscription_id?: string
  status?: Invoice['status']
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface PaymentTransactionFilter {
  customer_id?: string
  subscription_id?: string
  invoice_id?: string
  payment_method_id?: string
  status?: PaymentTransaction['status']
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface BillingStats {
  total_revenue: number
  monthly_revenue: number
  pending_invoices: number
  overdue_invoices: number
  successful_transactions: number
  failed_transactions: number
  average_transaction_amount: number
  revenue_by_month: Array<{
    month: string
    revenue: number
    transactions: number
  }>
}