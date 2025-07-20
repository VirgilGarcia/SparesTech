// Service wrapper pour la facturation startup
// TODO: Implémenter les hooks API correspondants quand nécessaire

export const billingService = {
  // Toutes les méthodes sont désactivées pour éviter les appels Supabase directs
  // TODO: Migrer vers des hooks API dédiés quand ce module sera prioritaire
  
  getInvoices: async () => {
    throw new Error('Service de facturation non encore migré vers l\'API - utiliser le backend directement')
  },

  getInvoiceById: async () => {
    throw new Error('Service de facturation non encore migré vers l\'API - utiliser le backend directement')
  },

  createInvoice: async () => {
    throw new Error('Service de facturation non encore migré vers l\'API - utiliser le backend directement')
  },

  // Autres méthodes... (à implémenter quand nécessaire)
}