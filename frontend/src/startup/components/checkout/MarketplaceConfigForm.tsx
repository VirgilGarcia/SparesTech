import React from 'react'
import { Globe, Lock, Loader2 } from 'lucide-react'

interface MarketplaceConfigFormProps {
  formData: {
    marketplace_name: string
    subdomain: string
    custom_domain: string
    public_access: boolean
    primary_color: string
  }
  hasCustomDomain: boolean
  customDomainAllowed: boolean
  subdomainSuggestions: string[]
  checkingSubdomain: boolean
  subdomainError: string | null
  onInputChange: (field: string, value: string | boolean) => void
  onToggleCustomDomain: () => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string | null
}

const MarketplaceConfigForm: React.FC<MarketplaceConfigFormProps> = ({
  formData,
  hasCustomDomain,
  customDomainAllowed,
  subdomainSuggestions,
  checkingSubdomain,
  subdomainError,
  onInputChange,
  onToggleCustomDomain,
  onSubmit,
  loading,
  error
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Configuration de votre marketplace
        </h2>
        <p className="text-gray-600">
          Personnalisez votre plateforme en quelques clics
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du marketplace *
          </label>
          <input
            type="text"
            value={formData.marketplace_name}
            onChange={(e) => onInputChange('marketplace_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mon Super Marketplace"
            required
          />
        </div>

        {/* Choix du domaine */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Adresse de votre marketplace *
            </label>
            {customDomainAllowed && (
              <button
                type="button"
                onClick={onToggleCustomDomain}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {hasCustomDomain ? 'Utiliser un sous-domaine' : 'Utiliser mon domaine'}
              </button>
            )}
          </div>

          {!hasCustomDomain ? (
            <div>
              <div className="relative">
                <div className="flex">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => onInputChange('subdomain', e.target.value)}
                    className={`flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      subdomainError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="mon-marketplace"
                    required
                  />
                  <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 flex items-center">
                    .spartelio.com
                  </div>
                </div>
                {checkingSubdomain && (
                  <div className="absolute right-28 top-3.5">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              
              {subdomainError && (
                <p className="mt-1 text-sm text-red-600">{subdomainError}</p>
              )}
              
              {subdomainSuggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Suggestions disponibles :</p>
                  <div className="flex flex-wrap gap-2">
                    {subdomainSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => onInputChange('subdomain', suggestion)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="mt-1 text-sm text-gray-500">
                Votre marketplace sera accessible à l'adresse: <strong>{formData.subdomain || 'votre-domaine'}.spartelio.com</strong>
              </p>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={formData.custom_domain}
                onChange={(e) => onInputChange('custom_domain', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="marketplace.monentreprise.com"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Vous devrez configurer votre DNS pour pointer vers nos serveurs après création.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur principale
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => onInputChange('primary_color', e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => onInputChange('primary_color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accès public
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => onInputChange('public_access', true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  formData.public_access 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public</span>
              </button>
              <button
                type="button"
                onClick={() => onInputChange('public_access', false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  !formData.public_access 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Privé</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !!subdomainError}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              loading || subdomainError
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Création en cours...' : 'Créer ma marketplace'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MarketplaceConfigForm