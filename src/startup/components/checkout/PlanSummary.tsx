import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import type { StartupSubscriptionPlan } from '../../services/subscriptionService'

interface PlanSummaryProps {
  selectedPlan: StartupSubscriptionPlan
  billingCycle: 'monthly' | 'yearly'
}

const PlanSummary: React.FC<PlanSummaryProps> = ({
  selectedPlan,
  billingCycle
}) => {
  const navigate = useNavigate()

  const getPrice = () => {
    return billingCycle === 'monthly' ? selectedPlan.monthly_price : selectedPlan.yearly_price
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Sur mesure'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-8">
      <div className="flex items-center space-x-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Récapitulatif</h3>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Star className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="font-bold text-gray-900">{selectedPlan.display_name}</h3>
            <p className="text-sm text-gray-600">{selectedPlan.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{formatPrice(getPrice())}</div>
          <div className="text-sm text-gray-600">/{billingCycle === 'monthly' ? 'mois' : 'an'}</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/pricing')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Changer de plan
        </button>
      </div>
    </div>
  )
}

export default PlanSummary