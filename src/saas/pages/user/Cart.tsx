import Header from '../../components/layout/Header'
import { Link } from 'react-router-dom' 
import { useCart } from '../../../shared/context/CartContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart()
  const { theme } = useMarketplaceTheme()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">Panier</h1>
            <div className="text-center py-12">
              <p className="text-gray-600 text-base mb-6">Votre panier est vide</p>
              <Link 
                to="/catalog"
                className="inline-block text-white px-6 py-3 rounded-xl transition-colors font-medium shadow-sm hover:opacity-90"
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
      
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Panier</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des produits */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base">{item.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">Référence: {item.reference}</p>
                      <p className="font-semibold text-base" style={{ color: theme.primaryColor }}>{item.prix} €</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Contrôles quantité */}
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center text-base font-medium"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium text-base">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center text-base font-medium"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Prix total ligne */}
                      <div className="w-20 text-right">
                        <p className="font-semibold text-gray-900 text-base">{(item.prix * item.quantity).toFixed(2)} €</p>
                      </div>
                      
                      {/* Supprimer */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-xl hover:bg-red-50"
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-xl font-medium text-gray-900 mb-6">Résumé</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Sous-total</span>
                  <span className="font-medium text-base">{getTotalPrice().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Livraison</span>
                  <span className="font-medium text-base text-green-600">Gratuite</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900 text-lg">Total</span>
                    <span className="font-bold text-xl" style={{ color: theme.primaryColor }}>{getTotalPrice().toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              
              <Link to="/checkout">
                <button 
                  className="w-full text-white py-3 rounded-xl transition-colors font-medium mb-4 shadow-sm hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Passer commande
                </button>
              </Link>
              
              <Link to="/catalog" className="block w-full text-center text-gray-600 hover:text-gray-800 transition-colors text-base">
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