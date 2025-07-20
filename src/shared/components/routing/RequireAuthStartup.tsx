import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { getOrCreateStartupUserProfile } from '../../../startup/services/userProfileService'

interface RequireAuthStartupProps {
  children: React.ReactNode
}

/**
 * Composant de protection pour les routes startup nécessitant une authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 * Crée automatiquement le profil startup si il n'existe pas
 */
export function RequireAuthStartup({ children }: RequireAuthStartupProps) {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Créer ou vérifier le profil startup
  useEffect(() => {
    const ensureStartupProfile = async () => {
      if (user && !authLoading) {
        setProfileLoading(true)
        setProfileError(null)
        
        try {
          await getOrCreateStartupUserProfile(user.id, {
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            company_name: user.user_metadata?.company_name || undefined // ✅ Optionnel
          })
        } catch (error) {
          console.error('Erreur lors de la création du profil startup:', error)
          setProfileError('Impossible de créer le profil startup')
        } finally {
          setProfileLoading(false)
        }
      }
    }

    ensureStartupProfile()
  }, [user, authLoading])

  // Afficher le loader pendant la vérification d'auth
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">
            {authLoading ? 'Vérification de l\'authentification...' : 'Initialisation du profil startup...'}
          </div>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur connecté, rediriger vers login avec l'état de redirection
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si erreur de création de profil, afficher l'erreur
  if (profileError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 font-medium mb-2">Erreur d'initialisation</div>
            <div className="text-red-500 text-sm mb-4">{profileError}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>
} 