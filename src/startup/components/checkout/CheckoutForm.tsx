import React from 'react'
import { User, Building, Phone, Mail, Globe } from 'lucide-react'

interface CheckoutFormData {
  email: string
  first_name: string
  last_name: string
  company_name: string
  phone: string
  desired_subdomain: string
  card_number: string
  expiry_date: string
  cvv: string
  cardholder_name: string
}

interface CheckoutFormProps {
  formData: CheckoutFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string | null
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  loading,
  error
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations de commande</h2>
          <p className="text-gray-600">Complétez vos informations pour créer votre marketplace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={onInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={onInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre nom"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre@email.com"
            />
          </div>

          {/* Informations entreprise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline w-4 h-4 mr-1" />
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom de votre entreprise"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              Téléphone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="01 23 45 67 89"
            />
          </div>

          {/* Sous-domaine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline w-4 h-4 mr-1" />
              Sous-domaine souhaité *
            </label>
            <div className="flex">
              <input
                type="text"
                name="desired_subdomain"
                value={formData.desired_subdomain}
                onChange={onInputChange}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="mon-entreprise"
                pattern="^[a-zA-Z0-9-]+$"
                title="Seuls les lettres, chiffres et tirets sont autorisés"
              />
              <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                .sparestech.fr
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Votre marketplace sera accessible sur https://{formData.desired_subdomain || 'mon-entreprise'}.sparestech.fr
            </p>
          </div>

          {/* Bouton suivant */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification...
                </div>
              ) : (
                'Continuer vers le paiement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutForm