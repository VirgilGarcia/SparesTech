import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../shared/context/CartContext'
import { useAuth } from '../../../shared/context/AuthContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { orderService } from '../../services/orderService'
import { userProfileService } from '../../services/userProfileService'
import Header from '../../components/layout/Header'
import { Navigate } from 'react-router-dom'
import { ShoppingBag, User, MapPin, FileText, CreditCard, Lock, Truck } from 'lucide-react'

function Checkout() {
  const { cartItems, getTotalPrice, setCartItems } = useCart()
  const { user } = useAuth()
  const { theme } = useMarketplaceTheme()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)

  // Charger les informations du profil utilisateur
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      
      try {
        setProfileLoading(true)
        
        // Récupérer le profil utilisateur depuis la BDD
        const profile = await userProfileService.getUserProfile(user.id)

        // Pré-remplir le formulaire avec les données disponibles
        setFormData(prev => ({
          ...prev,
          company: profile?.company_name || user.user_metadata?.company_name || '',
          email: user.email || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
          city: profile?.city || '',
          postalCode: profile?.postal_code || '',
          // Les notes restent vides pour que l'utilisateur les remplisse
        }))
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const order = await orderService.createOrder({
        user_id: user!.id,
        total_amount: getTotalPrice() * 1.2, // Prix TTC
        customer_email: formData.email,
        customer_company: formData.company,
        customer_phone: formData.phone,      
        customer_address: formData.address,  
        customer_city: formData.city,        
        customer_postal_code: formData.postalCode,
        notes: formData.notes,               
        items: cartItems.map(item => ({
          product_id: Number(item.id),
          product_name: item.name,
          product_reference: item.reference,
          quantity: item.quantity,
          unit_price: item.prix,
          total_price: item.prix * item.quantity
        }))
      })

      // Sauvegarder l'adresse de livraison dans le profil utilisateur
      try {
        await userProfileService.saveDeliveryAddress(user!.id, {
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode
        })
      } catch (error) {
        console.warn('Impossible de sauvegarder l\'adresse:', error)
        // On continue même si la sauvegarde échoue
      }

      // Afficher le message de succès
      setSuccess(`Commande #${order.order_number} créée avec succès ! Redirection...`)
      
      // Vider le panier après commande réussie
      setCartItems([])
      
      // Rediriger vers la page de succès après un court délai
      setTimeout(() => {
        navigate('/order-success', { 
          state: { 
            orderNumber: order.order_number,
            totalAmount: order.total_amount
          } 
        })
      }, 2000)
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

  const subtotal = getTotalPrice()
  const tva = subtotal * 0.2
  const total = subtotal + tva

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-light text-gray-900 mb-2">Finaliser la commande</h1>
          </div>

          {/* Étapes du checkout */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-medium text-sm">Panier</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm" style={{ backgroundColor: theme.primaryColor }}>
                <User className="w-4 h-4" />
                <span className="font-medium">Informations</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-sm">
                <Lock className="w-4 h-4" />
                <span className="font-medium">Confirmation</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Informations personnelles</h2>
                {profileLoading && (
                  <span className="text-xs text-gray-500">Chargement des informations...</span>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  ❌ {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  ✅ {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-base"
                      placeholder="Nom de votre entreprise"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-base"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-base"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </form>
            </div>

            {/* Adresse de livraison */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Adresse de livraison</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-base"
                    placeholder="123 rue de la Paix"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-base"
                      placeholder="Paris"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-base"
                      placeholder="75001"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Notes de commande</h2>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions spéciales (optionnel)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-base"
                  placeholder="Instructions de livraison, demandes spéciales..."
                />
              </div>
            </div>
          </div>

          {/* Résumé commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Résumé de la commande</h2>
              
              {/* Articles */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">{item.reference}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 text-sm">
                        {item.quantity} × {item.prix}€
                      </div>
                      <div className="text-xs text-gray-600">
                        {(item.quantity * item.prix).toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Sous-total HT</span>
                  <span className="font-medium text-sm">{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">TVA (20%)</span>
                  <span className="font-medium text-sm">{tva.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Livraison</span>
                  <span className="font-medium text-sm text-green-600">Gratuite</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total TTC</span>
                    <span className="text-xl font-bold" style={{ color: theme.primaryColor }}>
                      {total.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton de commande */}
              <button
                type="submit"
                disabled={loading || profileLoading}
                onClick={handleSubmit}
                className={`w-full py-3 rounded-xl font-medium transition-colors text-base ${
                  loading || profileLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white hover:opacity-90 shadow-sm'
                }`}
                style={!loading && !profileLoading ? { backgroundColor: theme.primaryColor } : {}}
              >
                {loading ? 'Validation en cours...' : profileLoading ? 'Chargement...' : 'Valider la commande'}
              </button>

              {/* Informations sécurité */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900 text-sm">Commande sécurisée</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    Livraison gratuite
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Paiement sécurisé
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout