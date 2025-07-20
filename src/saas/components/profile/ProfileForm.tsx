import React from 'react'
import { Mail, Phone, MapPin, Building2, Globe } from 'lucide-react'

interface ProfileFormProps {
  formData: {
    email: string
    phone: string
    company_name: string
    address: string
    city: string
    postal_code: string
    country: string
  }
  onInputChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  validationErrors: { [key: string]: string }
  canEditEmail: boolean
  theme: any
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  loading,
  validationErrors,
  canEditEmail,
  theme
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
        <p className="text-sm text-gray-600 mt-1">
          Modifiez vos informations de profil
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.email ? 'border-red-300' : 'border-gray-300'
            } ${!canEditEmail ? 'bg-gray-50' : ''}`}
            placeholder="votre@email.com"
            required
            disabled={!canEditEmail}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
          {!canEditEmail && (
            <p className="mt-1 text-sm text-gray-500">
              L'email ne peut pas être modifié
            </p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="06 12 34 56 78"
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
          )}
        </div>

        {/* Nom de l'entreprise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline w-4 h-4 mr-1" />
            Nom de l'entreprise
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => onInputChange('company_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.company_name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Votre entreprise"
          />
          {validationErrors.company_name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.company_name}</p>
          )}
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Adresse
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="123 rue de la Paix"
          />
          {validationErrors.address && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
          )}
        </div>

        {/* Ville et Code postal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Ville
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Paris"
            />
            {validationErrors.city && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Code postal
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => onInputChange('postal_code', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.postal_code ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="75001"
            />
            {validationErrors.postal_code && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.postal_code}</p>
            )}
          </div>
        </div>

        {/* Pays */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="inline w-4 h-4 mr-1" />
            Pays
          </label>
          <select
            value={formData.country}
            onChange={(e) => onInputChange('country', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.country ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Canada">Canada</option>
            <option value="Luxembourg">Luxembourg</option>
          </select>
          {validationErrors.country && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.country}</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
            style={theme ? { backgroundColor: theme.primaryColor } : {}}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm