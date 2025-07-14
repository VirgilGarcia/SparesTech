import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  product: {
    name: string
    reference: string
  }
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at: string
  customer_email: string
  customer_company?: string
  customer_phone?: string
  customer_address?: string
  customer_city?: string
  customer_postal_code?: string
  notes: string | null
  order_items: OrderItem[]
}

function Orders() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // D'abord, essayons de récupérer les commandes avec une requête plus simple
  
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      
  

      // Ensuite, pour chaque commande, récupérer les items avec les produits
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order, index) => {
          // Récupérer les items de la commande
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id)

          if (itemsError) {
            console.error('❌ Erreur items pour commande', order.id, ':', itemsError)
            return {
              ...order,
              order_number: order.order_number || `CMD-${String(index + 1).padStart(4, '0')}`,
              order_items: []
            }
          }

  

          // Pour chaque item, récupérer le produit correspondant
          const itemsWithProducts = await Promise.all(
            (itemsData || []).map(async (item) => {
              const { data: productData, error: productError } = await supabase
                .from('products')
                .select('name, reference')
                .eq('id', item.product_id)
                .single()

              if (productError) {
                console.error('❌ Erreur produit pour item', item.id, ':', productError)
                return {
                  ...item,
                  product: {
                    name: `Produit ID: ${item.product_id}`,
                    reference: 'REF-UNKNOWN'
                  }
                }
              }

  

              return {
                ...item,
                product: productData
              }
            })
          )

          return {
            ...order,
            order_number: order.order_number || `CMD-${String(index + 1).padStart(4, '0')}`,
            order_items: itemsWithProducts
          }
        })
      )

  
      setOrders(ordersWithItems)
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des commandes:', error)
      setError('Erreur lors du chargement des commandes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ En attente'
      case 'confirmed':
        return '✅ Confirmée'
      case 'shipped':
        return '🚚 Expédiée'
      case 'delivered':
        return '📦 Livrée'
      case 'cancelled':
        return '❌ Annulée'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleBackToList = () => {
    setShowOrderDetail(false)
    setSelectedOrder(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Chargement des commandes...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        
        {!showOrderDetail ? (
          // Liste des commandes
          <>
            {/* Titre */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Mes Commandes</h1>
              <p className="text-sm text-gray-600">Consultez l'historique et le statut de vos commandes</p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">❌ {error}</p>
              </div>
            )}

            {/* Liste des commandes */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande</h3>
                <p className="text-gray-600 mb-4">Vous n'avez pas encore passé de commande</p>
                <Link 
                  to="/catalog"
                  className="inline-flex items-center px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Découvrir nos produits
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Commande #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.total_amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.order_items?.length || 0} article{(order.order_items?.length || 0) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Aperçu des produits */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {order.order_items?.slice(0, 3).map((item) => (
                            <span 
                              key={item.id}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {item.product?.name} × {item.quantity}
                            </span>
                          ))}
                          {(order.order_items?.length || 0) > 3 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{(order.order_items?.length || 0) - 3} autre{(order.order_items?.length || 0) - 3 > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          Dernière mise à jour: {formatDate(order.updated_at)}
                        </div>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="inline-flex items-center px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          Voir détail
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Détail d'une commande
          selectedOrder && (
            <>
              {/* Header du détail */}
              <div className="mb-6">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour aux commandes
                </button>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      Commande #{selectedOrder.order_number}
                    </h1>
                    <p className="text-sm text-gray-600">
                      Passée le {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Produits commandés */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900">Produits commandés</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {selectedOrder.order_items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{item.product?.name || 'Produit non trouvé'}</h3>
                              <p className="text-sm text-gray-600">
                                Réf: {item.product?.reference || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">Prix unitaire: {formatPrice(item.unit_price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">Qté: {item.quantity}</p>
                              <p className="text-lg font-bold" style={{ color: theme.primaryColor }}>
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
                <div className="space-y-6">
                  
                  {/* Résumé de la commande */}
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900">Résumé</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sous-total</span>
                          <span className="text-gray-900">{formatPrice(selectedOrder.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Livraison</span>
                          <span className="text-gray-900">Gratuite</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="font-bold text-lg" style={{ color: theme.primaryColor }}>
                              {formatPrice(selectedOrder.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations client */}
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900">Informations client</h2>
                    </div>
                    <div className="p-6 space-y-3">
                      {selectedOrder.customer_company && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Entreprise</p>
                          <p className="text-sm text-gray-700">{selectedOrder.customer_company}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-700">{selectedOrder.customer_email}</p>
                      </div>
                      {selectedOrder.customer_phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Téléphone</p>
                          <p className="text-sm text-gray-700">{selectedOrder.customer_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Adresse de livraison */}
                  {(selectedOrder.customer_address || selectedOrder.customer_city || selectedOrder.customer_postal_code) && (
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Adresse de livraison</h2>
                      </div>
                      <div className="p-6 space-y-2">
                        {selectedOrder.customer_address && (
                          <p className="text-sm text-gray-700">{selectedOrder.customer_address}</p>
                        )}
                        {(selectedOrder.customer_city || selectedOrder.customer_postal_code) && (
                          <p className="text-sm text-gray-700">
                            {selectedOrder.customer_postal_code} {selectedOrder.customer_city}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Notes</h2>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-700">{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Historique du statut */}
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900">Suivi de commande</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            ['pending', 'confirmed', 'shipped', 'delivered'].includes(selectedOrder.status) 
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Commande reçue</p>
                            <p className="text-xs text-gray-600">{formatDate(selectedOrder.created_at)}</p>
                          </div>
                        </div>
                        
                        {selectedOrder.status !== 'pending' && selectedOrder.status !== 'cancelled' && (
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              ['confirmed', 'shipped', 'delivered'].includes(selectedOrder.status) 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Commande confirmée</p>
                              <p className="text-xs text-gray-600">{formatDate(selectedOrder.updated_at)}</p>
                            </div>
                          </div>
                        )}
                        
                        {['shipped', 'delivered'].includes(selectedOrder.status) && (
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              ['shipped', 'delivered'].includes(selectedOrder.status) 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Commande expédiée</p>
                              <p className="text-xs text-gray-600">{formatDate(selectedOrder.updated_at)}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedOrder.status === 'delivered' && (
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Commande livrée</p>
                              <p className="text-xs text-gray-600">{formatDate(selectedOrder.updated_at)}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedOrder.status === 'cancelled' && (
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3 bg-red-500"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Commande annulée</p>
                              <p className="text-xs text-gray-600">{formatDate(selectedOrder.updated_at)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default Orders