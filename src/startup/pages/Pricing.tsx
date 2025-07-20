import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Star, Zap, Shield } from 'lucide-react'
import { startupSubscriptionService, type StartupSubscriptionPlan } from '../services/subscriptionService'
import { useAuth } from '../../shared/context/AuthContext'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'

const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [plans, setPlans] = useState<StartupSubscriptionPlan[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const plansData = await startupSubscriptionService.getActivePlans()
      setPlans(plansData)
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    // Animation smooth vers le checkout
    setTimeout(() => {
      navigate(`/marketplace-checkout?plan=${planId}&billing=${billingCycle}`)
    }, 300)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Star className="w-8 h-8 text-blue-500" />
      case 'professional':
        return <Zap className="w-8 h-8 text-purple-500" />
      case 'enterprise':
        return <Shield className="w-8 h-8 text-amber-500" />
      default:
        return <Star className="w-8 h-8 text-gray-500" />
    }
  }

  const getPrice = (plan: StartupSubscriptionPlan) => {
    return billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Sur mesure'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getSavings = (plan: StartupSubscriptionPlan) => {
    if (!plan.yearly_price) return 0
    const yearlyMonthly = plan.yearly_price / 12
    const monthlySavings = plan.monthly_price - yearlyMonthly
    return Math.round((monthlySavings / plan.monthly_price) * 100)
  }

  const breadcrumbSteps = [
    { label: 'Choisir un plan', status: 'current' as const },
    { label: 'Configuration', status: 'upcoming' as const },
    { label: 'Création', status: 'upcoming' as const }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <Breadcrumb steps={breadcrumbSteps} />
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Des tarifs transparents adaptés à votre croissance. Commencez gratuitement et évoluez selon vos besoins.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`mr-3 font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className={`ml-3 font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Annuel
              </span>
              {billingCycle === 'yearly' && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Économisez jusqu'à 20%
                </span>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des plans...</p>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border-2 ${
                    selectedPlan === plan.id ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-gray-300'
                  } ${plan.is_popular ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {plan.is_popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Recommandé
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className="mb-4 flex justify-center">
                      {getPlanIcon(plan.name)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.display_name}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-gray-900">
                        {formatPrice(getPrice(plan))}
                      </div>
                      <div className="text-gray-600">
                        /{billingCycle === 'monthly' ? 'mois' : 'an'}
                      </div>
                      {billingCycle === 'yearly' && getSavings(plan) > 0 && (
                        <div className="text-green-600 text-sm mt-1 font-medium">
                          Économisez {getSavings(plan)}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                      plan.is_popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Choisir ce plan
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Features Comparison */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comparaison détaillée
              </h2>
              <p className="text-gray-600">
                Toutes les fonctionnalités pour faire le bon choix
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Fonctionnalités
                      </th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          {plan.display_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Nombre de produits</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {plan.max_products === -1 ? 'Illimité' : plan.max_products?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Commandes par mois</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {plan.max_orders_per_month === -1 ? 'Illimité' : plan.max_orders_per_month?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Domaine personnalisé</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {plan.custom_domain_allowed ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Support prioritaire</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {plan.priority_support ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Utilisateurs administrateurs</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {index === 0 ? '1' : index === 1 ? '3' : 'Illimité'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Espace de stockage</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {index === 0 ? '5 GB' : index === 1 ? '50 GB' : '500 GB'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">API accès</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {index >= 1 ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Analytics avancées</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {index >= 2 ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Sauvegarde quotidienne</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">SSL/HTTPS inclus</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CTA Section - Adapté selon l'état utilisateur */}
          {!user && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à créer votre marketplace ?
                </h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Rejoignez des milliers d'entreprises qui font confiance à SparesTech pour développer leur activité
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Créer mon compte
                  </button>
                  <button
                    onClick={() => navigate('/demo')}
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Voir la démo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pricing 