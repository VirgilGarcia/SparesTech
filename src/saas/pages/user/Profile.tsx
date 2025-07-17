import { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/context/AuthContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { userProfileService } from '../../services/userProfileService'
import { errorHandler } from '../../../shared/utils/errorHandler'
import { Toast } from '../../../shared/components/ui/Toast'
import Header from '../../components/layout/Header'
import { 
  UserIcon, 
  KeyIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

import type { UserProfile } from '../../services/userProfileService'

function Profile() {
  const { user } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  // Form state pour les infos personnelles
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France'
  })

  // Form state pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await userProfileService.getProfile(user!.id)

      if (data) {
        setProfile(data)
        setFormData({
          company_name: data.company_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || '',
          country: data.country || 'France'
        })
      }
    } catch (error) {
      const message = errorHandler.getErrorMessage(error)
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      await userProfileService.updateProfile(user!.id, {
        company_name: formData.company_name || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || 'France'
      })

      setToast({ message: 'Profil mis à jour avec succès !', type: 'success' })
      await loadProfile()
    } catch (error) {
      const message = errorHandler.getErrorMessage(error)
      setToast({ message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'Les mots de passe ne correspondent pas', type: 'error' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setToast({ message: 'Le mot de passe doit contenir au moins 6 caractères', type: 'error' })
      return
    }

    try {
      setChangingPassword(true)
      
      await userProfileService.changePassword(passwordData.newPassword)

      setToast({ message: 'Mot de passe modifié avec succès !', type: 'success' })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      const message = errorHandler.getErrorMessage(error)
      setToast({ message, type: 'error' })
    } finally {
      setChangingPassword(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Mon Compte</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et paramètres</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              
              {/* Profile Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{profile?.email}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {profile?.role === 'admin' ? (
                        <>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-sm text-yellow-600 font-medium">Administrateur</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-sm text-blue-600 font-medium">Client</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    backgroundColor: activeTab === 'profile' ? theme.primaryColor : 'transparent'
                  }}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Informations personnelles</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === 'password'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    backgroundColor: activeTab === 'password' ? theme.primaryColor : 'transparent'
                  }}
                >
                  <KeyIcon className="h-5 w-5" />
                  <span>Mot de passe</span>
                </button>
              </nav>

              {/* Infos du compte */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Membre depuis</span>
                    <span className="text-sm text-gray-700 font-medium">
                      {profile?.created_at ? formatDate(profile.created_at).split(' ')[0] : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Type de compte</span>
                    <span className="text-sm text-gray-700 font-medium capitalize">{profile?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-100">
              
              {/* Onglet Informations personnelles */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.primaryColor}15` }}>
                        <UserIcon className="h-5 w-5" style={{ color: theme.primaryColor }} />
                      </div>
                      <h2 className="text-xl font-medium text-gray-900">Informations personnelles</h2>
                    </div>
                    <p className="text-gray-600">Mettez à jour vos informations de contact et d'adresse</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    
                    {/* Informations de base */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                        <h3 className="font-medium text-gray-900">Informations de base</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom de l'entreprise
                          </label>
                          <input
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                            style={{ 
                              borderColor: theme.primaryColor + '40'
                            }}
                            placeholder="Nom de votre entreprise"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                            style={{ 
                              borderColor: theme.primaryColor + '40'
                            }}
                            placeholder="01 23 45 67 89"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Adresse */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                        <h3 className="font-medium text-gray-900">Adresse de livraison</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse
                          </label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                            style={{ 
                              borderColor: theme.primaryColor + '40'
                            }}
                            placeholder="123 rue de la Paix, Bâtiment A, Appartement 4B"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ville
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                              style={{ 
                                borderColor: theme.primaryColor + '40'
                              }}
                              placeholder="Paris"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Code postal
                            </label>
                            <input
                              type="text"
                              value={formData.postal_code}
                              onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                              style={{ 
                                borderColor: theme.primaryColor + '40'
                              }}
                              placeholder="75001"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pays
                            </label>
                            <select
                              value={formData.country}
                              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                              style={{ 
                                borderColor: theme.primaryColor + '40'
                              }}
                            >
                              <option value="France">France</option>
                              <option value="Belgique">Belgique</option>
                              <option value="Suisse">Suisse</option>
                              <option value="Canada">Canada</option>
                              <option value="Autre">Autre</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bouton de sauvegarde */}
                    <div className="flex justify-end pt-6 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Sauvegarde...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Sauvegarder les modifications</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Onglet Mot de passe */}
              {activeTab === 'password' && (
                <div className="p-6">
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <KeyIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <h2 className="text-xl font-medium text-gray-900">Changer le mot de passe</h2>
                    </div>
                    <p className="text-gray-600">Assurez-vous d'utiliser un mot de passe sécurisé</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                        style={{ 
                          borderColor: theme.primaryColor + '40'
                        }}
                        placeholder="Nouveau mot de passe"
                        minLength={6}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                        style={{ 
                          borderColor: theme.primaryColor + '40'
                        }}
                        placeholder="Confirmer le mot de passe"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-800 font-medium mb-2">Conseils pour un mot de passe sécurisé :</p>
                          <ul className="text-yellow-700 text-sm space-y-1">
                            <li className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                              <span>Au moins 8 caractères</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                              <span>Mélange de lettres majuscules et minuscules</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                              <span>Inclure des chiffres et des symboles</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="flex items-center space-x-2 px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {changingPassword ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Modification...</span>
                          </>
                        ) : (
                          <>
                            <KeyIcon className="h-5 w-5" />
                            <span>Changer le mot de passe</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Profile