// Utilitaires pour les commandes

export const getStatusColor = (status: string): string => {
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

export const getStatusLabel = (status: string): string => {
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

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

export const generateOrderNumber = (index: number): string => {
  return `CMD-${String(index + 1).padStart(4, '0')}`
}