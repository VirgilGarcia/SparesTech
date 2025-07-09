import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import type { Order } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

function AdminOrders() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDelete = async (orderId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return

    try {
      await orderService.deleteOrder(orderId)
      setOrders(orders.filter(order => order.id !== orderId))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la commande')
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

  const filteredOrders = orders.filter(order => 
    filter === '' || order.status === filter
  )

  if (authLoading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="text-stone-600 hover:text-stone-800">
                ← Retour
              </Link>
              <h1 className="text-xl font-semibold text-stone-800">Gestion des Commandes</h1>
            </div>
            <div className="text-stone-600">
              {filteredOrders.length} commande(s)
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtres */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === '' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              Toutes ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              En attente ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'confirmed' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              Confirmées ({orders.filter(o => o.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('shipped')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'shipped' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              Expédiées ({orders.filter(o => o.status === 'shipped').length})
            </button>
          </div>
        </div>

        {/* Table des commandes */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left p-4 font-medium text-stone-700">Commande</th>
                  <th className="text-left p-4 font-medium text-stone-700">Client</th>
                  <th className="text-left p-4 font-medium text-stone-700">Produits</th>
                  <th className="text-left p-4 font-medium text-stone-700">Total</th>
                  <th className="text-left p-4 font-medium text-stone-700">Statut</th>
                  <th className="text-left p-4 font-medium text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-stone-600">
                      Chargement des commandes...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-stone-600">
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-stone-200 hover:bg-stone-50">
                      <td className="p-4">
                        <div className="font-medium text-stone-800">#{order.id}</div>
                        <div className="text-sm text-stone-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-stone-800">{order.customer_company}</div>
                        <div className="text-sm text-stone-600">{order.customer_email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-stone-600">
                          {order.order_items?.length || 0} produit(s)
                        </div>
                      </td>
                      <td className="p-4 font-medium text-emerald-600">
                        {order.total_amount} €
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm border-none ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link to={`/admin/orders/${order.id}`}>
                            <button className="text-blue-600 hover:text-blue-800 p-2">
                              👁️
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrders