import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { getCurrentDomainInfo } from '../../utils/domainUtils'
import type { DomainInfo } from '../../types/marketplace'

// Import des composants du site principal
import StartupRouter from '../../../startup/components/StartupRouter'
import MarketplaceLanding from '../../../startup/pages/MarketplaceLanding'

// Import des composants du marketplace client
import Login from '../../../saas/pages/public/Login'
import Register from '../../../saas/pages/public/Register'
import Home from '../../../saas/pages/public/Home'
import Catalog from '../../../saas/pages/public/Catalog'
import ProductDetail from '../../../saas/pages/public/ProductDetail'
import Cart from '../../../saas/pages/user/Cart'
import Checkout from '../../../saas/pages/user/Checkout'
import Profile from '../../../saas/pages/user/Profile'
import Orders from '../../../saas/pages/user/Orders'
import UserOrderDetail from '../../../saas/pages/user/OrderDetail'

// Import des composants admin
import AdminDashboard from '../../../saas/pages/admin/Dashboard'
import AdminProducts from '../../../saas/pages/admin/Products'
import AdminOrders from '../../../saas/pages/admin/Orders'
import AdminCategories from '../../../saas/pages/admin/Categories'
import AddProduct from '../../../saas/pages/admin/AddProduct'
import EditProduct from '../../../saas/pages/admin/EditProduct'
import AdminSettings from '../../../saas/pages/admin/Settings'
import ProductStructure from '../../../saas/pages/admin/ProductStructure'
import AdminUsers from '../../../saas/pages/admin/Users'

// Import des guards et contextes
import { RequireAuth } from './RequireAuth'
import { PrivateRoute } from './PrivateRoute'
import { RegisterGuard } from '../guards/RegisterGuard'
import { TenantGuard } from '../guards/TenantGuard'

function DomainRouter() {
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeDomain = async () => {
      try {
        const info = await getCurrentDomainInfo()
        setDomainInfo(info)
        
        // Si c'est un sous-domaine/domaine personnalisé mais aucun tenant trouvé
        if (!info.isMainSite && !info.tenantId) {
          setError('Marketplace introuvable pour ce domaine')
        }
      } catch (err) {
        console.error('Erreur lors de l\'initialisation du domaine:', err)
        setError('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    initializeDomain()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
            <p className="text-gray-600 mb-6">Ce domaine ne correspond à aucun marketplace actif.</p>
            <a 
              href="https://sparestech.com" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Retour au site principal
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!domainInfo) {
    return <div>Erreur de configuration</div>
  }

  // Site principal SparesTech - Vitrine + création de marketplace
  if (domainInfo.isMainSite) {
    return <StartupRouter />
  }

  // Marketplace client - Application complète
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/login" element={<Login />} />
      
      {/* Inscription conditionnelle */}
      <Route path="/register" element={
        <RegisterGuard>
          <Register />
        </RegisterGuard>
      } />

      {/* Pages principales - protégées si marketplace privé */}
      <Route path="/" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />
      
      <Route path="/catalog" element={
        <PrivateRoute>
          <Catalog />
        </PrivateRoute>
      } />
      
      <Route path="/product/:id" element={
        <PrivateRoute>
          <ProductDetail />
        </PrivateRoute>
      } />
      
      <Route path="/cart" element={
        <PrivateRoute>
          <Cart />
        </PrivateRoute>
      } />
      
      <Route path="/checkout" element={
        <PrivateRoute>
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        </PrivateRoute>
      } />

      {/* Pages utilisateur authentifié */}
      <Route path="/profile" element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      } />
      
      <Route path="/orders" element={
        <RequireAuth>
          <Orders />
        </RequireAuth>
      } />
      
      <Route path="/orders/:id" element={
        <RequireAuth>
          <UserOrderDetail />
        </RequireAuth>
      } />

      {/* Pages d'administration - protégées par TenantGuard */}
      <Route path="/admin" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <AdminDashboard />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/products" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <AdminProducts />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/products/add" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <AddProduct />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/products/edit/:id" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <EditProduct />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/orders" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <AdminOrders />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/categories" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <AdminCategories />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/settings" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <AdminSettings />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/product-structure" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <ProductStructure />
          </TenantGuard>
        </RequireAuth>
      } />
      
      <Route path="/admin/users" element={
        <RequireAuth>
          <TenantGuard requireAdmin>
            <AdminUsers />
          </TenantGuard>
        </RequireAuth>
      } />

      {/* Route par défaut */}
      <Route path="*" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />
    </Routes>
  )
}

export default DomainRouter