import Header from '../components/Header'
import { Link } from 'react-router-dom' 
import { useCart } from '../context/CartContext'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-stone-800 mb-8">Panier</h1>
          <div className="text-center py-16">
            <p className="text-stone-600 text-lg mb-4">Votre panier est vide</p>
            <a href="/catalog" className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium">
              Continuer vos achats
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">Panier</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-stone-50 p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-stone-800">{item.name}</h3>
                      <p className="text-stone-600 text-sm">Référence: {item.reference}</p>
                      <p className="text-emerald-600 font-bold mt-1">{item.price} €</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Contrôles quantité */}
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Prix total ligne */}
                      <div className="w-20 text-right">
                        <p className="font-bold text-stone-800">{(item.price * item.quantity).toFixed(2)} €</p>
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
            <div className="bg-stone-50 p-6 rounded-2xl sticky top-24">
              <h3 className="text-xl font-bold text-stone-800 mb-4">Résumé</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600">Sous-total</span>
                  <span className="font-medium">{getTotalPrice().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Livraison</span>
                  <span className="font-medium">Gratuite</span>
                </div>
                <div className="border-t border-stone-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-stone-800">Total</span>
                    <span className="text-lg font-bold text-emerald-600">{getTotalPrice().toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              
              <Link to="/checkout">
                <button className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium mb-3">
                  Passer commande
                </button>
              </Link>
              
              <a href="/catalog" className="block w-full text-center text-stone-600 hover:text-stone-800 transition-colors">
                Continuer vos achats
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart