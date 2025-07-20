import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  loadingComponent
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return loadingComponent || (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Vérification de l'authentification...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}