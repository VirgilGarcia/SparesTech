import { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/context/AuthContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { useTenant } from '../../../shared/hooks/useTenant'
import { userProfileService } from '../../services/userProfileService'
import { errorHandler } from '../../../shared/utils/errorHandler'
import { Toast } from '../../../shared/components/ui/Toast'
import Header from '../../components/layout/Header'
import ProfileForm from '../../components/profile/ProfileForm'
import PasswordForm from '../../components/profile/PasswordForm'
import ProfileStats from '../../components/profile/ProfileStats'
import { 
  UserIcon, 
  KeyIcon
} from '@heroicons/react/24/outline'

import type { UserProfile } from '../../../shared/types/user'

function Profile() {
  const { user } = useAuth()
  const { theme } = useMarketplaceTheme()
  const { } = useTenant()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const validationErrors = {}
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Form state pour les infos personnelles
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France'
  })

  // Form state pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
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
          email: data.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
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
      
      await userProfileService.updateUserProfile(user!.id, {
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null
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
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setToast({ message: 'Les mots de passe ne correspondent pas', type: 'error' })
      return
    }

    if (passwordData.new_password.length < 6) {
      setToast({ message: 'Le mot de passe doit contenir au moins 6 caractères', type: 'error' })
      return
    }

    try {
      setChangingPassword(true)
      
      await userProfileService.changePassword(passwordData.new_password)

      setToast({ message: 'Mot de passe modifié avec succès !', type: 'success' })
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      const message = errorHandler.getErrorMessage(error)
      setToast({ message, type: 'error' })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleTogglePassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
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
            <div className="space-y-6">
              {/* Statistiques du profil */}
              {profile && (
                <ProfileStats
                  profile={profile}
                />
              )}

              {/* Onglet Informations personnelles */}
              {activeTab === 'profile' && (
                <ProfileForm
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSubmit={handleSaveProfile}
                  loading={saving}
                  validationErrors={validationErrors}
                  canEditEmail={false}
                  theme={theme}
                />
              )}

              {/* Onglet Mot de passe */}
              {activeTab === 'password' && (
                <PasswordForm
                  formData={passwordData}
                  onInputChange={handlePasswordChange}
                  onSubmit={handleChangePassword}
                  loading={changingPassword}
                  validationErrors={validationErrors}
                  showPasswords={showPasswords}
                  onTogglePassword={handleTogglePassword}
                  theme={theme}
                />
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