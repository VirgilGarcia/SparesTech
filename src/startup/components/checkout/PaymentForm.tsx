import React from 'react'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'

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

interface PaymentFormProps {
  formData: CheckoutFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  loading: boolean
  error: string | null
  formatCardNumber: (value: string) => string
  formatExpiryDate: (value: string) => string
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onBack,
  loading,
  error,
  formatCardNumber,
  formatExpiryDate
}) => {
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    onInputChange({
      ...e,
      target: {
        ...e.target,
        name: 'card_number',
        value: formatted
      }
    })
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    onInputChange({
      ...e,
      target: {
        ...e.target,
        name: 'expiry_date',
        value: formatted
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations de paiement</h2>
          <p className="text-gray-600">Sécurisez votre commande avec vos informations de paiement</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Nom du titulaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du titulaire de la carte *
            </label>
            <input
              type="text"
              name="cardholder_name"
              value={formData.cardholder_name}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom complet sur la carte"
            />
          </div>

          {/* Numéro de carte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline w-4 h-4 mr-1" />
              Numéro de carte *
            </label>
            <input
              type="text"
              name="card_number"
              value={formData.card_number}
              onChange={handleCardNumberChange}
              required
              maxLength={19}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          {/* Date d'expiration et CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'expiration *
              </label>
              <input
                type="text"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleExpiryChange}
                required
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/AA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV *
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={onInputChange}
                required
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123"
              />
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Paiement sécurisé</p>
                <p className="text-sm text-gray-600">Vos informations sont protégées par un chiffrement SSL</p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </div>
              ) : (
                'Finaliser la commande'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentForm