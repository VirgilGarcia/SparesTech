import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMarketplaceTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { settingsService } from '../../services/settingsService'
import type { MarketplaceSettings } from '../../services/settingsService'
import Header from '../../components/Header'

interface User {
  id: string
  email: string
  role: 'admin' | 'client'
  created_at: string
}

function AdminUsers() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'client' as 'admin' | 'client'
  })

  useEffect(() => {
    if (user) {
      loadUserRole()
      loadSettings()
    }
  }, [user])

  useEffect(() => {
    if (userRole === 'admin') {
      loadUsers()
    }
  }, [userRole])

  const loadUserRole = async () => {
    if (!user) return
    
    try {
      setRoleLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserRole(data.role)
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error)
      setUserRole('client')
    } finally {
      setRoleLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const data = await settingsService.getPublicSettings()
      setSettings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Récupérer tous les profils utilisateurs
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, role, created_at, email')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur SQL:', error)
        throw error
      }

      // Transformer les données pour avoir un format propre
      const usersFormatted = profiles.map(profile => ({
        id: profile.id,
        email: profile.email || `user-${profile.id.slice(0, 8)}`,
        role: profile.role,
        created_at: profile.created_at,
      }))

      setUsers(usersFormatted)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      setError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUser.email || !newUser.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    try {
      setCreating(true)
      setError('')

      // Méthode alternative: Utiliser le trigger automatique
      // Au lieu de créer manuellement le profil, on va laisser le trigger le faire
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            email: newUser.email,
            role: newUser.role,
            company_name: ''
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé')
      }

      

      // Attendre que le trigger crée le profil, puis le mettre à jour avec le bon rôle
      let retries = 0
      const maxRetries = 10
      
      while (retries < maxRetries) {
        try {
          // Essayer de mettre à jour le profil (ce qui vérifie s'il existe)
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ 
              role: newUser.role,
              email: newUser.email 
            })
            .eq('id', authData.user.id)

          if (!updateError) {
    
            break
          }
          
          // Si le profil n'existe pas encore, essayer de le créer
          if (updateError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: authData.user.id,
                email: newUser.email,
                role: newUser.role,
                company_name: '',
                is_active: true,
                tenant_id: null
              })

            if (!insertError) {
      
              break
            }
          }
          
          retries++
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (retryError) {
          retries++
          if (retries >= maxRetries) {
            throw new Error('Impossible de créer le profil utilisateur après plusieurs tentatives')
          }
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      if (retries >= maxRetries) {
        throw new Error('Timeout: Le profil utilisateur n\'a pas pu être créé')
      }

      setSuccess(`Utilisateur ${newUser.email} créé avec succès ! Un email de confirmation a été envoyé.`)
      setNewUser({ email: '', password: '', role: 'client' })
      setShowCreateForm(false)
      
      // Recharger la liste après un délai
      setTimeout(() => {
        loadUsers()
      }, 1000)

      setTimeout(() => setSuccess(''), 7000)
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error)
      setError(error.message || 'Erreur lors de la création de l\'utilisateur')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`)) {
      return
    }

    try {
      // Empêcher la suppression de son propre compte
      if (userId === user?.id) {
        setError('Vous ne pouvez pas supprimer votre propre compte')
        return
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      setSuccess(`Profil utilisateur supprimé.`)
      loadUsers()
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      setError(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'client') => {
    try {
      // Empêcher de modifier son propre rôle
      if (userId === user?.id) {
        setError('Vous ne pouvez pas modifier votre propre rôle')
        return
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setSuccess(`Rôle mis à jour avec succès`)
      loadUsers()
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      setError(error.message || 'Erreur lors de la mise à jour')
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

  // Chargements et accès
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Vérification de l'authentification...</div>
        </div>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Vérification des permissions...</div>
        </div>
      </div>
    )
  }
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">Vous devez être administrateur pour accéder à cette page.</p>
            <div className="space-y-3">
              <Link 
                to="/admin"
                className="block w-full bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors text-center font-medium"
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre et bouton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Utilisateurs</h1>
            <p className="text-sm text-gray-600">Gestion des comptes et rôles</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Ajouter un utilisateur</span>
          </button>
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

        {/* Information sur le mode d'accès */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {settings?.public_access ? "Mode d'accès : Public" : "Mode d'accès : Privé"}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {settings?.public_access 
                    ? "Les utilisateurs peuvent s'inscrire eux-mêmes. Vous pouvez aussi créer des comptes manuellement avec le bouton ci-dessus."
                    : "Ce marketplace étant en mode privé, seuls les administrateurs peuvent créer des comptes utilisateurs."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de création de compte - toujours disponible pour les admins */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Créer un nouvel utilisateur</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewUser({ email: '', password: '', role: 'client' })
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe temporaire
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'client' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="client">Client</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-xs">
                  ℹ️ L'utilisateur recevra un email de confirmation à l'adresse indiquée.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {creating ? 'Création...' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Utilisateurs ({users.length})
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-700">
                              {userItem.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{userItem.email}</p>
                            {userItem.id === user?.id && (
                              <p className="text-xs text-blue-600">C'est vous</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {userItem.id === user?.id ? (
                          // Affichage en lecture seule pour son propre compte
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {userItem.role === 'admin' ? 'Admin' : 'Client'}
                          </span>
                        ) : (
                          // Select éditable pour les autres
                          <select
                            value={userItem.role}
                            onChange={(e) => handleRoleChange(userItem.id, e.target.value as 'admin' | 'client')}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {userItem.id !== user?.id ? (
                          <button
                            onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Supprimer
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers