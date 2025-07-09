import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/catalog')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Connexion</h1>
            <p className="text-stone-600">Connectez-vous à votre compte</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                loading
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-stone-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login