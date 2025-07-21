// Service wrapper pour la facturation startup
// TODO: Implémenter les hooks API correspondants quand nécessaire

export const billingService = {
  // Toutes les méthodes sont désactivées pour éviter les appels Supabase directs
  // TODO: Migrer vers des hooks API dédiés quand ce module sera prioritaire
  
  getInvoices: async () => {
    console.warn('Service de facturation non encore migré vers l\'API - retour de données vides')
    return []
  },

  getInvoiceById: async (_id: string) => {
    console.warn('Service de facturation non encore migré vers l\'API - retour de données vides')
    return null
  },

  createInvoice: async (_data: any) => {
    throw new Error('Service de facturation non encore migré vers l\'API - utiliser le backend directement')
  },

  generatePdfUrl: async (_invoiceId: string) => {
    console.warn('Service de facturation non encore migré vers l\'API - génération PDF non disponible')
    throw new Error('Génération de factures PDF non encore disponible - service en migration')
  }
}