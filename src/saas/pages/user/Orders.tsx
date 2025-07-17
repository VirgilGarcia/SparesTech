import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import Header from '../../components/layout/Header'
import { getStatusColor, getStatusLabel, formatDate, formatPrice } from '../../utils/orderUtils'
import { userOrderService } from '../../services/userOrderService'
import type { Order } from '../../../shared/types/order'

function Orders() {
  const { user } = useAuth()
  const { theme } = useMarketplaceTheme()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      
      const orders = await userOrderService.getUserOrders(user!.id)
      setOrders(orders)
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des commandes:', error)
      setError('Erreur lors du chargement des commandes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }


  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium">Chargement de vos commandes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full px-6 lg:px-8 py-8">
        {/* Titre et description */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Mes Commandes</h1>
          <p className="text-gray-600">Consultez l'historique et le statut de vos commandes</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Commandes */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">Aucune commande</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'avez pas encore passé de commande. Découvrez notre catalogue pour commencer.
            </p>
            <Link 
              to="/catalog"
              className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleViewOrder(order.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          Commande #{order.order_number}
                        </h3>
                        <p className="text-gray-600">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-gray-900 mb-1">
                        {formatPrice(order.total_amount)}
                      </p>
                      <p className="text-gray-600">
                        {order.order_items?.length || 0} article{(order.order_items?.length || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Aperçu des produits */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {order.order_items?.slice(0, 3).map((item) => (
                        <span 
                          key={item.id}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium"
                          style={{ 
                            backgroundColor: `${theme.primaryColor}10`, 
                            color: theme.primaryColor 
                          }}
                        >
                          {item.product?.name} × {item.quantity}
                        </span>
                      ))}
                      {(order.order_items?.length || 0) > 3 && (
                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                          +{(order.order_items?.length || 0) - 3} autre{(order.order_items?.length || 0) - 3 > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="text-gray-600">
                      <span className="text-sm">Dernière mise à jour: {formatDate(order.updated_at)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                      <span className="text-sm font-medium mr-2">Voir le détail</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders