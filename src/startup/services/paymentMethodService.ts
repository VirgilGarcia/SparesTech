// ✅ SERVICE MÉTHODES DE PAIEMENT - MIGRATION DIFFÉRÉE
// Ce service est désactivé pour éviter les appels Supabase directs
// TODO: Migrer vers l'API backend quand ce module sera prioritaire

// Re-export des types pour compatibilité
export type {
  PaymentMethod,
  CreatePaymentMethodData,
  UpdatePaymentMethodData
} from '../../shared/types/billing'

export const paymentMethodService = {
  // Toutes les méthodes sont désactivées pour éviter les appels Supabase directs
  
  getCustomerPaymentMethods: async (): Promise<any[]> => {
    throw new Error('Service méthodes de paiement non encore migré vers l\'API - utiliser le backend directement')
  },

  getPaymentMethodById: async (): Promise<any> => {
    throw new Error('Service méthodes de paiement non encore migré vers l\'API - utiliser le backend directement')
  },

  createPaymentMethod: async (): Promise<any> => {
    throw new Error('Service méthodes de paiement non encore migré vers l\'API - utiliser le backend directement')
  },

  updatePaymentMethod: async (): Promise<any> => {
    throw new Error('Service méthodes de paiement non encore migré vers l\'API - utiliser le backend directement')
  },

  deletePaymentMethod: async (): Promise<boolean> => {
    throw new Error('Service méthodes de paiement non encore migré vers l\'API - utiliser le backend directement')
  }
}