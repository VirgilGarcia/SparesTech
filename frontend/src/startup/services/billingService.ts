// ✅ SERVICE DE FACTURATION - MIGRATION PARTIELLE
// Les fonctions critiques sont désactivées pour éviter les appels Supabase directs
// TODO: Compléter la migration quand ce module sera prioritaire

// Réexport du wrapper qui désactive les appels Supabase directs
export { billingService } from './billingServiceWrapper'

// Re-export des types pour compatibilité
export type { 
  Invoice, 
  InvoiceLine, 
  PaymentTransaction,
  BillingAddress,
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceFilter,
  PaymentTransactionFilter,
  BillingStats,
  CreatePaymentTransactionData,
  UpdatePaymentTransactionData,
  CreateBillingAddressData,
  UpdateBillingAddressData
} from '../../shared/types/billing'