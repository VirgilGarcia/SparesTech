import React, { useState, useEffect } from 'react'
import { CreditCard, FileText, Download } from 'lucide-react'
import type { User } from '../../../types/auth'
import { billingService } from '../../services/billingService'
import type { Invoice } from '../../../shared/types/billing'

interface BillingSectionProps {
  user: User | null
  hasMarketplaces: boolean
  onUpgrade: () => void
  onSignOut: () => void
}

const BillingSection: React.FC<BillingSectionProps> = ({
  user,
  hasMarketplaces,
  onUpgrade,
  onSignOut
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [showInvoices, setShowInvoices] = useState(false)

  // Récupérer les factures réelles depuis la base de données
  useEffect(() => {
    const fetchInvoices = async () => {
      if (hasMarketplaces && user) {
        setLoading(true)
        try {
          const customerInvoices = await billingService.getInvoices()
          setInvoices(customerInvoices)
        } catch (error) {
          console.error('Erreur lors de la récupération des factures:', error)
          setInvoices([])
        } finally {
          setLoading(false)
        }
      }
    }

    fetchInvoices()
  }, [hasMarketplaces, user])

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const pdfUrl = await billingService.generatePdfUrl(invoiceId)
      // Ouvrir le PDF dans un nouvel onglet
      window.open(pdfUrl, '_blank')
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error)
    }
  }
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <CreditCard className="w-5 h-5 text-yellow-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Mon Compte</h2>
      </div>
      
      <div className="space-y-4">
        {!hasMarketplaces ? (
          /* Pas de marketplace = pas de plan */
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Aucun plan actif
            </p>
            <p className="text-xs text-gray-500">
              Créez votre premier marketplace pour activer un plan
            </p>
          </div>
        ) : (
          /* Avec marketplace = plan actif */
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">Plan Starter</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Actif</span>
            </div>
            <p className="text-sm text-blue-700">29€/mois - Prochain paiement le 15/02/2024</p>
          </div>
        )}
        
        {/* Statistiques utilisateur */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Marketplaces créées</span>
            <span className="text-gray-900 font-medium">{hasMarketplaces ? '1' : '0'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Membre depuis</span>
            <span className="text-gray-900 font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Facturation - Obligation légale */}
        {hasMarketplaces && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Facturation</h3>
              <button
                onClick={() => setShowInvoices(!showInvoices)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showInvoices ? 'Masquer' : 'Voir toutes'}
              </button>
            </div>
            
            {showInvoices && (
              <div className="space-y-2 mb-4">
                {loading ? (
                  <p className="text-gray-500 text-sm">Chargement...</p>
                ) : invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.invoice_number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'paid' ? 'Payée' : 
                           invoice.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.amount_ttc}€
                        </span>
                        <button 
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Télécharger la facture"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Aucune facture disponible</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          {!hasMarketplaces ? (
            <button 
              onClick={onUpgrade}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Créer ma marketplace
            </button>
          ) : (
            <button 
              onClick={onUpgrade}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Gérer mon plan
            </button>
          )}
          
          <button 
            onClick={onSignOut}
            className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  )
}

export default BillingSection