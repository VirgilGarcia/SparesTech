import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import type { Order } from '../../services/orderService'
import { useAuth } from '../../../shared/context/AuthContext'
import { useRole } from '../../../shared/hooks/useRole'
import { errorHandler } from '../../../shared/utils/errorHandler'
import { Toast } from '../../../shared/components/ui/Toast'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'
import Header from '../../components/layout/Header'
import { 
  EyeIcon, 
  TrashIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

function AdminOrders() {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: roleLoading } = useRole()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

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
      const message = errorHandler.getErrorMessage(error)
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId)
      await orderService.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      setToast({ message: 'Statut mis à jour avec succès', type: 'success' })
    } catch (error) {
      const message = errorHandler.getErrorMessage(error)
      setToast({ message, type: 'error' })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return

    try {
      await orderService.deleteOrder(orderToDelete)
      setOrders(orders.filter(order => order.id !== orderToDelete))
      setToast({ message: 'Commande supprimée avec succès', type: 'success' })
    } catch (error) {
      const message = errorHandler.getErrorMessage(error)
      setToast({ message, type: 'error' })
    } finally {
      setShowDeleteDialog(false)
      setOrderToDelete(null)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': 
        return {
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: ClockIcon,
          label: 'En attente'
        }
      case 'confirmed': 
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: CheckCircleIcon,
          label: 'Confirmée'
        }
      case 'shipped': 
        return {
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: TruckIcon,
          label: 'Expédiée'
        }
      case 'delivered': 
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircleIcon,
          label: 'Livrée'
        }
      case 'cancelled': 
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircleIcon,
          label: 'Annulée'
        }
      default: 
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: ClockIcon,
          label: 'Inconnu'
        }
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === '' || order.status === filter
    const matchesSearch = searchTerm === '' || 
      order.customer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    return matchesFilter && matchesSearch
  })

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">Commandes</h1>
              <p className="text-gray-600">Suivez et gérez les commandes de vos clients</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
              <div className="text-sm text-gray-600">commande(s)</div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par client, email ou numéro de commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Filtrer:</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === '' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Toutes ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              En attente ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'confirmed' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Confirmées ({orders.filter(o => o.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('shipped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'shipped' 
                  ? 'bg-purple-500 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Expédiées ({orders.filter(o => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'delivered' 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Livrées ({orders.filter(o => o.status === 'delivered').length})
            </button>
          </div>
        </div>

        {/* Table des commandes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Commande</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Client</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Produits</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Total</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Statut</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-gray-600">Chargement des commandes...</div>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="text-gray-500">
                        {searchTerm ? 'Aucune commande ne correspond à votre recherche' : 'Aucune commande trouvée'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">#{order.id}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{order.customer_company}</div>
                          <div className="text-sm text-gray-600 mt-1">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {order.order_items?.length || 0} produit(s)
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-lg text-blue-600">
                            {order.total_amount} €
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updatingStatus === order.id}
                              className={`appearance-none px-3 py-2 pr-8 rounded-lg text-sm font-medium border transition-colors ${
                                updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-80'
                              } ${statusInfo.color}`}
                            >
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmée</option>
                              <option value="shipped">Expédiée</option>
                              <option value="delivered">Livrée</option>
                              <option value="cancelled">Annulée</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {updatingStatus === order.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <StatusIcon className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Link to={`/admin/orders/${order.id}`}>
                              <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(order.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la commande ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette commande ?"
        type="danger"
      />
    </div>
  )
}

export default AdminOrders