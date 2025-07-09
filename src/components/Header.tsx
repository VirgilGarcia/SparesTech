import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { getTotalItems } = useCart()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-semibold text-sm">ST</span>
            </div>
            <Link to="/" className="text-xl font-semibold text-stone-800">
              SparesTech
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-stone-600 hover:text-stone-800 font-medium transition-colors">
              Accueil
            </Link>
            <Link to="/catalog" className="text-stone-600 hover:text-stone-800 font-medium transition-colors">
              Catalogue
            </Link>
            <Link to="/about" className="text-stone-600 hover:text-stone-800 font-medium transition-colors">
              À propos
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <button className="p-2 text-stone-600 hover:text-stone-800 transition-colors">
                🛒
              </button>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-stone-600 text-sm">
                  {user.user_metadata?.company_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-stone-200 text-stone-700 px-4 py-2 rounded-xl hover:bg-stone-300 transition-colors font-medium"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-medium">
                  Connexion
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header