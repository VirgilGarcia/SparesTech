import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Zap, Shield, Sparkles } from 'lucide-react'
import { useMarketplaceApi, type SubscriptionPlan } from '../../hooks/api/useMarketplaceApi'
import { useAuth } from '../../shared/context/AuthContext'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'

const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Hook API
  const { getPlans } = useMarketplaceApi()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const plansData = await getPlans()
      setPlans(plansData)
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setTimeout(() => {
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        // Sauvegarder les paramètres du plan pour après la connexion
        localStorage.setItem('selectedPlan', planId)
        localStorage.setItem('selectedBilling', billingCycle)
        navigate('/login')
      } else {
        navigate(`/marketplace-checkout?plan=${planId}&billing=${billingCycle}`)
      }
    }, 300)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Sparkles className="w-12 h-12 text-blue-500" />
      case 'professional':
        return <Zap className="w-12 h-12 text-purple-500" />
      case 'enterprise':
        return <Shield className="w-12 h-12 text-amber-500" />
      default:
        return <Sparkles className="w-12 h-12 text-gray-500" />
    }
  }

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'Sur mesure'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getSavings = (plan: SubscriptionPlan) => {
    if (!plan.price_yearly) return 0
    const yearlyMonthly = plan.price_yearly / 12
    const monthlySavings = plan.price_monthly - yearlyMonthly
    return Math.round((monthlySavings / plan.price_monthly) * 100)
  }

  const breadcrumbSteps = [
    { label: 'Choisir un plan', status: 'current' as const },
    { label: 'Configuration', status: 'upcoming' as const },
    { label: 'Création', status: 'upcoming' as const }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb steps={breadcrumbSteps} />
          </div>
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Plans et tarifs
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Choisissez votre plan
              <br />
              <span className="text-blue-600">de croissance</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-3 max-w-4xl mx-auto leading-relaxed">
              Des tarifs transparents qui évoluent avec votre succès.
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-12">
              Commencez petit, grandissez sans limite. Aucun engagement, changez quand vous voulez.
            </p>
            
            {/* Billing Toggle - Plus moderne */}
            <div className="inline-flex items-center bg-gray-100 p-2 rounded-2xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annuel
                <span className="absolute -top-3 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid - Compact et moderne */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {loading ? (
              <div className="col-span-3 text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-8"></div>
                <p className="text-xl text-gray-600">Chargement des plans...</p>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl border-2 transform hover:-translate-y-2 ${
                    selectedPlan === plan.id ? 'border-blue-500 scale-105' : 'border-gray-100 hover:border-blue-200'
                  } ${plan.is_popular ? 'ring-4 ring-blue-500/20 shadow-2xl scale-105' : 'shadow-lg'}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl">
                        ⭐ Le plus populaire
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className="mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                      {getPlanIcon(plan.name)}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {plan.display_name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {plan.description}
                    </p>
                    
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatPrice(getPrice(plan))}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        /{billingCycle === 'monthly' ? 'mois' : 'an'}
                      </div>
                      {billingCycle === 'yearly' && getSavings(plan) > 0 && (
                        <div className="text-green-600 text-xs mt-2 font-semibold bg-green-50 px-3 py-1 rounded-full inline-block">
                          Économisez {getSavings(plan)}% par an
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
                      plan.is_popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.is_popular ? '🚀 Choisir ce plan' : 'Sélectionner'}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Features Comparison - Compact */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comparaison détaillée
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Toutes les fonctionnalités pour prendre la meilleure décision
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">
                        Fonctionnalités
                      </th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="px-8 py-6 text-center text-lg font-bold text-gray-900">
                          {plan.display_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">Nombre de produits</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-8 py-6 text-center text-base text-gray-700 font-medium">
                          {plan.limits?.max_products === -1 ? 'Illimité' : plan.limits?.max_products?.toLocaleString() || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">Commandes par mois</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-8 py-6 text-center text-base text-gray-700 font-medium">
                          {plan.limits?.max_orders_per_month === -1 ? 'Illimité' : plan.limits?.max_orders_per_month?.toLocaleString() || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">Domaine personnalisé</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-8 py-6 text-center">
                          {plan.custom_domain_allowed ? (
                            <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">Support prioritaire</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-8 py-6 text-center">
                          {plan.priority_support ? (
                            <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">Utilisateurs administrateurs</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-8 py-6 text-center text-base text-gray-700 font-medium">
                          {index === 0 ? '1' : index === 1 ? '3' : 'Illimité'}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">Espace de stockage</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-8 py-6 text-center text-base text-gray-700 font-medium">
                          {index === 0 ? '5 GB' : index === 1 ? '50 GB' : '500 GB'}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">API accès</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-8 py-6 text-center">
                          {index >= 1 ? (
                            <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">Analytics avancées</td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className="px-8 py-6 text-center">
                          {index >= 2 ? (
                            <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CTA Section - Compact */}
          {!user && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-3xl p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                    Prêt à transformer
                    <br />
                    votre activité ?
                  </h3>
                  <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Rejoignez des centaines d'entreprises qui développent leur chiffre d'affaires avec Spartelio
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                      onClick={() => {
                        // Sauvegarder le plan le plus populaire par défaut si aucun n'est sélectionné
                        if (!selectedPlan) {
                          const popularPlan = plans.find(p => p.is_popular)?.id || plans[0]?.id
                          if (popularPlan) {
                            localStorage.setItem('selectedPlan', popularPlan)
                            localStorage.setItem('selectedBilling', billingCycle)
                          }
                        }
                        navigate('/register')
                      }}
                      className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-base hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1"
                    >
                      Créer mon compte →
                    </button>
                    <button
                      onClick={() => navigate('/demo')}
                      className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white hover:text-blue-600 transition-all duration-300"
                    >
                      Voir la démo d'abord
                    </button>
                  </div>
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