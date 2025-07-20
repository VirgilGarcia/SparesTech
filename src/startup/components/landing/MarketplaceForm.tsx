import React from 'react'
import { User, Building, Mail, Lock, Globe, Palette, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { MarketplaceCreationRequest } from '../../../shared/types/marketplace'

interface MarketplaceFormProps {
  formData: MarketplaceCreationRequest
  onInputChange: (field: keyof MarketplaceCreationRequest, value: string | boolean) => void
  onSubmit: (e: React.FormEvent) => void
  errors: string[]
  subdomainSuggestions: string[]
  checkingSubdomain: boolean
  checkingCompanyName: boolean
  checkingEmail: boolean
}

const MarketplaceForm: React.FC<MarketplaceFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  errors,
  subdomainSuggestions,
  checkingSubdomain,
  checkingCompanyName,
  checkingEmail
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Créez votre marketplace
        </h2>
        <p className="text-gray-600">
          Configurez votre plateforme e-commerce en quelques minutes
        </p>
      </div>

      {/* Messages d'erreur */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Informations de l'entreprise */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations de l'entreprise</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building className="inline w-4 h-4 mr-1" />
              Nom de l'entreprise *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => onInputChange('company_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mon Entreprise"
                required
              />
              {checkingCompanyName && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="inline w-4 h-4 mr-1" />
              Sous-domaine *
            </label>
            <div className="relative">
              <div className="flex">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => onInputChange('subdomain', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mon-entreprise"
                  required
                />
                <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                  .spartelio.com
                </div>
              </div>
              {checkingSubdomain && (
                <div className="absolute right-24 top-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            {subdomainSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Suggestions disponibles :</p>
                <div className="flex flex-wrap gap-2">
                  {subdomainSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onInputChange('subdomain', suggestion)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations administrateur */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Administrateur principal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline w-4 h-4 mr-1" />
                Prénom *
              </label>
              <input
                type="text"
                value={formData.admin_first_name}
                onChange={(e) => onInputChange('admin_first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline w-4 h-4 mr-1" />
                Nom *
              </label>
              <input
                type="text"
                value={formData.admin_last_name}
                onChange={(e) => onInputChange('admin_last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dupont"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline w-4 h-4 mr-1" />
              Email *
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.admin_email}
                onChange={(e) => onInputChange('admin_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jean@monentreprise.com"
                required
              />
              {checkingEmail && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Lock className="inline w-4 h-4 mr-1" />
              Mot de passe *
            </label>
            <input
              type="password"
              value={formData.admin_password}
              onChange={(e) => onInputChange('admin_password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              minLength={8}
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum 8 caractères
            </p>
          </div>
        </div>

        {/* Personnalisation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Personnalisation</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Palette className="inline w-4 h-4 mr-1" />
              Couleur principale
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
                    ? 'Votre marketplace sera accessible publiquement'
                    : 'Votre marketplace ne sera accessible qu\'aux utilisateurs connectés'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
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
        </div>

        {/* Bouton de soumission */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Créer ma marketplace
          </button>
        </div>
      </form>
    </div>
  )
}

export default MarketplaceForm