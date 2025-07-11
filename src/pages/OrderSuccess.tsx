import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import Header from '../components/Header'
import { CheckCircle, Package, Mail, Clock } from 'lucide-react'

function OrderSuccess() {
  const { cartItems, setCartItems } = useCart()
  const { theme } = useTheme()
  const location = useLocation()
  const { orderNumber, totalAmount } = location.state || {}

  useEffect(() => {
    // Vider le panier après commande réussie
    setCartItems([])
  }, [setCartItems])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.primaryColor}20` }}>
              <CheckCircle className="w-10 h-10" style={{ color: theme.primaryColor }} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande confirmée !</h1>
          <p className="text-lg text-gray-600 mb-8">
            Votre commande a été enregistrée avec succès. 
            Vous recevrez un email de confirmation sous peu.
          </p>

          {/* Informations de la commande */}
          {orderNumber && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-600">Numéro de commande</p>
                    <p className="text-lg font-bold text-gray-900">#{orderNumber}</p>
                  </div>
                </div>
                {totalAmount && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-gray-600">€</div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-600">Montant total</p>
                      <p className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                        {formatPrice(totalAmount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prochaines étapes */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Email de confirmation</p>
                  <p className="text-gray-600 text-sm">Reçu sous 5 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Traitement</p>
                  <p className="text-gray-600 text-sm">Sous 24-48h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Expédition</p>
                  <p className="text-gray-600 text-sm">Livraison 2-5 jours</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/orders"
              className="inline-flex items-center px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-colors"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Voir mes commandes
            </Link>
            <Link 
              to="/catalog"
              className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Continuer vos achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess