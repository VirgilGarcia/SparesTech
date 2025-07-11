import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

function Header() {
  const { user, signOut } = useAuth()
  const { theme, settings } = useTheme()
  const { cartItems } = useCart()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)

  // Charger le rôle de l'utilisateur quand il se connecte
  useEffect(() => {
    if (user) {
      loadUserRole()
    } else {
      setUserRole(null)
    }
  }, [user])

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
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Calculer le nombre total d'articles dans le panier
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

  // Définir les éléments du menu selon le rôle
  const menuItems = [
    // Section Administration (admin seulement)
    ...(userRole === 'admin' ? [
      {
        section: 'Administration',
        items: [
          {
            to: '/admin/users',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            label: 'Utilisateurs'
          },
          {
            to: '/admin',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
              </svg>
            ),
            label: 'Dashboard'
          },
          {
            to: '/admin/products',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ),
            label: 'Produits'
          },
          {
            to: '/admin/orders',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            label: 'Commandes'
          },
          {
            to: '/admin/settings',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            label: 'Paramètres'
          }
        ]
      }
    ] : []),
    
    // Section Mon Compte (pour tous)
    {
      section: 'Mon Compte',
      items: [
        {
          to: '/profile',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          label: 'Mon profil'
        },
        {
          to: '/orders',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          ),
          label: 'Mes commandes'
        }
      ]
    }
  ]

  return (
    <header 
      className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50"
      style={{ 
        backgroundColor: settings?.secondary_color || '#ffffff',
        borderColor: settings?.secondary_color || '#f3f4f6'
      }}
    >
      <div className="w-full max-w-none px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo et nom de l'entreprise */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.company_name || 'Logo'} 
                className="h-8 w-8 object-contain"
              />
            ) : (
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {settings?.company_name ? settings.company_name.charAt(0).toUpperCase() : 'M'}
              </div>
            )}
            
            <span className="text-lg font-semibold text-gray-900">
              {settings?.company_name || 'Marketplace'}
            </span>
          </Link>

          {/* Navigation et actions */}
          <div className="flex items-center space-x-6">
            
            {/* Navigation principale */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Accueil
              </Link>
              <Link 
                to="/catalog" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Catalogue
              </Link>
            </nav>

            {/* Panier */}
            <Link to="/cart" className="relative">
              <div className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
            
            {/* Menu utilisateur */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center relative">
                    <span className="text-xs font-medium text-gray-700">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                    {userRole === 'admin' && (
                      <div 
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ backgroundColor: theme.primaryColor }}
                        title="Administrateur"
                      />
                    )}
                  </div>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
                    
                    {/* Header utilisateur */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {roleLoading ? (
                          <span className="flex items-center">
                            <span className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></span>
                            Chargement...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {userRole === 'admin' ? (
                              <>
                                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: theme.primaryColor }}></span>
                                Administrateur
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                Client
                              </>
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Menu dynamique par sections */}
                    {menuItems.map((section, sectionIndex) => (
                      <div key={section.section}>
                        {sectionIndex > 0 && <div className="border-t border-gray-100 my-1"></div>}
                        
                        {/* Titre de section */}
                        <div className="px-3 py-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {section.section}
                          </p>
                        </div>
                        
                        {/* Items de la section */}
                        {section.items.map((item) => {
                          const isActive = location.pathname === item.to || 
                            (item.to === '/admin' && location.pathname === '/admin')
                          return (
                            <Link
                              key={`${section.section}-${item.to}`}
                              to={item.to}
                              className={`flex items-center space-x-3 px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'text-white hover:opacity-90'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              style={isActive ? { backgroundColor: theme.primaryColor } : {}}
                              onClick={() => setShowUserMenu(false)}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    ))}
                    
                    {/* Séparateur et déconnexion */}
                    <div className="border-t border-gray-100 mt-1">
                      <button 
                        onClick={() => {
                          handleLogout()
                          setShowUserMenu(false)
                        }}
                        className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  Connexion
                </Link>
                {settings?.allow_public_registration && (
                  <Link 
                    to="/register" 
                    className="text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Inscription
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fermer le menu si on clique ailleurs */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}

export default Header