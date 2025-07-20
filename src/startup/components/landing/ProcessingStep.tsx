import React from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ProcessingStepProps {
  currentStep: string
  error?: string
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ currentStep, error }) => {
  const steps = [
    { id: 'validation', label: 'Validation des données', description: 'Vérification des informations saisies' },
    { id: 'tenant', label: 'Création du tenant', description: 'Initialisation de votre espace dédié' },
    { id: 'database', label: 'Configuration de la base de données', description: 'Mise en place des tables et structures' },
    { id: 'admin', label: 'Création du compte administrateur', description: 'Configuration de votre compte principal' },
    { id: 'settings', label: 'Configuration initiale', description: 'Application des paramètres personnalisés' },
    { id: 'finalization', label: 'Finalisation', description: 'Dernières vérifications et activation' }
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep)
  }

  const currentIndex = getCurrentStepIndex()

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Création de votre marketplace
        </h2>
        <p className="text-gray-600">
          Veuillez patienter pendant que nous configurons votre plateforme
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur lors de la création</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : isCurrent ? (
                  <div className="w-8 h-8 border-2 border-blue-500 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className={`text-sm font-medium ${
                  isCompleted ? 'text-green-600' : 
                  isCurrent ? 'text-blue-600' : 
                  'text-gray-400'
                }`}>
                  {step.label}
                </h3>
                <p className={`text-sm ${
                  isCompleted ? 'text-green-500' : 
                  isCurrent ? 'text-blue-500' : 
                  'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
              
              {isCompleted && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Terminé
                  </span>
                </div>
              )}
              
              {isCurrent && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    En cours
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Cette opération peut prendre quelques minutes. Merci de ne pas fermer cette page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessingStep