import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import type { Order } from '../../services/orderService'
import { useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { Navigate } from 'react-router-dom'

function OrderDetail() {
  const { user, loading: authLoading } = useAuth()
  const { showError, showSuccess } = useToast()
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && id) {
      loadOrder()
    }
  }, [user, id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(parseInt(id!))
      setOrder(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return

    try {
      await orderService.updateOrderStatus(order.id, newStatus)
      setOrder({ ...order, status: newStatus })
      showSuccess('Statut de la commande mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      showError('Erreur lors de la mise à jour du statut')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'shipped': return 'bg-purple-100 text-purple-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Commande introuvable</h1>
          <Link to="/admin/orders" className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors">
            Retour aux commandes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/admin/orders" className="text-stone-600 hover:text-stone-800">
                ← Retour aux commandes
              </Link>
              <h1 className="text-xl font-semibold text-stone-800">Commande #{order.id}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-4 py-2 rounded-lg border-none ${getStatusColor(order.status)}`}
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Détails commande */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Détails de la commande</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-stone-600">Date de commande</div>
                  <div className="font-medium text-stone-800">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-600">Statut</div>
                  <div className={`inline-block px-3 py-1 rounded-lg text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations client</h2>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-stone-600">Entreprise</div>
                  <div className="font-medium text-stone-800">{order.customer_company}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600">Email</div>
                  <div className="font-medium text-stone-800">{order.customer_email}</div>
                </div>
                {order.notes && (
                  <div>
                    <div className="text-sm text-stone-600">Notes</div>
                    <div className="font-medium text-stone-800">{order.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Produits commandés */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Produits commandés</h2>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-medium text-stone-800">{item.product_name}</div>
                      <div className="text-sm text-stone-600">Référence: {item.product_reference}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-stone-800">
                        {item.quantity} × {item.unit_price} € = {item.total_price} €
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Résumé</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Nombre d'articles</span>
                  <span className="font-medium">
                    {order.order_items?.reduce((total, item) => total + item.quantity, 0) || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-600">Sous-total</span>
                  <span className="font-medium">{order.total_amount} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-600">Livraison</span>
                  <span className="font-medium text-green-600">Gratuite</span>
                </div>
                
                <div className="border-t border-stone-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-stone-800">Total</span>
                    <span className="text-lg font-semibold text-emerald-600">{order.total_amount} €</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium">
                  Imprimer la commande
                </button>
                <button className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium">
                  Envoyer par email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail