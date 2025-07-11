import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'

interface UserProfile {
  id: string
  email: string
  company_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  role: string
  created_at: string
}

function Profile() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      setProfile(data)
      setFormData({
        company_name: data.company_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        country: data.country || 'France'
      })
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setError('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')

      const { error } = await supabase
        .from('user_profiles')
        .update({
          company_name: formData.company_name || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          country: formData.country || 'France',
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id)

      if (error) throw error

      setSuccess('Profil mis à jour avec succès !')
      loadProfile() // Recharger les données
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setChangingPassword(true)
      setError('')

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccess('Mot de passe modifié avec succès !')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error)
      setError(error.message || 'Erreur lors du changement de mot de passe')
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Chargement du profil...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mon Compte</h1>
          <p className="text-sm text-gray-600">Gérez vos informations personnelles et paramètres</p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">✅ {success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">❌ {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              
              {/* Profile Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile?.email}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {profile?.role === 'admin' ? '👑 Administrateur' : '👤 Client'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    backgroundColor: activeTab === 'profile' ? theme.primaryColor : 'transparent'
                  }}
                >
                  📋 Informations personnelles
                </button>
                
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    activeTab === 'password'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    backgroundColor: activeTab === 'password' ? theme.primaryColor : 'transparent'
                  }}
                >
                  🔒 Mot de passe
                </button>
              </nav>

              {/* Infos du compte */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Membre depuis</span>
                    <span className="text-gray-700">
                      {profile?.created_at ? formatDate(profile.created_at).split(' ')[0] : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Type de compte</span>
                    <span className="text-gray-700 capitalize">{profile?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
              
              {/* Onglet Informations personnelles */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Informations personnelles</h2>
                    <p className="text-sm text-gray-600">Mettez à jour vos informations de contact et d'adresse</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    
                    {/* Informations de base */}
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-4">Informations de base</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                            placeholder="01 23 45 67 89"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Adresse */}
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-4">Adresse de livraison</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse
                          </label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Onglet Mot de passe */}
              {activeTab === 'password' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Changer le mot de passe</h2>
                    <p className="text-sm text-gray-600">Assurez-vous d'utiliser un mot de passe sécurisé</p>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Confirmer le mot de passe"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <p className="text-yellow-800 text-xs font-medium">Conseils pour un mot de passe sécurisé :</p>
                          <ul className="text-yellow-700 text-xs mt-1 list-disc list-inside">
                            <li>Au moins 8 caractères</li>
                            <li>Mélange de lettres majuscules et minuscules</li>
                            <li>Inclure des chiffres et des symboles</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile