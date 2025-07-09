import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Header from '../components/Header'

function OrderSuccess() {
  const { cartItems, setCartItems } = useCart()

  useEffect(() => {
    // Vider le panier après commande réussie
    setCartItems([])
  }, [setCartItems])

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
          <div className="text-6xl text-green-600 mb-4">✅</div>
          <h1 className="text-3xl font-bold text-stone-800 mb-4">Commande confirmée !</h1>
          <p className="text-lg text-stone-600 mb-8">
            Votre commande a été enregistrée avec succès. 
            Vous recevrez un email de confirmation sous peu.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/catalog"
              className="bg-emerald-500 text-white px-8 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium"
            >
              Continuer vos achats
            </Link>
            <Link 
              to="/"
              className="bg-stone-200 text-stone-700 px-8 py-3 rounded-xl hover:bg-stone-300 transition-colors font-medium"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess