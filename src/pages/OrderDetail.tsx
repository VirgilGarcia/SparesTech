import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMarketplaceTheme } from '../context/ThemeContext'
import Header from '../components/Header'
import { getStatusColor, getStatusLabel, formatDate, formatPrice } from '../utils/orderUtils'
import { userOrderService } from '../services/userOrderService'
import type { Order } from '../types/order'

function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && id) {
      loadOrder()
    }
  }, [user, id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError('')
      
      const orderData = await userOrderService.getUserOrder(user!.id, id!)
      
      if (!orderData) {
        setError('Commande non trouvée')
        return
      }

      setOrder(orderData)
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de la commande:', error)
      setError('Erreur lors du chargement de la commande: ' + error.message)
    } finally {
      setLoading(false)
    }
  }


  const handleBackToOrders = () => {
    navigate('/orders')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium">Chargement de la commande...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-4">Erreur</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={handleBackToOrders}
              className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux commandes
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-4">Commande non trouvée</h3>
            <p className="text-gray-600 mb-8">Cette commande n'existe pas ou vous n'avez pas les autorisations pour la consulter.</p>
            <button
              onClick={handleBackToOrders}
              className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux commandes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full px-6 lg:px-8 py-8">
        {/* Header du détail */}
        <div className="mb-8">
          <button
            onClick={handleBackToOrders}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux commandes
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">
                Commande #{order.order_number}
              </h1>
              <p className="text-gray-600">
                Passée le {formatDate(order.created_at)}
              </p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Produits commandés */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="px-6 py-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Produits commandés</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{item.product?.name || 'Produit non trouvé'}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Référence: {item.product?.reference || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Prix unitaire: {formatPrice(item.unit_price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 mb-2">Quantité: {item.quantity}</p>
                        <p className="text-lg font-semibold" style={{ color: theme.primaryColor }}>
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Informations de livraison et résumé */}
          <div className="space-y-8">
            
            {/* Résumé de la commande */}
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="px-6 py-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Résumé</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="text-gray-900">{formatPrice(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="text-gray-900">Gratuite</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="px-6 py-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Informations client</h2>
              </div>
              <div className="p-6 space-y-3">
                {order.customer_company && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Entreprise</p>
                    <p className="text-gray-700">{order.customer_company}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
                  <p className="text-gray-700">{order.customer_email}</p>
                </div>
                {order.customer_phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Téléphone</p>
                    <p className="text-gray-700">{order.customer_phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Adresse de livraison */}
            {(order.customer_address || order.customer_city || order.customer_postal_code) && (
              <div className="bg-white rounded-lg border border-gray-100">
                <div className="px-6 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-medium text-gray-900">Adresse de livraison</h2>
                </div>
                <div className="p-6 space-y-2">
                  {order.customer_address && (
                    <p className="text-gray-700">{order.customer_address}</p>
                  )}
                  {(order.customer_city || order.customer_postal_code) && (
                    <p className="text-gray-700">
                      {order.customer_postal_code} {order.customer_city}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg border border-gray-100">
                <div className="px-6 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-medium text-gray-900">Notes</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Historique du statut */}
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="px-6 py-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Suivi de commande</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-4 ${
                      ['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status) 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Commande reçue</p>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  {order.status !== 'pending' && order.status !== 'cancelled' && (
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-4 ${
                        ['confirmed', 'shipped', 'delivered'].includes(order.status) 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">Commande confirmée</p>
                        <p className="text-sm text-gray-600">{formatDate(order.updated_at)}</p>
                      </div>
                    </div>
                  )}
                  
                  {['shipped', 'delivered'].includes(order.status) && (
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-4 ${
                        ['shipped', 'delivered'].includes(order.status) 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">Commande expédiée</p>
                        <p className="text-sm text-gray-600">{formatDate(order.updated_at)}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.status === 'delivered' && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-4 bg-green-500"></div>
                      <div>
                        <p className="font-medium text-gray-900">Commande livrée</p>
                        <p className="text-sm text-gray-600">{formatDate(order.updated_at)}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.status === 'cancelled' && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-4 bg-red-500"></div>
                      <div>
                        <p className="font-medium text-gray-900">Commande annulée</p>
                        <p className="text-sm text-gray-600">{formatDate(order.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail