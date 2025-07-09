import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import Header from '../components/Header'
import { Navigate } from 'react-router-dom'

function Checkout() {
  const { cartItems, getTotalPrice } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    company: user?.user_metadata?.company_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await orderService.createOrder({
        user_id: user!.id,
        total_amount: getTotalPrice(),
        customer_email: formData.email,
        customer_company: formData.company,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_reference: item.reference,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
      })

      navigate('/order-success')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (cartItems.length === 0) {
    return <Navigate to="/catalog" replace />
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">Finaliser la commande</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="bg-white rounded-2xl border border-stone-200 p-8">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Informations de livraison</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-stone-700 mb-2">
                  Entreprise *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-stone-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-stone-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-stone-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-stone-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="Instructions de livraison..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  loading
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {loading ? 'Validation en cours...' : 'Valider la commande'}
              </button>
            </form>
          </div>

          {/* Résumé commande */}
          <div className="bg-white rounded-2xl border border-stone-200 p-8">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Résumé de la commande</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-stone-800">{item.name}</div>
                    <div className="text-sm text-stone-600">{item.reference}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-stone-800">
                      {item.quantity} × {item.price}€ = {(item.quantity * item.price).toFixed(2)}€
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-stone-600">Sous-total</span>
                <span className="font-medium">{getTotalPrice().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-stone-600">Livraison</span>
                <span className="font-medium text-green-600">Gratuite</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-stone-800">
                <span>Total</span>
                <span className="text-emerald-600">{getTotalPrice().toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout