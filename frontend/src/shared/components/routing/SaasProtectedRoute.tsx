import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTenant } from '../../hooks/useTenant'
import type { ProtectedRouteProps } from './ProtectedRoute'

interface SaasProtectedRouteProps extends Omit<ProtectedRouteProps, 'redirectTo'> {
  requireAdmin?: boolean
  requireTenant?: boolean
}

export function SaasProtectedRoute({ 
  children, 
  requireTenant = true,
  requireAdmin = false,
  loadingComponent
}: SaasProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { tenant, userProfile, loading: tenantLoading, error: tenantError, isAdmin } = useTenant()
  const location = useLocation()

  // Composant de chargement spécialisé pour SaaS
  const saasLoadingComponent = loadingComponent || (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-gray-600">Vérification du tenant et profil...</div>
      </div>
    </div>
  )

  // Première vérification : authentification de base
  if (authLoading) {
    return <>{saasLoadingComponent}</>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Deuxième vérification : tenant et profil utilisateur
  if (tenantLoading) {
    return <>{saasLoadingComponent}</>
  }

  // Gestion des erreurs de tenant
  if (tenantError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de tenant</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{tenantError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Vérification du tenant si requis
  if (requireTenant && !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tenant introuvable</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Aucun marketplace trouvé pour ce domaine. Veuillez vérifier l'URL ou contacter l'administrateur.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Vérification du profil utilisateur si un tenant est requis
  if (requireTenant && !userProfile) {
    return (
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
              Un profil utilisateur est requis pour ce marketplace. Veuillez vous inscrire ou contacter l'administrateur.
            </p>
            <Navigate to="/register" state={{ from: location, needsProfile: true }} replace />
          </div>
        </div>
      </div>
    )
  }

  // Vérification du profil actif
  if (userProfile && !userProfile.is_active) {
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
              Votre compte a été désactivé sur ce marketplace. Veuillez contacter l'administrateur.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Vérification des droits admin si requis
  if (requireAdmin && !isAdmin) {
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
            <p className="text-gray-600 mb-6 leading-relaxed">
              Vous devez être administrateur pour accéder à cette page.
            </p>
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    )
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>
}