import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import Header from '../../components/layout/Header'
import { userOrderService } from '../../services/userOrderService'
import type { Order } from '../../../hooks/api/useOrderApi'

function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && id) {
      loadOrder()
    }
  }, [user, id])

  const loadOrder = async () => {
    if (!user || !id) return
    
    try {
      setLoading(true)
      const orderData = await userOrderService.getUserOrder(user.id, id)
      setOrder(orderData)
    } catch (err) {
      console.error('Erreur lors du chargement de la commande:', err)
      setError('Impossible de charger la commande')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">{error || 'Commande non trouvée'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Détail de la commande #{order.order_number}</h1>
        <div className="bg-white rounded-lg p-6">
          <p>Statut: {order.status}</p>
          <p>Total: {order.total_amount}€</p>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail