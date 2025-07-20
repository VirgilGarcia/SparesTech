import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

interface Theme {
  primaryColor: string
  companyName: string
  logoUrl: string | null
}

interface ProductAccessDeniedProps {
  theme: Theme
}

const ProductAccessDenied: React.FC<ProductAccessDeniedProps> = ({ theme }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Vous devez être administrateur pour accéder à cette page.
          </p>
          <div className="space-y-3">
            <Link 
              to="/admin"
              className="block w-full text-white px-6 py-3 rounded-xl hover:opacity-90 transition-colors text-center font-medium"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductAccessDenied