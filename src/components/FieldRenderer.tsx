import React from 'react'

interface FieldRendererProps {
  fieldName: string
  fieldType: 'text' | 'number' | 'textarea' | 'date' | 'url'
  value: string
  displayName: string
  context: 'catalog' | 'product'
  options?: string[]
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldName,
  fieldType,
  value,
  displayName,
  context,
  options = []
}) => {
  // Rendu pour le catalogue (design compact)
  if (context === 'catalog') {
    return <CatalogFieldRenderer fieldType={fieldType} value={value} displayName={displayName} />
  }

  // Rendu pour la page produit (design complet)
  return <ProductFieldRenderer fieldType={fieldType} value={value} displayName={displayName} options={options} />
}

// Composant pour l'affichage dans le catalogue
const CatalogFieldRenderer: React.FC<{
  fieldType: string
  value: string
  displayName: string
}> = ({ fieldType, value, displayName }) => {
  const getIcon = () => {
    switch (fieldType) {
      case 'text':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )
      case 'number':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        )

      case 'textarea':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'date':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'url':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="text-sm text-gray-600 flex items-center gap-2">
      {getIcon()}
      <span className="font-medium text-gray-700">{displayName}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}

// Composant pour l'affichage dans la page produit
const ProductFieldRenderer: React.FC<{
  fieldType: string
  value: string
  displayName: string
  options: string[]
}> = ({ fieldType, value, displayName, options }) => {
  switch (fieldType) {
    case 'text':
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <h4 className="text-sm font-semibold text-gray-700">{displayName}</h4>
          </div>
          <p className="text-gray-900">{value}</p>
        </div>
      )

    case 'number':
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <h4 className="text-sm font-semibold text-blue-800">{displayName}</h4>
          </div>
          <div className="text-2xl font-bold text-blue-900">{value}</div>
        </div>
      )



    case 'textarea':
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-sm font-semibold text-amber-800">{displayName}</h4>
          </div>
          <div className="bg-white rounded-lg p-3 border border-amber-200 min-h-[80px]">
            <p className="text-amber-900 whitespace-pre-wrap">{value}</p>
          </div>
        </div>
      )

    case 'date':
      return (
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h4 className="text-sm font-semibold text-pink-800">{displayName}</h4>
          </div>
          <div className="bg-white px-3 py-2 rounded-lg border border-pink-200">
            <span className="text-pink-900 font-medium">
              {new Date(value).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      )

    case 'url':
      return (
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h4 className="text-sm font-semibold text-cyan-800">{displayName}</h4>
          </div>
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-cyan-200 text-cyan-900 font-medium hover:bg-cyan-50 transition-colors"
          >
            <span className="truncate max-w-[200px]">{value}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )

    default:
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{displayName}</span>
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        </div>
      )
  }
}

export default FieldRenderer 