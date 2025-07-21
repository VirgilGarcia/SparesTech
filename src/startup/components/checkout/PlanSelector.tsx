import React from 'react'
import { Check, Star } from 'lucide-react'
import type { StartupSubscriptionPlan } from '../../services/subscriptionServiceWrapper'

interface PlanSelectorProps {
  selectedPlan: StartupSubscriptionPlan
  billingCycle: 'monthly' | 'yearly'
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  billingCycle,
  onBillingCycleChange
}) => {
  const getPrice = () => {
    return billingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Récapitulatif de votre commande</h2>
        <p className="text-gray-600">Vérifiez les détails de votre abonnement</p>
      </div>

      {/* Plan sélectionné */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {selectedPlan.name}
              {selectedPlan.is_popular && (
                <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Populaire
                </span>
              )}
            </h3>
            <p className="text-gray-600 text-sm">{selectedPlan.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(getPrice())}
            </div>
            <div className="text-sm text-gray-500">
              / {billingCycle === 'monthly' ? 'mois' : 'an'}
            </div>
          </div>
        </div>
      </div>

      {/* Cycle de facturation */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Cycle de facturation</h4>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onBillingCycleChange('monthly')}
            className={`p-4 rounded-lg border-2 transition-all ${
              billingCycle === 'monthly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">Mensuel</div>
              <div className="text-sm text-gray-600">
                {formatPrice(selectedPlan.price_monthly)}/mois
              </div>
            </div>
          </button>
          <button
            onClick={() => onBillingCycleChange('yearly')}
            className={`p-4 rounded-lg border-2 transition-all ${
              billingCycle === 'yearly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">Annuel</div>
              <div className="text-sm text-gray-600">
                {formatPrice(selectedPlan.price_yearly)}/an
              </div>
              {selectedPlan.yearly_discount && (
                <div className="text-xs text-green-600 font-medium">
                  Économisez {selectedPlan.yearly_discount}%
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités incluses</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Limites */}
      {selectedPlan.limits && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Limites</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(selectedPlan.limits).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                <span className="text-sm font-medium text-gray-900">
                  {value === -1 ? 'Illimité' : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlanSelector