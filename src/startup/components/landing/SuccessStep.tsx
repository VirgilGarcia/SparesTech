import React from 'react'
import { CheckCircle, ExternalLink, ArrowRight } from 'lucide-react'
import type { TenantCreationResult } from '../../../shared/types/marketplace'

interface SuccessStepProps {
  result: TenantCreationResult
}

const SuccessStep: React.FC<SuccessStepProps> = ({ result }) => {
  const handleAccessMarketplace = () => {
    window.open(result.marketplace_url, '_blank')
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Félicitations !
        </h2>
        <p className="text-gray-600">
          Votre marketplace a été créée avec succès
        </p>
      </div>

      {/* Informations de la marketplace */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Détails de votre marketplace
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Entreprise:</span>
            <span className="text-sm text-gray-900">{result.company_name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tenant ID:</span>
            <span className="text-sm text-gray-900 font-mono">{result.tenant_id}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Administrateur:</span>
            <span className="text-sm text-gray-900">{result.admin_email}</span>
          </div>
          
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">URL:</span>
              <a
                href={result.marketplace_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                {result.marketplace_url}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Prochaines étapes
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">1</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">
                Connectez-vous à votre marketplace
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Utilisez vos identifiants administrateur pour accéder à votre plateforme
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">
                Configurez votre marketplace
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Ajoutez votre logo, configurez vos paramètres et personnalisez l'apparence
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">3</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">
                Ajoutez vos premiers produits
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Créez vos catégories et commencez à ajouter vos produits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton d'accès */}
      <div className="text-center">
        <button
          onClick={handleAccessMarketplace}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Accéder à ma marketplace
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>

      {/* Support */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Besoin d'aide pour configurer votre marketplace ?
          </p>
          <div className="mt-2 space-x-4">
            <a
              href="mailto:support@sparestech.fr"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Contacter le support
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="/docs"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessStep