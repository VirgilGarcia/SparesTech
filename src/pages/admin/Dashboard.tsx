import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [products, orders] = await Promise.all([
        productService.getAllProducts(),
        orderService.getAllOrders()
      ])
      
      setStats({
        productsCount: products.length,
        ordersCount: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
        pendingOrders: orders.filter(order => order.status === 'pending').length
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header Admin */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-semibold text-sm">📊</span>
              </div>
              <h1 className="text-xl font-semibold text-stone-800">Dashboard Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-stone-600">{user.user_metadata?.company_name || user.email}</span>
              <a href="/catalog" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Voir le site
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <div className="text-2xl font-bold text-stone-800">{stats.productsCount}</div>
            <div className="text-stone-600">Produits</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <div className="text-2xl font-bold text-stone-800">{stats.ordersCount}</div>
            <div className="text-stone-600">Commandes</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <div className="text-2xl font-bold text-stone-800">{stats.totalRevenue.toFixed(2)}€</div>
            <div className="text-stone-600">Chiffre d'affaires</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <div className="text-2xl font-bold text-stone-800">{stats.pendingOrders}</div>
            <div className="text-stone-600">En attente</div>
          </div>
        </div>

        {/* Navigation admin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin/products" className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-colors">
            <div className="text-2xl mb-3">📦</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Gestion Produits</h3>
            <p className="text-stone-600">Ajouter, modifier, supprimer des produits</p>
          </a>
          
          <a href="/admin/orders" className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-colors">
            <div className="text-2xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Commandes</h3>
            <p className="text-stone-600">Suivre et gérer les commandes</p>
          </a>
          
          <a href="/admin/settings" className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-colors">
            <div className="text-2xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Paramètres</h3>
            <p className="text-stone-600">Configuration du marketplace</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard