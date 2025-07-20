import React from 'react'
import { User, Edit } from 'lucide-react'

interface PersonalData {
  email: string
  first_name: string
  last_name: string
  phone: string
  company_name: string
  address: string
  city: string
  postal_code: string
  country: string
}

interface PersonalInfoSectionProps {
  personalData: PersonalData
  isEditing: boolean
  loading: boolean
  onToggleEdit: () => void
  onDataChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  personalData,
  isEditing,
  loading,
  onToggleEdit,
  onDataChange,
  onSubmit
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
        </div>
        <button
          onClick={onToggleEdit}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Edit className="w-4 h-4" />
          <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
        </button>
      </div>
      
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.email || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.first_name || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.last_name || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.phone || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.company_name || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.country}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.address || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.city || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {personalData.postal_code || 'Non défini'}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={personalData.email}
                onChange={(e) => onDataChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={personalData.first_name}
                onChange={(e) => onDataChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={personalData.last_name}
                onChange={(e) => onDataChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={personalData.phone}
                onChange={(e) => onDataChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <input
                type="text"
                value={personalData.company_name}
                onChange={(e) => onDataChange('company_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select
                value={personalData.country}
                onChange={(e) => onDataChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Suisse">Suisse</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                value={personalData.address}
                onChange={(e) => onDataChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 rue de la Paix"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={personalData.city}
                onChange={(e) => onDataChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <input
                type="text"
                value={personalData.postal_code}
                onChange={(e) => onDataChange('postal_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onToggleEdit}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PersonalInfoSection