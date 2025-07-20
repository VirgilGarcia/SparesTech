import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { useToast } from '../../shared/context/ToastContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react'
import Header from '../components/Header'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn, user, loading: authLoading } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  // Rediriger vers le profil si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/profile')
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!email.trim() || !password.trim()) {
      showError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      showError('Format d\'email invalide')
      setLoading(false)
      return
    }

    try {
      await signIn(email.trim(), password)
      showSuccess('Connexion réussie ! Redirection en cours...')
      
      // Vérifier s'il y a un plan sélectionné à traiter après connexion
      const selectedPlan = localStorage.getItem('selectedPlan')
      const selectedBilling = localStorage.getItem('selectedBilling')
      
      setTimeout(() => {
        if (selectedPlan && selectedBilling) {
          // Nettoyer le localStorage
          localStorage.removeItem('selectedPlan')
          localStorage.removeItem('selectedBilling')
          // Rediriger vers le checkout avec les paramètres
          navigate(`/marketplace-checkout?plan=${selectedPlan}&billing=${selectedBilling}`)
        } else {
          navigate('/')
        }
      }, 1000)
    } catch (error: any) {
      console.error('Erreur de connexion complète:', error)
      
      if (error.message?.includes('Invalid login credentials')) {
        showError('Email ou mot de passe incorrect. Avez-vous confirmé votre email ?')
      } else if (error.message?.includes('Email not confirmed')) {
        showError('Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.')
      } else if (error.message?.includes('signup_disabled')) {
        showError('Les inscriptions sont désactivées')
      } else {
        showError(`Erreur de connexion: ${error.message}`)
      }
      setError(null) // Clear local error since we're using toasts
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="relative pt-32 pb-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
                <Shield className="w-4 h-4 mr-2" />
                Connexion sécurisée
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Bon retour
                <br />
                <span className="text-blue-600">chez vous !</span>
              </h1>
              
              <p className="text-2xl text-gray-600 mb-6 leading-relaxed">
                Retrouvez votre espace personnel et continuez à développer votre marketplace.
              </p>
              
              <p className="text-xl text-gray-500 mb-12">
                Accédez à tous vos outils de gestion en quelques secondes.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-12">
                <div className="flex items-center text-left">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-4"></div>
                  <span className="text-gray-700 text-lg">Accès instantané à votre tableau de bord</span>
                </div>
                <div className="flex items-center text-left">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-4"></div>
                  <span className="text-gray-700 text-lg">Gestion de vos marketplaces en temps réel</span>
                </div>
                <div className="flex items-center text-left">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-4"></div>
                  <span className="text-gray-700 text-lg">Support premium et nouvelles fonctionnalités</span>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-gray-600 mb-4">Pas encore de compte ?</p>
                <Link 
                  to="/register"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors group"
                >
                  Créer un compte gratuitement
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full max-w-lg mx-auto lg:max-w-none">
              <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                
                <div className="relative">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      Connexion
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Accédez à votre espace Spartelio
                    </p>
                  </div>

                  {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Info pour les tests */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
                    <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Première connexion ?
                    </h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p>1. <Link to="/register" className="underline font-semibold hover:text-blue-600">Créez votre compte gratuit</Link> en 2 minutes</p>
                      <p>2. Confirmez votre email pour activer votre compte</p>
                      <p>3. Connectez-vous et créez votre première marketplace</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Adresse email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="Votre mot de passe"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 px-8 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl transform hover:-translate-y-1"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Connexion en cours...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Se connecter
                          <ArrowRight className="w-6 h-6 ml-2" />
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Forgot password link */}
                  <div className="mt-8 text-center">
                    <button className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {/* Social proof */}
                  <div className="mt-10 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-4">Rejoint par +500 professionnels</p>
                    <div className="flex justify-center items-center space-x-8 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        Sécurisé
                      </div>
                      <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-1" />
                        Chiffré
                      </div>
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        RGPD
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login