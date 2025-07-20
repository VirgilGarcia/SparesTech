import React from 'react'
import Header from '../Header'
import Breadcrumb from '../Breadcrumb'

const MarketplaceCreatingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb 
            steps={[
              { label: 'Plan', status: 'completed' },
              { label: 'Configuration', status: 'completed' },
              { label: 'Création', status: 'current' }
            ]}
          />
          
          <div className="text-center mt-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Création en cours...</h2>
            <p className="text-gray-600">
              Nous mettons en place votre marketplace, cela prend quelques instants.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceCreatingPage