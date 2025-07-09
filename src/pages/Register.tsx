import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

function Register() {
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.company)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">Inscription réussie !</h1>
            <p className="text-stone-600">Vérifiez votre email pour confirmer votre compte.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Inscription</h1>
            <p className="text-stone-600">Créez votre compte professionnel</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-stone-700 mb-2">
                Entreprise
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Nom de votre entreprise"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email professionnel
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="votre@entreprise.com"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-stone-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register