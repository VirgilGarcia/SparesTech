import React from 'react'
import { X, User, Mail, Shield, AlertCircle } from 'lucide-react'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  role: 'admin' | 'client'
  onEmailChange: (email: string) => void
  onRoleChange: (role: 'admin' | 'client') => void
  onSubmit: (e: React.FormEvent, email: string, role: string) => Promise<void>
  loading: boolean
  validationErrors: { [key: string]: string }
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  validationErrors,
}) => {
  // State for form fields - hooks must be at the top level
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState('client')

  if (!isOpen) return null

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Nouvel utilisateur</h3>
                <p className="text-sm text-gray-600">Ajouter un utilisateur à la marketplace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error messages */}
          {/* Error messages */}
          {validationErrors.email && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{validationErrors.email}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => onSubmit(e, email, role)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline w-4 h-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="utilisateur@exemple.com"
                required
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="inline w-4 h-4 mr-1" />
                Rôle *
              </label>
              <select
                value={role}
                onChange={handleRoleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="client">Client</option>
                <option value="admin">Administrateur</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {role === 'admin' 
                  ? 'Accès complet à l\'administration'
                  : 'Accès limité aux fonctionnalités client'
                }
              </p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start">
                <div className="w-5 h-5 text-blue-600 mr-2 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Information</p>
                  <p className="text-xs text-blue-700 mt-1">
                    L'utilisateur recevra un email avec un lien pour activer son compte et définir son mot de passe.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#4F46E5' }} // Assuming a default primary color or pass it as a prop
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateUserModal