import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { settingsService } from '../../services/settingsService'
import type { MarketplaceSettings } from '../../services/settingsService'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useMarketplaceTheme()
  
  // Récupérer la page de destination (si redirigé depuis PrivateRoute)
  const from = location.state?.from?.pathname || '/'

  // Charger les paramètres du marketplace
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setSettingsLoading(true)
      const data = await settingsService.getPublicSettings()
      setSettings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      // En cas d'erreur, valeurs par défaut sécurisées
      setSettings({
        public_access: false,
        company_name: 'Marketplace'
      } as MarketplaceSettings)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      await signIn(email, password)
      
      // Rediriger vers la page d'origine ou l'accueil
      navigate(from, { replace: true })
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  // Afficher le loader pendant le chargement des settings
  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          {/* Header avec logo et nom de l'entreprise */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center mb-6">
              {/* Logo de l'entreprise */}
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.company_name || 'Logo'} 
                  className="h-16 w-16 object-contain rounded-lg mb-4"
                />
              ) : (
                <div 
                  className="h-16 w-16 rounded-lg flex items-center justify-center text-white font-semibold text-2xl mb-4"
                  style={{ backgroundColor: settings?.primary_color || theme.primaryColor }}
                >
                  {settings?.company_name ? settings.company_name.charAt(0).toUpperCase() : 'M'}
                </div>
              )}
              {/* Nom de l'entreprise */}
              <h1 className="text-3xl font-light text-gray-900 mb-2">
                {settings?.company_name || 'Marketplace'}
              </h1>
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">Connexion</h2>
            <p className="mt-2 text-gray-600">
              Connectez-vous à votre compte
            </p>
            {/* Afficher la raison de la redirection si applicable */}
            {location.state?.from && (
              <div className="mt-4 p-3 rounded-lg border"
                style={{ 
                  backgroundColor: `${theme.primaryColor}10`,
                  borderColor: `${theme.primaryColor}20`
                }}
              >
                <p className="text-sm" style={{ color: theme.primaryColor }}>
                  Connexion requise pour accéder à cette page
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-offset-0 transition-all"
                placeholder="votre@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-offset-0 transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-white ${
                loading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              style={{ backgroundColor: theme.primaryColor }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Lien vers l'inscription */}
          {settings?.public_access && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 mb-2">
                Pas encore de compte ?
              </p>
              <Link
                to="/register"
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: theme.primaryColor }}
              >
                Créer un compte
              </Link>
            </div>
          )}

          {/* Lien vers l'accueil si mode privé */}
          {settings && !settings.public_access && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 mb-2">
                Ce marketplace est en mode privé
              </p>
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: theme.primaryColor }}
              >
                Retour à l'accueil
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login