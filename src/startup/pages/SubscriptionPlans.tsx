import React, { useState, useEffect } from 'react'
import { startupSubscriptionService, type StartupSubscriptionPlan } from '../services/subscriptionService'
import { useNavigate } from 'react-router-dom'
import { Check, Star, Zap, Shield } from 'lucide-react'

interface SubscriptionPlansProps {
  onPlanSelected?: (planId: string) => void
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onPlanSelected }) => {
  const [plans, setPlans] = useState<StartupSubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
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

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'basic':
        return <Star className="w-8 h-8 text-blue-500" />
      case 'pro':
        return <Zap className="w-8 h-8 text-purple-500" />
      case 'enterprise':
        return <Shield className="w-8 h-8 text-gold-500" />
      default:
        return <Star className="w-8 h-8 text-gray-500" />
    }
  }

  const getPrice = (plan: StartupSubscriptionPlan) => {
    return billingCycle === 'yearly' && plan.price_yearly
      ? plan.price_yearly
      : plan.price_monthly
  }

  const getMonthlyPrice = (plan: StartupSubscriptionPlan) => {
    if (billingCycle === 'yearly' && plan.price_yearly) {
      return plan.price_yearly / 12
    }
    return plan.price_monthly
  }

  const handlePlanSelection = (planId: string) => {
    if (onPlanSelected) {
      onPlanSelected(planId)
    } else {
      navigate(`/checkout?plan=${planId}&billing=${billingCycle}`)
    }
  }

  const getSavings = (plan: StartupSubscriptionPlan) => {
    if (!plan.price_yearly) return 0
    const yearlyMonthly = plan.price_yearly / 12
    const monthlySavings = plan.price_monthly - yearlyMonthly
    return Math.round((monthlySavings / plan.price_monthly) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choisissez votre plan
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Créez votre marketplace en quelques minutes
        </p>
        
        {/* Toggle billing cycle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Annuel
          </span>
          {billingCycle === 'yearly' && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Économisez jusqu'à 20%
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isPopular = plan.name === 'pro'
          const savings = getSavings(plan)
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all hover:shadow-xl ${
                isPopular
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="mb-4 flex justify-center">
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.display_name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {getMonthlyPrice(plan).toFixed(0)}€
                  </span>
                  <span className="text-gray-600">/mois</span>
                  
                  {billingCycle === 'yearly' && savings > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      Économisez {savings}%
                    </div>
                  )}
                </div>

                {billingCycle === 'yearly' && plan.price_yearly && (
                  <div className="text-sm text-gray-500 mb-4">
                    Facturé {plan.price_yearly}€/an
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
                
                {plan.max_products && (
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Jusqu'à {plan.max_products} produits
                    </span>
                  </li>
                )}
                
                {plan.max_orders && (
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Jusqu'à {plan.max_orders} commandes/mois
                    </span>
                  </li>
                )}
                
                {plan.custom_domain_allowed && (
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Domaine personnalisé</span>
                  </li>
                )}
                
                {plan.priority_support && (
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Support prioritaire</span>
                  </li>
                )}
              </ul>

              <button
                onClick={() => handlePlanSelection(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Choisir ce plan
              </button>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Toutes les formules incluent un essai gratuit de 14 jours
        </p>
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <span>✓ Aucun engagement</span>
          <span>✓ Résiliation à tout moment</span>
          <span>✓ Support client inclus</span>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlans