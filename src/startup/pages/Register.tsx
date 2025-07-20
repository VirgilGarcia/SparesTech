import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, ArrowRight, Shield, Sparkles, Star, Zap } from 'lucide-react'
import Header from '../components/Header'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { signUp, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Rediriger vers le profil si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/profile')
    }
  }, [user, authLoading, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      // 1. Créer le compte utilisateur
      const { data: authData } = await signUp(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name
      })

      // 2. Créer le profil startup immédiatement après l'inscription
      if (authData?.user?.id) {
        const { getOrCreateStartupUserProfile } = await import('../services/userProfileService')
        await getOrCreateStartupUserProfile(authData.user.id, {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          company_name: undefined // ✅ Optionnel - sera rempli lors création marketplace
        })
      }

      setSuccess(true)
      // Pas de redirection automatique - l'utilisateur restera sur la page de confirmation
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error)
      
      // Si le message indique que la confirmation d'email est requise, c'est en fait un succès
      if (error.message?.includes('Vérifiez votre email pour confirmer')) {
        setSuccess(true)
        // Pas de redirection automatique
      } else {
        setError(error.message || 'Une erreur est survenue lors de l\'inscription')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        <section className="relative pt-32 pb-40">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center">
              <div className="bg-white rounded-3xl shadow-2xl p-16 border border-gray-100 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                    Bienvenue dans l'aventure !
                  </h1>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-8 mb-12 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-yellow-600 mr-3" />
                      <h3 className="text-xl font-bold text-yellow-800">Vérifiez votre email !</h3>
                    </div>
                    <p className="text-yellow-700 leading-relaxed text-lg">
                      Un email de confirmation vous a été envoyé à <strong>{formData.email}</strong>.
                      <br />
                      Cliquez sur le lien dans l'email pour activer votre compte avant de vous connecter.
                    </p>
                  </div>
                  
                  <p className="text-xl text-gray-600 mb-12">
                    Une fois votre email confirmé, vous pourrez vous connecter en cliquant ci-dessous.
                  </p>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 inline-flex items-center"
                  >
                    Aller à la connexion
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
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
                <Sparkles className="w-4 h-4 mr-2" />
                Inscription gratuite
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Votre marketplace
                <br />
                <span className="text-green-600">vous attend !</span>
              </h1>
              
              <p className="text-2xl text-gray-600 mb-6 leading-relaxed">
                Rejoignez des centaines de professionnels qui développent leur business avec Spartelio.
              </p>
              
              <p className="text-xl text-gray-500 mb-12">
                Inscription gratuite, aucun engagement, commencez en 2 minutes.
              </p>

              {/* Benefits */}
              <div className="space-y-6 mb-12">
                <div className="flex items-start text-left">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Marketplace en 24h</h3>
                    <p className="text-gray-600">Votre site e-commerce prêt à vendre dès demain</p>
                  </div>
                </div>
                
                <div className="flex items-start text-left">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">0€ de commission</h3>
                    <p className="text-gray-600">Gardez 100% de vos revenus, contrairement aux autres plateformes</p>
                  </div>
                </div>
                
                <div className="flex items-start text-left">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Support expert dédié</h3>
                    <p className="text-gray-600">Une équipe de spécialistes pour votre réussite</p>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-gray-600 mb-4">Déjà un compte ?</p>
                <Link 
                  to="/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors group"
                >
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right side - Register Form */}
            <div className="w-full max-w-lg mx-auto lg:max-w-none">
              <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                
                <div className="relative">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      Créer un compte
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Démarrez votre aventure entrepreneuriale
                    </p>
                  </div>

                  {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Prénom
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                            placeholder="Jean"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Nom
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                            placeholder="Dupont"
                            required
                          />
                        </div>
                      </div>
                    </div>

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
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
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
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="Minimum 6 caractères"
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

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="Confirmer le mot de passe"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-5 px-8 rounded-2xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl transform hover:-translate-y-1"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Création en cours...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          🚀 Créer mon compte gratuit
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Terms */}
                  <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                      En vous inscrivant, vous acceptez nos{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                        conditions d'utilisation
                      </a>{' '}
                      et notre{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                        politique de confidentialité
                      </a>
                    </p>
                  </div>

                  {/* Social proof */}
                  <div className="mt-10 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-4">Rejoignez +500 entrepreneurs satisfaits</p>
                    <div className="flex justify-center items-center space-x-8 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        Sécurisé
                      </div>
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Gratuit
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Sans engagement
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

export default Register