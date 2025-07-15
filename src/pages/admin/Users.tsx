import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMarketplaceTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { settingsService } from '../../services/settingsService'
import type { MarketplaceSettings } from '../../services/settingsService'
import Header from '../../components/Header'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Modal } from '../../components/Modal'

interface User {
  id: string
  email: string
  role: 'admin' | 'client'
  created_at: string
  is_active: boolean
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [userToArchive, setUserToArchive] = useState<{id: string, email: string, isActive: boolean} | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // Form state
  const [newUser, setNewUser] = useState({
    email: '',
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
      
      // Récupérer tous les profils utilisateurs (actifs et archivés)
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, role, created_at, email, is_active')
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
        is_active: profile.is_active,
      }))

      setUsers(usersFormatted)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      setError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  // Génération d'un mot de passe temporaire sécurisé
  const generateTemporaryPassword = (): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!newUser.email) {
      errors.email = 'L\'email est obligatoire'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Format d\'email invalide'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setCreating(true)
      setError('')
      setValidationErrors({})

      // Générer un mot de passe temporaire sécurisé
      const temporaryPassword = generateTemporaryPassword()

      // Créer l'utilisateur avec signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: temporaryPassword,
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

      setSuccess(`Utilisateur ${newUser.email} créé avec succès ! Mot de passe temporaire : ${temporaryPassword}`)
      setNewUser({ email: '', role: 'client' })
      setShowCreateModal(false)
      
      // Recharger la liste après un délai
      setTimeout(() => {
        loadUsers()
      }, 1000)

      setTimeout(() => setSuccess(''), 7000)
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error)
      
      // Gestion spécifique des erreurs d'email existant
      if (error.message && error.message.includes('User already registered')) {
        setValidationErrors({ email: 'Cet email est déjà utilisé' })
      } else if (error.message && error.message.includes('Invalid email')) {
        setValidationErrors({ email: 'Format d\'email invalide' })
      } else if (error.message && error.message.includes('email')) {
        setValidationErrors({ email: 'Erreur avec l\'email fourni' })
      } else {
        setError(error.message || 'Erreur lors de la création de l\'utilisateur')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, email: string, isActive: boolean) => {
    // Empêcher la modification de son propre compte
    if (userId === user?.id) {
      setError('Vous ne pouvez pas modifier votre propre statut')
      return
    }

    setUserToArchive({id: userId, email, isActive})
  }

  const confirmToggleUserStatus = async () => {
    if (!userToArchive) return

    try {
      setArchiving(true)
      
      const newStatus = !userToArchive.isActive
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('id', userToArchive.id)

      if (error) throw error

      const action = newStatus ? 'réactivé' : 'archivé'
      setSuccess(`Utilisateur ${userToArchive.email} ${action} avec succès.`)
      
      loadUsers()
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error)
      setError(error.message || 'Erreur lors de la modification')
    } finally {
      setArchiving(false)
      setUserToArchive(null)
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Utilisateurs</h1>
            <p className="text-gray-600">Gestion des comptes et rôles</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Barre de recherche */}
            <div className="relative flex-1 lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                style={{ 
                  focusRingColor: theme.primaryColor,
                  focusBorderColor: theme.primaryColor 
                }}
              />
            </div>
            
            {/* Toggle utilisateurs archivés */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                showArchived 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
              </svg>
              <span>{showArchived ? 'Cacher archivés' : 'Voir archivés'}</span>
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Ajouter un utilisateur</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Information sur le mode d'accès */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {settings?.public_access ? "Mode d'accès : Public" : "Mode d'accès : Privé"}
              </h3>
              <p className="text-blue-700 leading-relaxed">
                {settings?.public_access 
                  ? "Les utilisateurs peuvent s'inscrire eux-mêmes. Vous pouvez aussi créer des comptes manuellement avec le bouton ci-dessus."
                  : "Ce marketplace étant en mode privé, seuls les administrateurs peuvent créer des comptes utilisateurs."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Modal de création d'utilisateur */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setNewUser({ email: '', role: 'client' })
            setError('')
            setValidationErrors({})
          }}
          title="Créer un nouvel utilisateur"
          size="lg"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser(prev => ({ ...prev, email: e.target.value }))
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }))
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                    validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  style={!validationErrors.email ? { 
                    focusRingColor: theme.primaryColor,
                    focusBorderColor: theme.primaryColor 
                  } : {}}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'client' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{ 
                    focusRingColor: theme.primaryColor,
                    focusBorderColor: theme.primaryColor 
                  }}
                >
                  <option value="client">Client</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
            
            {/* Message d'erreur général */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-blue-800 text-sm">
                  Un mot de passe temporaire sécurisé sera généré automatiquement et affiché après la création.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {creating ? 'Création...' : 'Créer l\'utilisateur'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Utilisateurs ({users.filter(userItem => 
                  userItem.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  (showArchived || userItem.is_active)
                ).length}{searchQuery && ` sur ${users.length}`})
              </h2>
            </div>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                   style={{ 
                     borderColor: `${theme.primaryColor}20`,
                     borderTopColor: theme.primaryColor 
                   }}>
              </div>
              <p className="text-gray-600 font-medium">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Aucun utilisateur trouvé</p>
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
                  {users.filter(userItem => 
                    userItem.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    (showArchived || userItem.is_active)
                  ).map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                               style={{ backgroundColor: `${theme.primaryColor}20` }}>
                            <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                              {userItem.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-semibold ${userItem.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                                {userItem.email}
                              </p>
                              {!userItem.is_active && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                  Archivé
                                </span>
                              )}
                            </div>
                            {userItem.id === user?.id && (
                              <p className="text-xs font-medium" style={{ color: theme.primaryColor }}>C'est vous</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {userItem.id === user?.id ? (
                          // Affichage en lecture seule pour son propre compte
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                style={{ 
                                  backgroundColor: `${theme.primaryColor}20`,
                                  color: theme.primaryColor 
                                }}>
                            {userItem.role === 'admin' ? 'Admin' : 'Client'}
                          </span>
                        ) : (
                          // Select éditable pour les autres
                          <select
                            value={userItem.role}
                            onChange={(e) => handleRoleChange(userItem.id, e.target.value as 'admin' | 'client')}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                            style={{ 
                              focusRingColor: theme.primaryColor,
                              focusBorderColor: theme.primaryColor 
                            }}
                          >
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {userItem.id !== user?.id ? (
                          <button
                            onClick={() => handleToggleUserStatus(userItem.id, userItem.email, userItem.is_active)}
                            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                              userItem.is_active 
                                ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                          >
                            {userItem.is_active ? 'Archiver' : 'Réactiver'}
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

        {/* Modal de confirmation d'archivage/désarchivage */}
        <ConfirmDialog
          isOpen={userToArchive !== null}
          onCancel={() => setUserToArchive(null)}
          onConfirm={confirmToggleUserStatus}
          title={userToArchive?.isActive ? "Archiver l'utilisateur" : "Réactiver l'utilisateur"}
          message={userToArchive?.isActive 
            ? `Êtes-vous sûr de vouloir archiver l'utilisateur "${userToArchive?.email}" ? Il ne pourra plus se connecter.`
            : `Êtes-vous sûr de vouloir réactiver l'utilisateur "${userToArchive?.email}" ? Il pourra de nouveau se connecter.`
          }
          confirmText={userToArchive?.isActive ? "Archiver" : "Réactiver"}
          cancelText="Annuler"
          type={userToArchive?.isActive ? "warning" : "info"}
          loading={archiving}
        />
      </div>
    </div>
  )
}

export default AdminUsers