import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Header from '../components/Header'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Format d\'email invalide')
      setLoading(false)
      return
    }

    try {
      await signIn(email.trim(), password)
      navigate('/')
    } catch (error: any) {
      console.error('Erreur de connexion complète:', error)
      console.error('Type d\'erreur:', error.constructor.name)
      console.error('Message d\'erreur:', error.message)
      console.error('Code d\'erreur:', error.code)
      
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect. Avez-vous confirmé votre email ?')
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.')
      } else if (error.message?.includes('signup_disabled')) {
        setError('Les inscriptions sont désactivées')
      } else {
        setError(`Erreur de connexion: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bon retour !
                </h1>
                <p className="text-gray-600">
                  Connectez-vous à votre compte SparesTech
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              {/* Aide pour les tests */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Pour tester :</h3>
                <div className="text-sm text-blue-700">
                  <p>1. Créez un compte via <Link to="/register" className="underline">Inscription</Link></p>
                  <p>2. Ou utilisez vos identifiants existants</p>
                  <p className="mt-2 text-xs text-blue-600">
                    💡 Si vous avez une erreur "Invalid credentials", vérifiez que votre email est confirmé
                  </p>
                </div>
              </div>
              


              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                    Inscrivez-vous
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login