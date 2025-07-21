// components/PrivateRoute.tsx
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { settingsService } from '../../../saas/services/settingsService'
import type { MarketplaceSettings } from '../../../saas/services/settingsService'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const location = useLocation()

  // Charger les paramètres du marketplace
  useEffect(() => {
    loadMarketplaceSettings()
  }, [])

  const loadMarketplaceSettings = async () => {
    try {
      setSettingsLoading(true)
      // Récupérer les settings publics (sans auth requise)
      const data = await settingsService.getPublicSettings('default')
      setSettings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      // En cas d'erreur, considérer comme privé par sécurité
      setSettings({ 
        public_access: false
      } as MarketplaceSettings)
    } finally {
      setSettingsLoading(false)
    }
  }

  // Afficher le loader pendant le chargement
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-stone-600">Chargement du marketplace...</div>
        </div>
      </div>
    )
  }

  // Si le marketplace est en mode privé ET que l'utilisateur n'est pas connecté
  if (settings && !settings.public_access && !user) {
    // Sauvegarder la page de destination pour redirection après login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>
}