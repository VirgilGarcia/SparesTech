import React from 'react'
import { Lock } from 'lucide-react'

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface SecuritySectionProps {
  isChangingPassword: boolean
  passwordData: PasswordData
  loading: boolean
  onTogglePasswordChange: () => void
  onPasswordDataChange: (field: string, value: string) => void
  onPasswordSubmit: (e: React.FormEvent) => void
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  isChangingPassword,
  passwordData,
  loading,
  onTogglePasswordChange,
  onPasswordDataChange,
  onPasswordSubmit
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <Lock className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
      </div>
      
      {!isChangingPassword ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              ••••••••••••
            </div>
          </div>
          
          <button
            onClick={onTogglePasswordChange}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Changer le mot de passe
          </button>
        </div>
      ) : (
        <form onSubmit={onPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => onPasswordDataChange('currentPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => onPasswordDataChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => onPasswordDataChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Mise à jour...' : 'Confirmer'}
            </button>
            <button
              type="button"
              onClick={onTogglePasswordChange}
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

export default SecuritySection