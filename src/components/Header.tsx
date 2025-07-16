import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMarketplaceTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { categoryService } from '../services/categoryService'
import type { Category } from '../services/categoryService'

function Header() {
  const { user, signOut } = useAuth()
  const { theme, settings } = useMarketplaceTheme()
  const { cartItems } = useCart()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Charger le rôle de l'utilisateur quand il se connecte
  useEffect(() => {
    if (user) {
      loadUserRole()
    } else {
      setUserRole(null)
    }
  }, [user])

  // Charger les catégories
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const data = await categoryService.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadUserRole = async () => {
    if (!user) return
    
    try {
      setRoleLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement du rôle:', error)
        setUserRole('client')
      } else {
        setUserRole(data.role)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error)
      setUserRole('client')
    } finally {
      setRoleLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUserRole(null)
      setShowUserMenu(false)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Calculer le nombre total d'articles dans le panier
  const totalItems = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)

  // Vérifier si une page est active
  const isActivePage = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo et nom de l'entreprise */}
          <Link to="/" className="flex items-center space-x-3 group">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.company_name || 'Logo'} 
                className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {settings?.company_name ? settings.company_name.charAt(0).toUpperCase() : 'M'}
              </div>
            )}
            
            <span className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {settings?.company_name || 'Marketplace'}
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors relative ${
                isActivePage('/') 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Accueil
              {isActivePage('/') && (
                <div 
                  className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              )}
            </Link>
            <Link 
              to="/catalog" 
              className={`text-sm font-medium transition-colors relative ${
                isActivePage('/catalog') 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Catalogue
              {isActivePage('/catalog') && (
                <div 
                  className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              )}
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            
            {/* Panier */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Menu utilisateur */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                       style={{ backgroundColor: theme.primaryColor }}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {/* Info utilisateur */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole || 'Utilisateur'}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {/* Administration */}
                      {userRole === 'admin' && (
                        <div className="px-4 py-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Administration</p>
                          <div className="space-y-1">
                            <Link to="/admin" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActivePage('/admin') && location.pathname === '/admin'
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`} style={isActivePage('/admin') && location.pathname === '/admin' ? { backgroundColor: theme.primaryColor } : {}}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span>Dashboard</span>
                            </Link>
                            <Link to="/admin/users" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActivePage('/admin/users')
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`} style={isActivePage('/admin/users') ? { backgroundColor: theme.primaryColor } : {}}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              <span>Utilisateurs</span>
                            </Link>
                            <Link to="/admin/categories" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActivePage('/admin/categories')
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`} style={isActivePage('/admin/categories') ? { backgroundColor: theme.primaryColor } : {}}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span>Catégories</span>
                            </Link>
                            <Link to="/admin/products" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActivePage('/admin/products')
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`} style={isActivePage('/admin/products') ? { backgroundColor: theme.primaryColor } : {}}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>Produits</span>
                            </Link>
                            <Link to="/admin/orders" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActivePage('/admin/orders')
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`} style={isActivePage('/admin/orders') ? { backgroundColor: theme.primaryColor } : {}}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Commandes</span>
                            </Link>
                            <Link to="/admin/settings" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActivePage('/admin/settings')
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`} style={isActivePage('/admin/settings') ? { backgroundColor: theme.primaryColor } : {}}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Paramètres</span>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Mon compte */}
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Mon Compte</p>
                        <div className="space-y-1">
                          <Link to="/profile" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                            isActivePage('/profile')
                              ? 'text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`} style={isActivePage('/profile') ? { backgroundColor: theme.primaryColor } : {}}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Mon profil</span>
                          </Link>
                          <Link to="/orders" className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                            isActivePage('/orders')
                              ? 'text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`} style={isActivePage('/orders') ? { backgroundColor: theme.primaryColor } : {}}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Mes commandes</span>
                          </Link>
                        </div>
                      </div>

                      {/* Déconnexion */}
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button 
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Connexion
                </button>
              </Link>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="space-y-2">
              <Link 
                to="/" 
                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                  isActivePage('/') 
                    ? 'text-gray-900 bg-gray-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/catalog" 
                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                  isActivePage('/catalog') 
                    ? 'text-gray-900 bg-gray-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Catalogue
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header