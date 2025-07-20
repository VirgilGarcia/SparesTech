import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import Header from '../Header'
import Breadcrumb from '../Breadcrumb'

interface MarketplaceSuccessPageProps {
  marketplaceName: string
  marketplaceUrl: string
}

const MarketplaceSuccessPage: React.FC<MarketplaceSuccessPageProps> = ({
  marketplaceName,
  marketplaceUrl
}) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb 
            steps={[
              { label: 'Plan', status: 'completed' },
              { label: 'Configuration', status: 'completed' },
              { label: 'Création', status: 'completed' }
            ]}
          />
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Félicitations ! 🎉
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Votre marketplace <strong>{marketplaceName}</strong> est maintenant prêt.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accédez à votre marketplace</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Interface d'administration</p>
                    <p className="text-sm text-blue-700">Gérez vos produits, commandes et paramètres</p>
                  </div>
                  <button
                    onClick={() => window.open(marketplaceUrl, '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Accéder
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceSuccessPage