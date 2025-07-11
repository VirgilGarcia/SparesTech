import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { settingsService } from '../services/settingsService'
import type { MarketplaceSettings } from '../services/settingsService'

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
  
  // Récupérer la page de destination (si redirigé depuis PrivateRoute)
  const from = location.state?.from?.pathname || '/'

  // Charger les paramètres du marketplace
  useEffect(() => {
    loadMarketplaceSettings()
  }, [])

  const loadMarketplaceSettings = async () => {
    try {
      setSettingsLoading(true)
      const data = await settingsService.getPublicSettings()
      setSettings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      // Valeurs par défaut si erreur
      setSettings({
        company_name: 'Marketplace',
        logo_url: null,
        primary_color: '#10b981',
        secondary_color: '#f3f4f6',
        public_access: false,
        allow_public_registration: false,
        show_prices: true,
        show_stock: true,
        show_references: true,
        show_descriptions: true,
        show_categories: true
      })
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-stone-600">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: settings?.secondary_color || '#f3f4f6' }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
          
          {/* Header avec logo et nom de l'entreprise */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center mb-6">
              {/* Logo de l'entreprise */}
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.company_name || 'Logo'} 
                  className="h-16 w-16 object-contain rounded-xl mb-3"
                />
              ) : (
                <div 
                  className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-3"
                  style={{ backgroundColor: settings?.primary_color || '#10b981' }}
                >
                  {settings?.company_name ? settings.company_name.charAt(0).toUpperCase() : 'M'}
                </div>
              )}
              
              {/* Nom de l'entreprise */}
              <h1 className="text-2xl font-bold text-stone-900 mb-2">
                {settings?.company_name || 'Marketplace'}
              </h1>
            </div>
            
            <h2 className="text-xl font-semibold text-stone-800">Connexion</h2>
            <p className="mt-2 text-stone-600">
              Connectez-vous à votre compte
            </p>
            
            {/* Afficher la raison de la redirection si applicable */}
            {location.state?.from && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  🔒 Connexion requise pour accéder à cette page
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none transition-colors"
                style={{ 
                  borderColor: 'rgb(214 211 209)' 
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = settings?.primary_color || '#10b981'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(214 211 209)'
                }}
                placeholder="votre@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none transition-colors"
                onFocus={(e) => {
                  e.target.style.borderColor = settings?.primary_color || '#10b981'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(214 211 209)'
                }}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-colors text-white ${
                loading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              style={{ 
                backgroundColor: settings?.primary_color || '#10b981'
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Lien vers l'inscription - conditionnel */}
          {settings?.allow_public_registration && (
            <div className="mt-6 text-center">
              <p className="text-stone-600">
                Pas encore de compte ?{' '}
                <Link 
                  to="/register" 
                  className="font-medium hover:underline transition-colors"
                  style={{ color: settings?.primary_color || '#10b981' }}
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          )}

          {/* Lien vers l'accueil si marketplace public */}
          {settings?.public_access && (
            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                ← Retour au marketplace
              </Link>
            </div>
          )}
        </div>

        {/* Footer avec nom de l'entreprise */}
        <div className="text-center">
          <p className="text-stone-500 text-sm">
            © 2024 {settings?.company_name || 'Marketplace'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login