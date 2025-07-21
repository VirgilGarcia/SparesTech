import React from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface PasswordFormProps {
  formData: {
    current_password: string
    new_password: string
    confirm_password: string
  }
  onInputChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  validationErrors: { [key: string]: string }
  showPasswords: {
    current: boolean
    new: boolean
    confirm: boolean
  }
  onTogglePassword: (field: 'current' | 'new' | 'confirm') => void
  theme: any
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  loading,
  validationErrors,
  showPasswords,
  onTogglePassword,
  theme
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h2>
        <p className="text-sm text-gray-600 mt-1">
          Modifiez votre mot de passe pour sécuriser votre compte
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* Mot de passe actuel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-1" />
            Mot de passe actuel *
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.current_password}
              onChange={(e) => onInputChange('current_password', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.current_password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Votre mot de passe actuel"
              required
            />
            <button
              type="button"
              onClick={() => onTogglePassword('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.current ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          {validationErrors.current_password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.current_password}</p>
          )}
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-1" />
            Nouveau mot de passe *
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.new_password}
              onChange={(e) => onInputChange('new_password', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.new_password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Votre nouveau mot de passe"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => onTogglePassword('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.new ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          {validationErrors.new_password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.new_password}</p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            <p>Le mot de passe doit contenir au minimum :</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>8 caractères</li>
              <li>Une lettre majuscule</li>
              <li>Une lettre minuscule</li>
              <li>Un chiffre</li>
              <li>Un caractère spécial</li>
            </ul>
          </div>
        </div>

        {/* Confirmer le mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-1" />
            Confirmer le nouveau mot de passe *
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={(e) => onInputChange('confirm_password', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.confirm_password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirmez votre nouveau mot de passe"
              required
            />
            <button
              type="button"
              onClick={() => onTogglePassword('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          {validationErrors.confirm_password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.confirm_password}</p>
          )}
        </div>

        {/* Information de sécurité */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-5 h-5 text-blue-600 mr-3 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Conseils de sécurité</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Utilisez un mot de passe unique pour ce compte</li>
                <li>• Évitez les informations personnelles facilement devinables</li>
                <li>• Changez régulièrement votre mot de passe</li>
                <li>• Ne partagez jamais votre mot de passe</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {loading ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PasswordForm