import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { Sparkles, LogIn, User, LogOut } from 'lucide-react'

const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleDemoClick = () => {
    navigate('/demo')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Spartelio
                </h1>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Fonctionnalités
              </a>
              <button onClick={() => navigate('/pricing')} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Tarifs
              </button>

              <button 
                onClick={handleDemoClick}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Démo
              </button>
              <button 
                onClick={() => navigate('/faq')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                FAQ
              </button>
              
              {/* Boutons d'authentification */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil</span>
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                  </button>
                  <button 
                    onClick={() => navigate('/pricing')} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Créer ma marketplace
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 