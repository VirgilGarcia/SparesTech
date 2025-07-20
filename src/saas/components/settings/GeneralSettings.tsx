import React from 'react'
import { Building, Globe, Palette, Eye, EyeOff } from 'lucide-react'

interface GeneralSettingsProps {
  formData: {
    public_access: boolean
    company_name: string
    primary_color: string
    subdomain: string
    custom_domain: string
  }
  onInputChange: (field: string, value: string | boolean) => void
  autoSaving: boolean
  saveMessage: { type: 'success' | 'error', text: string } | null
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  formData,
  onInputChange,
  autoSaving,
  saveMessage,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Paramètres généraux</h3>
        <p className="text-sm text-gray-600">
          Configurez les informations de base de votre marketplace
        </p>
      </div>

      {/* Message de sauvegarde */}
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-5 h-5 mr-3 ${
              saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {saveMessage.type === 'success' ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className={`text-sm ${
              saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {saveMessage.text}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Nom de l'entreprise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="inline w-4 h-4 mr-1" />
            Nom de l'entreprise
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => onInputChange('company_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom de votre entreprise"
          />
        </div>

        {/* Couleur primaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette className="inline w-4 h-4 mr-1" />
            Couleur primaire
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.primary_color}
              onChange={(e) => onInputChange('primary_color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={formData.primary_color}
              onChange={(e) => onInputChange('primary_color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#10b981"
            />
          </div>
        </div>

        {/* Sous-domaine */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="inline w-4 h-4 mr-1" />
            Sous-domaine
          </label>
          <div className="flex">
            <input
              type="text"
              value={formData.subdomain}
              onChange={(e) => onInputChange('subdomain', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="mon-entreprise"
            />
            <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
              .spartelio.com
            </div>
          </div>
        </div>

        {/* Domaine personnalisé */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="inline w-4 h-4 mr-1" />
            Domaine personnalisé (optionnel)
          </label>
          <input
            type="text"
            value={formData.custom_domain}
            onChange={(e) => onInputChange('custom_domain', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="www.monsite.com"
          />
          <p className="text-sm text-gray-500 mt-1">
            Contactez le support pour configurer votre domaine personnalisé
          </p>
        </div>

        {/* Accès public */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {formData.public_access ? (
              <Eye className="w-5 h-5 text-green-600 mr-3" />
            ) : (
              <EyeOff className="w-5 h-5 text-red-600 mr-3" />
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Accès public
              </h4>
              <p className="text-sm text-gray-600">
                {formData.public_access 
                  ? 'Votre marketplace est accessible publiquement'
                  : 'Votre marketplace n\'est accessible qu\'aux utilisateurs connectés'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => onInputChange('public_access', !formData.public_access)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              formData.public_access ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.public_access ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Indicateur de sauvegarde */}
        {autoSaving && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Sauvegarde en cours...
          </div>
        )}
      </div>
    </div>
  )
}

export default GeneralSettings