import React from 'react'
import { Building, Plus } from 'lucide-react'

interface Marketplace {
  id: string
  name: string
  url: string
  status: 'active' | 'pending'
  created_at: string
}

interface MarketplacesSectionProps {
  marketplaces: Marketplace[]
  onCreateMarketplace: () => void
}

const MarketplacesSection: React.FC<MarketplacesSectionProps> = ({
  marketplaces,
  onCreateMarketplace
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Building className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Mes marketplaces</h2>
      </div>
      
      {marketplaces.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas encore créé de marketplace
          </p>
          <button
            onClick={onCreateMarketplace}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Créer mon premier marketplace</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {marketplaces.map((marketplace, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{marketplace.name}</h3>
                  <p className="text-sm text-gray-600">{marketplace.url}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    marketplace.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {marketplace.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Gérer
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={onCreateMarketplace}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un nouveau marketplace</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default MarketplacesSection