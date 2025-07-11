import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'

// Types pour les composants de graphiques
interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

interface BarChartProps {
  data: Array<{ label: string; value: number }>
  height?: number
  color?: string
}

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [weeklyOrders, setWeeklyOrders] = useState<number[]>([0,0,0,0,0,0,0])
  const [monthlyStats, setMonthlyStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })

  // Charger le rôle directement depuis Supabase
  useEffect(() => {
    if (user) {
      loadUserRole()
    }
  }, [user])

  const loadUserRole = async () => {
    try {
      setRoleLoading(true)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      if (error) {
        console.error('❌ Erreur role:', error)
        throw error
      }
      
      setUserRole(data.role)
      
      // Si admin, charger les stats
      if (data.role === 'admin') {
        loadStats()
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error)
      setUserRole('client')
    } finally {
      setRoleLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      const [products, orders] = await Promise.all([
        productService.getAllProducts(),
        orderService.getAllOrders()
      ])
      // Dates pour le mois en cours
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      // Stats du mois
      const ordersThisMonth = orders.filter(order => {
        const d = new Date(order.created_at)
        return d >= startOfMonth && d < endOfMonth
      })
      setMonthlyStats({
        productsCount: products.length, // On garde le total produits (pas pertinent de filtrer par mois)
        ordersCount: ordersThisMonth.length,
        totalRevenue: ordersThisMonth.reduce((sum, order) => sum + order.total_amount, 0),
        pendingOrders: ordersThisMonth.filter(order => order.status === 'pending').length
      })
      // ---- Commandes par jour de la semaine en cours (inchangé) ----
      const weekOrders = [0,0,0,0,0,0,0]
      const now2 = new Date()
      const startOfWeek = new Date(now2)
      startOfWeek.setDate(now2.getDate() - ((now2.getDay() + 6) % 7)) // Lundi
      startOfWeek.setHours(0,0,0,0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      endOfWeek.setHours(0,0,0,0)
      orders.forEach(order => {
        const d = new Date(order.created_at)
        if (d >= startOfWeek && d < endOfWeek) {
          const day = (d.getDay() + 6) % 7 // 0 = lundi, 6 = dimanche
          weekOrders[day]++
        }
      })
      setWeeklyOrders(weekOrders)
      // -------------------------------------------------------------
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Composant de graphique circulaire simple
  const CircularProgress = ({ percentage, size = 40, strokeWidth = 4, color = '#10b981' }: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center mt-4 mb-2">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute text-xs font-bold text-gray-700">
          {percentage}%
        </div>
      </div>
    )
  }

  // Composant de graphique en barres simple
  const BarChart = ({ data, height = 180, color = '#10b981' }: BarChartProps) => {
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

  // Chargement auth
  if (authLoading) {
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
  if (userRole !== 'admin') {
    return <Navigate to="/catalog" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre de la page */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600">Vue d'ensemble de votre marketplace</p>
        </div>

        {/* Stats du mois en cours */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Carte Produits */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[100px] flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-gray-600">Produits</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyStats.productsCount}</p>
                <span className="text-xs text-gray-500 mt-1">Total</span>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </div>

          {/* Carte Commandes */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[100px] flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-gray-600">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyStats.ordersCount}</p>
                <span className="text-xs text-gray-500 mt-1">ce mois-ci</span>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </div>

          {/* Carte Chiffre d'affaires */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[100px] flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalRevenue.toFixed(0)}€</p>
                <span className="text-xs text-gray-500 mt-1">ce mois-ci</span>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>

          {/* Carte En attente */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[100px] flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyStats.pendingOrders}</p>
                <span className="text-xs text-gray-500 mt-1">ce mois-ci</span>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </div>
        </div>

        {/* Graphique de performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 whitespace-nowrap">📈 Performance hebdomadaire</h3>
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
            color="#10b981"
            height={180}
          />
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/products/add" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-2xl">➕</div>
              <p className="text-sm font-medium text-gray-900">Ajouter produit</p>
            </a>
            <a href="/admin/products" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-2xl">📦</div>
              <p className="text-sm font-medium text-gray-900">Gérer produits</p>
            </a>
            <a href="/admin/orders" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-2xl">📋</div>
              <p className="text-sm font-medium text-gray-900">Voir commandes</p>
            </a>
            <a href="/admin/settings" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-2xl">⚙️</div>
              <p className="text-sm font-medium text-gray-900">Paramètres</p>
            </a>
            <a href="/admin/users" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-2xl">👤</div>
              <p className="text-sm font-medium text-gray-900">Utilisateurs</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard