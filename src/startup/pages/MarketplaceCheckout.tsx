import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { startupSubscriptionService, type StartupSubscriptionPlan } from '../services/subscriptionService'
import { startupMarketplaceService } from '../services/marketplaceService'
import { useAuth } from '../../shared/context/AuthContext'
import { CreditCard, Lock, Check, AlertCircle } from 'lucide-react'

interface CheckoutFormData {
  email: string
  first_name: string
  last_name: string
  company_name: string
  phone: string
  desired_subdomain: string
  card_number: string
  expiry_date: string
  cvv: string
  cardholder_name: string
}

const MarketplaceCheckout: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [selectedPlan, setSelectedPlan] = useState<StartupSubscriptionPlan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    desired_subdomain: '',
    card_number: '',
    expiry_date: '',
    cvv: '',
    cardholder_name: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'payment' | 'processing' | 'success'>('form')
  const [prospectId, setProspectId] = useState<string | null>(null)
  const [marketplaceUrl, setMarketplaceUrl] = useState<string | null>(null)

  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    const planId = searchParams.get('plan')
    const billing = searchParams.get('billing') as 'monthly' | 'yearly'
    
    if (!planId) {
      navigate('/plans')
      return
    }

    if (billing) {
      setBillingCycle(billing)
    }

    try {
      const plan = await startupSubscriptionService.getPlanById(planId)
      if (plan) {
        setSelectedPlan(plan)
      } else {
        navigate('/plans')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du plan:', error)
      navigate('/plans')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData(prev => ({
      ...prev,
      card_number: formatted
    }))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4)
    }
    setFormData(prev => ({
      ...prev,
      expiry_date: value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.first_name || !formData.last_name || 
        !formData.company_name || !formData.desired_subdomain) {
      return 'Veuillez remplir tous les champs obligatoires'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Email invalide'
    }

    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
    if (!subdomainRegex.test(formData.desired_subdomain)) {
      return 'Sous-domaine invalide (lettres minuscules, chiffres et tirets uniquement)'
    }

    return null
  }

  const validatePayment = () => {
    if (!formData.card_number || !formData.expiry_date || !formData.cvv || !formData.cardholder_name) {
      return 'Veuillez remplir toutes les informations de paiement'
    }

    const cardNumber = formData.card_number.replace(/\s/g, '')
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return 'Numéro de carte invalide'
    }

    if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      return 'CVV invalide'
    }

    return null
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      // For now, we'll directly create the customer and marketplace
      const result = { success: true, prospect_id: 'temp-id' }

      if (result.success && result.prospect_id) {
        setProspectId(result.prospect_id)
        setStep('payment')
      } else {
        setError(result.error || 'Erreur lors de la création du prospect')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur technique lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validatePayment()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setStep('processing')

    try {
      // Simuler un paiement (remplacer par vraie intégration)
      await new Promise(resolve => setTimeout(resolve, 3000))

      if (prospectId) {
        // await startupMarketplaceService.updateProspectStatus(prospectId, 'payment_pending')
      }

      // Créer le marketplace
      // First create the customer
      const customer = await startupMarketplaceService.createCustomer({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        phone: formData.phone
      })

      if (!customer) {
        throw new Error('Erreur lors de la création du client')
      }

      // Then create the marketplace
      const marketplaceResult = await startupMarketplaceService.createMarketplace({
        customer_id: customer.id,
        company_name: formData.company_name,
        subdomain: formData.desired_subdomain,
        plan_id: selectedPlan!.id,
        billing_cycle: 'monthly',
        public_access: true,
        primary_color: '#10b981'
      })

      if (marketplaceResult.success) {
        if (prospectId) {
          // await startupMarketplaceService.updateProspectStatus(prospectId, 'completed')
        }
        setMarketplaceUrl(marketplaceResult.marketplace_url)
        setStep('success')
      } else {
        setError(marketplaceResult.errors?.join(', ') || 'Erreur lors de la création du marketplace')
        setStep('payment')
      }
    } catch (error) {
      console.error('Erreur de paiement:', error)
      setError('Erreur lors du traitement du paiement')
      setStep('payment')
    } finally {
      setLoading(false)
    }
  }

  const getPrice = () => {
    if (!selectedPlan) return 0
    return billingCycle === 'yearly' && selectedPlan.price_yearly
      ? selectedPlan.price_yearly
      : selectedPlan.price_monthly
  }

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Création de votre marketplace...</h2>
          <p className="text-gray-600">Traitement du paiement et configuration en cours.</p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Marketplace créé avec succès !</h2>
          <p className="text-gray-600 mb-6">
            Votre marketplace est maintenant disponible à l'adresse :
          </p>
          {marketplaceUrl && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <a 
                href={`https://${marketplaceUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {marketplaceUrl}
              </a>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Vous recevrez un email avec vos informations de connexion sous peu.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.open(`https://${marketplaceUrl}/admin`, '_blank')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accéder à l'admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                {step === 'form' ? 'Créer votre marketplace' : 'Paiement'}
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {step === 'form' ? (
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sous-domaine souhaité *
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        name="desired_subdomain"
                        value={formData.desired_subdomain}
                        onChange={handleInputChange}
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="monentreprise"
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                        .spares-tech.com
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Vérification...' : 'Continuer vers le paiement'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du titulaire *
                    </label>
                    <input
                      type="text"
                      name="cardholder_name"
                      value={formData.cardholder_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de carte *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'expiration *
                      </label>
                      <input
                        type="text"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mt-4">
                    <Lock className="w-4 h-4 mr-2" />
                    <span>Paiement sécurisé SSL</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Traitement...' : `Payer ${getPrice()}€`}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-gray-50 p-8">
              <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">{selectedPlan.display_name}</h4>
                <p className="text-sm text-gray-600 mb-3">{selectedPlan.description}</p>
                
                <div className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {selectedPlan.display_name} ({billingCycle === 'yearly' ? 'Annuel' : 'Mensuel'})
                  </span>
                  <span className="font-medium">{getPrice()}€</span>
                </div>
                
                {billingCycle === 'yearly' && selectedPlan.price_yearly && (
                  <div className="text-sm text-green-600 mb-2">
                    Économisez {Math.round(((selectedPlan.price_monthly * 12) - selectedPlan.price_yearly) / (selectedPlan.price_monthly * 12) * 100)}%
                  </div>
                )}
                
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{getPrice()}€</span>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Essai gratuit de 14 jours inclus
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceCheckout