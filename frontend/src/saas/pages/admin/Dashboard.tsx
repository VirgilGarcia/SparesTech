import { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/context/AuthContext'
import { useTenantContext } from '../../../shared/context/TenantContext'
import { Navigate, Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'
import { categoryService } from '../../services/categoryService'
import Header from '../../components/layout/Header'
import { productStructureService } from '../../services/productStructureService'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'


interface BarChartProps {
  data: Array<{ label: string; value: number }>
  height?: number
  color?: string
}

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { tenantId, userProfile, loading: tenantLoading, isAdmin } = useTenantContext()
  const { theme } = useMarketplaceTheme()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading] = useState(false)
  const [weeklyOrders, setWeeklyOrders] = useState<number[]>([0,0,0,0,0,0,0])
  const [monthlyStats, setMonthlyStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })

  // Charger le rôle depuis le contexte tenant
  useEffect(() => {
    if (userProfile) {
      setUserRole(userProfile.role)
      // Si admin, charger les stats
      if (userProfile.role === 'admin') {
        loadStats()
      }
    }
  }, [userProfile])


  const loadStats = async () => {
    if (!tenantId) return
    
    try {
      // setLoading(true) // Removed as per edit hint
      
      const hasCategories = await categoryService.hasCategories()
      if (!hasCategories) {
        // await categoryService.initializeDefaultCategories() // Removed as per edit hint
      }

      const hasSystemFields = await productStructureService.hasSystemFields()
      if (!hasSystemFields) {
        await productStructureService.initializeSystemFields()
      }
      
      const [products, orders] = await Promise.all([
        productService.getAllProducts(),
        orderService.getAllOrders()
      ])
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      
      const ordersThisMonth = orders.orders.filter((order: any) => {
        const d = new Date(order.created_at)
        return d >= startOfMonth && d < endOfMonth
      })
      
      setMonthlyStats({
        productsCount: products.length,
        ordersCount: ordersThisMonth.length,
        totalRevenue: ordersThisMonth.reduce((sum: number, order: any) => sum + order.total_amount, 0),
        pendingOrders: ordersThisMonth.filter((order: any) => order.status === 'pending').length
      })
      
      const weekOrders = [0,0,0,0,0,0,0]
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
      startOfWeek.setHours(0,0,0,0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      endOfWeek.setHours(0,0,0,0)
      
      orders.orders.forEach((order: any) => {
        const d = new Date(order.created_at)
        if (d >= startOfWeek && d < endOfWeek) {
          const day = (d.getDay() + 6) % 7
          weekOrders[day]++
        }
      })
      setWeeklyOrders(weekOrders)
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      // setLoading(false) // Removed as per edit hint
    }
  }

  // Composant de graphique en barres simple
  const BarChart = ({ data, height = 180, color = theme.primaryColor }: BarChartProps) => {
    const maxValue = Math.max(...data.map(d => d.value))
    
    return (
      <div className="flex items-end justify-between h-40 space-x-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full rounded-t transition-all duration-300"
              style={{ 
                height: `${maxValue > 0 ? (item.value / maxValue) * height : 0}px`,
                backgroundColor: color,
                opacity: 0.7 + (index * 0.1)
              }}
            />
            <div className="text-xs text-gray-600 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    )
  }

  // Chargement auth et tenant
  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement de l'authentification...</div>
      </div>
    )
  }

  // Pas connecté
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Chargement du rôle
  if (roleLoading || userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Vérification des permissions...</div>
      </div>
    )
  }

  // Pas admin
  if (!isAdmin) {
    return <Navigate to="/catalog" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre de la page */}
        <div className="mb-6">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Dashboard</h1>
          <p className="text-sm text-gray-600">Vue d'ensemble de votre marketplace</p>
        </div>

        {/* Stats du mois en cours */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Carte Produits */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium text-gray-600">Produits</p>
                <p className="text-3xl font-bold text-gray-900 my-2">{monthlyStats.productsCount}</p>
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Carte Commandes */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-3xl font-bold text-gray-900 my-2">{monthlyStats.ordersCount}</p>
                <span className="text-xs text-gray-500">ce mois-ci</span>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          {/* Carte Chiffre d'affaires */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-3xl font-bold text-gray-900 my-2">{monthlyStats.totalRevenue.toFixed(0)}€</p>
                <span className="text-xs text-gray-500">ce mois-ci</span>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Carte En attente */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-gray-900 my-2">{monthlyStats.pendingOrders}</p>
                <span className="text-xs text-gray-500">ce mois-ci</span>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique de performance */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${theme.primaryColor}20` }}>
              <svg className="w-4 h-4" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Performance hebdomadaire</h3>
          </div>
          <BarChart 
            data={[
              { label: 'Lun', value: weeklyOrders[0] },
              { label: 'Mar', value: weeklyOrders[1] },
              { label: 'Mer', value: weeklyOrders[2] },
              { label: 'Jeu', value: weeklyOrders[3] },
              { label: 'Ven', value: weeklyOrders[4] },
              { label: 'Sam', value: weeklyOrders[5] },
              { label: 'Dim', value: weeklyOrders[6] }
            ]}
            color={theme.primaryColor}
            height={180}
          />
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${theme.primaryColor}20` }}>
              <svg className="w-4 h-4" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Actions rapides</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/admin/products/add" className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                   style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">Ajouter produit</p>
            </Link>
            <Link to="/admin/products" className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                   style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">Gérer produits</p>
            </Link>
            <Link to="/admin/orders" className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                   style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">Voir commandes</p>
            </Link>
            <Link to="/admin/settings" className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                   style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">Paramètres</p>
            </Link>
            <Link to="/admin/users" className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                   style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">Utilisateurs</p>
            </Link>
            <Link to="/admin/categories" className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                   style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">Catégories</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard