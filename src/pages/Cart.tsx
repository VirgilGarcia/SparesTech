import Header from '../components/Header'
import { Link } from 'react-router-dom' 
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart()
  const { theme } = useTheme()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-medium text-gray-900 mb-6">Panier</h1>
            <div className="text-center py-12">
              <p className="text-gray-600 text-sm mb-4">Votre panier est vide</p>
              <Link 
                to="/catalog"
                className="inline-block text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Continuer vos achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-6">Panier</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des produits */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      <p className="text-gray-500 text-xs mb-1">Référence: {item.reference}</p>
                      <p className="font-semibold text-sm" style={{ color: theme.primaryColor }}>{item.price} €</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Contrôles quantité */}
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Prix total ligne */}
                      <div className="w-16 text-right">
                        <p className="font-semibold text-gray-900 text-sm">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                      
                      {/* Supprimer */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Résumé commande */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Sous-total</span>
                  <span className="font-medium text-sm">{getTotalPrice().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Livraison</span>
                  <span className="font-medium text-sm text-green-600">Gratuite</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg" style={{ color: theme.primaryColor }}>{getTotalPrice().toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              
              <Link to="/checkout">
                <button 
                  className="w-full text-white py-2.5 rounded-lg transition-colors font-medium mb-3 shadow-sm hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Passer commande
                </button>
              </Link>
              
              <Link to="/catalog" className="block w-full text-center text-gray-600 hover:text-gray-800 transition-colors text-sm">
                Continuer vos achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart