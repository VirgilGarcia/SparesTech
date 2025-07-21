import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { useUserApi, type UserProfile } from '../../../hooks/api/useUserApi'
import { useRole } from '../../../shared/hooks/useRole'
import Header from '../../components/layout/Header'
import { UserList, UserFilters, CreateUserModal, UserStats } from '../../components/user'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

function AdminUsers() {
  const { user, loading: authLoading } = useAuth()
  const { showError, showSuccess } = useToast()
  const { theme } = useMarketplaceTheme()
  const { profile, loading: roleLoading, isAdmin } = useRole()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [userToArchive, setUserToArchive] = useState<{id: string, email: string, isActive: boolean} | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // Hook API
  const { getUsers, createUser, updateUser } = useUserApi()

  // Form state
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'client' as 'admin' | 'client'
  })

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      setError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const errors: {[key: string]: string} = {}
    
    if (!newUser.email) {
      errors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Format d\'email invalide'
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    
    try {
      setCreating(true)
      setValidationErrors({})
      
      // Créer l'utilisateur via l'API
      const userData = {
        email: newUser.email,
        first_name: '',
        last_name: '',
        role: newUser.role,
        is_active: true,
        country: 'FR',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        tenant_id: profile?.tenant_id || undefined
      }

      const createdUser = await createUser(userData)
      
      if (createdUser) {
        showSuccess('Utilisateur créé avec succès ! Un email de connexion a été envoyé.')
        setNewUser({ email: '', role: 'client' })
        setShowCreateModal(false)
        loadUsers()
      } else {
        setValidationErrors({ email: 'Erreur lors de la création de l\'utilisateur' })
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error)
      showError(error.message || 'Erreur lors de la création de l\'utilisateur')
      setError(error.message || 'Erreur lors de la création de l\'utilisateur')
    } finally {
      setCreating(false)
    }
  }

  const handleArchiveUser = async (userId: string, _userEmail: string, isActive: boolean) => {
    if (userId === user?.id) {
      setError('Vous ne pouvez pas archiver votre propre compte')
      return
    }

    try {
      const updated = await updateUser(userId, { is_active: !isActive })
      
      if (updated) {
        // Actualiser la liste des utilisateurs
        await loadUsers()
        setSuccess(`Utilisateur ${isActive ? 'archivé' : 'restauré'} avec succès`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erreur lors de l\'archivage')
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'archivage:', error)
      setError(error.message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setUserToArchive(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'client') => {
    if (userId === user?.id) {
      setError('Vous ne pouvez pas modifier votre propre rôle')
      return
    }
    
    try {
      const updated = await updateUser(userId, { role: newRole })
      
      if (updated) {
        setSuccess('Rôle modifié avec succès')
        loadUsers()
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError('Erreur lors du changement de rôle')
      }
    } catch (error: any) {
      console.error('Erreur lors du changement de rôle:', error)
      setError(error.message || 'Erreur lors du changement de rôle')
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesArchived = showArchived ? !u.is_active : u.is_active
    return matchesSearch && matchesArchived
  })

  const userStats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    archived: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin' && u.is_active).length,
    clients: users.filter(u => u.role === 'client' && u.is_active).length
  }

  // Chargements et accès
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}></div>
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les comptes utilisateurs et leurs permissions</p>
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

        {/* Statistiques */}
        <UserStats userStats={userStats} />

        {/* Filtres */}
        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
          userCount={users.length}
          activeCount={users.filter(u => u.is_active).length}
          archivedCount={users.filter(u => !u.is_active).length}
        />

        {/* Liste des utilisateurs */}
        <UserList
          users={filteredUsers}
          loading={loading}
          currentUserId={user!.id}
          onArchiveUser={handleArchiveUser}
          onRoleChange={handleRoleChange}
        />
      </div>

      {/* Modal de création */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        email={newUser.email}
        role={newUser.role}
        onEmailChange={(email) => setNewUser({ ...newUser, email })}
        onRoleChange={(role) => setNewUser({ ...newUser, role })}
        onSubmit={handleCreateUser}
        loading={creating}
        validationErrors={validationErrors}
      />

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={!!userToArchive}
        onClose={() => setUserToArchive(null)}
        onConfirm={() => userToArchive && handleArchiveUser(userToArchive.id, userToArchive.email, userToArchive.isActive)}
        title={userToArchive?.isActive ? "Archiver l'utilisateur" : "Restaurer l'utilisateur"}
        message={`Êtes-vous sûr de vouloir ${userToArchive?.isActive ? 'archiver' : 'restaurer'} l'utilisateur ${userToArchive?.email} ?`}
        type={userToArchive?.isActive ? "danger" : "warning"}
      />
    </div>
  )
}

export default AdminUsers