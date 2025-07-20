import { supabase } from '../../lib/supabase'

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
  type: 'card' | 'sepa' | 'paypal'
  is_default: boolean
  card_last4: string | null
  card_brand: string | null
  card_exp_month: number | null
  card_exp_year: number | null
  sepa_iban_last4: string | null
  provider_payment_method_id: string | null
  created_at: string
  updated_at: string
}

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
  country: string
  vat_number: string | null
  created_at: string
  updated_at: string
}

/**
 * Récupère toutes les factures d'un client
 */
export const getCustomerInvoices = async (customerId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des factures:', error)
    throw new Error('Impossible de récupérer les factures')
  }

  return data || []
}

/**
 * Récupère les lignes d'une facture
 */
export const getInvoiceLines = async (invoiceId: string): Promise<InvoiceLine[]> => {
  const { data, error } = await supabase
    .from('invoice_lines')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erreur lors de la récupération des lignes de facture:', error)
    throw new Error('Impossible de récupérer les détails de la facture')
  }

  return data || []
}

/**
 * Récupère les moyens de paiement d'un client
 */
export const getCustomerPaymentMethods = async (customerId: string): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des moyens de paiement:', error)
    throw new Error('Impossible de récupérer les moyens de paiement')
  }

  return data || []
}

/**
 * Récupère l'adresse de facturation d'un client
 */
export const getCustomerBillingAddress = async (customerId: string): Promise<BillingAddress | null> => {
  const { data, error } = await supabase
    .from('billing_addresses')
    .select('*')
    .eq('customer_id', customerId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Aucune adresse trouvée
      return null
    }
    console.error('Erreur lors de la récupération de l\'adresse de facturation:', error)
    throw new Error('Impossible de récupérer l\'adresse de facturation')
  }

  return data
}

/**
 * Génère une URL de téléchargement pour une facture PDF (placeholder)
 */
export const generateInvoicePdfUrl = async (invoiceId: string): Promise<string> => {
  // TODO: Implémenter la génération de PDF avec une solution comme jsPDF ou un service externe
  // Pour l'instant, retourner une URL placeholder
  return `/api/invoices/${invoiceId}/pdf`
}

/**
 * Marque une facture comme payée
 */
export const markInvoiceAsPaid = async (invoiceId: string): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .update({ 
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)

  if (error) {
    console.error('Erreur lors de la mise à jour du statut de la facture:', error)
    throw new Error('Impossible de mettre à jour le statut de la facture')
  }
}

/**
 * Crée une nouvelle facture pour un client
 */
export const createInvoice = async (
  customerId: string,
  subscriptionId: string | null,
  lines: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[]
): Promise<Invoice> => {
  // Calculer les montants
  const totalHT = lines.reduce((sum, line) => sum + line.total_price, 0)
  const taxRate = 20.0 // TVA française
  const taxAmount = totalHT * (taxRate / 100)
  const totalTTC = totalHT + taxAmount

  // Générer un numéro de facture
  const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
    .rpc('generate_invoice_number')

  if (invoiceNumberError) {
    console.error('Erreur lors de la génération du numéro de facture:', invoiceNumberError)
    throw new Error('Impossible de générer le numéro de facture')
  }

  // Créer la facture
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      customer_id: customerId,
      subscription_id: subscriptionId,
      invoice_number: invoiceNumberData,
      status: 'draft',
      amount_ht: totalHT,
      amount_ttc: totalTTC,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      currency: 'EUR',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 jours
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    console.error('Erreur lors de la création de la facture:', invoiceError)
    throw new Error('Impossible de créer la facture')
  }

  // Ajouter les lignes de facture
  const linesWithInvoiceId = lines.map(line => ({
    ...line,
    invoice_id: invoice.id
  }))

  const { error: linesError } = await supabase
    .from('invoice_lines')
    .insert(linesWithInvoiceId)

  if (linesError) {
    console.error('Erreur lors de la création des lignes de facture:', linesError)
    // Nettoyer la facture créée
    await supabase.from('invoices').delete().eq('id', invoice.id)
    throw new Error('Impossible de créer les lignes de facture')
  }

  return invoice
}