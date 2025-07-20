import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRole } from '../../hooks/useRole'
import type { ProtectedRouteProps } from './ProtectedRoute'

interface StartupProtectedRouteProps extends Omit<ProtectedRouteProps, 'redirectTo'> {
  requireProfile?: boolean
}

export function StartupProtectedRoute({ 
  children, 
  requireProfile = true,
  loadingComponent
}: StartupProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, isStartupUser } = useRole()
  const location = useLocation()

  // Composant de chargement spécialisé pour startup
  const startupLoadingComponent = loadingComponent || (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-gray-600">Vérification du profil startup...</div>
      </div>
    </div>
  )

  // Composant d'erreur pour profil startup manquant
  const noStartupProfileComponent = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil requis</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Un profil startup est requis pour accéder à cette page. Veuillez créer votre profil d'entreprise.
          </p>
          <Navigate to="/register" state={{ from: location, needsProfile: true }} replace />
        </div>
      </div>
    </div>
  )

  // Première vérification : authentification de base
  if (authLoading) {
    return <>{startupLoadingComponent}</>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Deuxième vérification : profil startup si requis
  if (requireProfile) {
    if (profileLoading) {
      return <>{startupLoadingComponent}</>
    }

    if (!isStartupUser || !profile) {
      return <>{noStartupProfileComponent}</>
    }

    // Vérifier que le profil est actif
    if (!profile.is_active) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Compte désactivé</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Votre compte startup a été désactivé. Veuillez contacter le support.
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>
}