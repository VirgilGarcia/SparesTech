import React from 'react'
import { Check, ArrowRight } from 'lucide-react'

interface CheckoutSummaryProps {
  marketplaceUrl: string
  companyName: string
  onAccessMarketplace: () => void
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  marketplaceUrl,
  companyName,
  onAccessMarketplace
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Félicitations ! Votre marketplace est prête
          </h2>
          <p className="text-gray-600">
            Votre marketplace <strong>{companyName}</strong> a été créée avec succès
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Votre marketplace est accessible à l'adresse :
          </h3>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <a
              href={marketplaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium break-all"
            >
              {marketplaceUrl}
            </a>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Compte administrateur créé</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Marketplace configurée</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Prêt à ajouter vos premiers produits</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onAccessMarketplace}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Accéder à ma marketplace
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          
          <p className="text-sm text-gray-500">
            Un email de confirmation avec tous les détails vous a été envoyé
          </p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary