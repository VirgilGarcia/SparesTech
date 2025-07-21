// components/RegisterGuard.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { settingsService } from '../../../saas/services/settingsService'
import type { MarketplaceSettings } from '../../../saas/services/settingsService'

interface RegisterGuardProps {
  children: React.ReactNode
}

export function RegisterGuard({ children }: RegisterGuardProps) {
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getPublicSettings('default')
      setSettings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      // En cas d'erreur, bloquer l'inscription par sécurité
      setSettings({ 
        public_access: false,
        company_name: 'Marketplace'
      } as MarketplaceSettings)
    } finally {
      setLoading(false)
    }
  }

  // Afficher le loader
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-stone-600">Vérification des paramètres d'inscription...</div>
        </div>
      </div>
    )
  }

  // Si le marketplace est en mode privé (inscription contrôlée)
  if (settings && !settings.public_access) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-stone-800 mb-4">
              Inscriptions Fermées
            </h1>
            
            <p className="text-stone-600 mb-6 leading-relaxed">
              Ce marketplace est en mode privé. Les inscriptions sont contrôlées par l'administrateur. 
              Pour obtenir un compte, veuillez contacter l'administrateur de <strong>{settings.company_name || 'ce marketplace'}</strong>.
            </p>
            
            <div className="space-y-3">
              <Link 
                to="/login" 
                className="block w-full bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors text-center font-medium"
              >
                Se connecter
              </Link>
              
              <Link 
                to="/" 
                className="block w-full bg-stone-100 text-stone-700 px-6 py-3 rounded-xl hover:bg-stone-200 transition-colors text-center font-medium"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si l'inscription est autorisée, afficher la page normale
  return <>{children}</>
}