import React, { useState } from 'react'

interface FieldDisplay {
  id: string
  field_name: string
  field_type: 'system' | 'custom'
  display_name: string
  show_in_catalog: boolean
  show_in_product: boolean
  catalog_order: number
  product_order: number
  active: boolean
}

interface DraggableFieldListProps {
  fields: FieldDisplay[]
  type: 'catalog' | 'product'
  onReorder: (updates: { id: string, catalog_order?: number, product_order?: number }[]) => void
  onToggleVisibility: (id: string, type: 'catalog' | 'product') => Promise<void>
}

const FieldItem: React.FC<{
  field: FieldDisplay
  type: 'catalog' | 'product'
  onToggleVisibility: (id: string, type: 'catalog' | 'product') => Promise<void>
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}> = ({ field, type, onToggleVisibility, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) => {
  const [isLoading, setIsLoading] = useState(false)

  const isVisible = type === 'catalog' ? field.show_in_catalog : field.show_in_product
  const isRequired = field.field_name === 'photo_url' || field.field_name === 'reference'

  const handleToggleVisibility = async () => {
    setIsLoading(true)
    try {
      await onToggleVisibility(field.id, type)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Contrôles de déplacement */}
          <div className="flex flex-col space-y-1">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                canMoveUp 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                canMoveDown 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Icône du type */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            field.field_type === 'system' ? 'bg-gray-100' : 'bg-blue-100'
          }`}>
            <svg className={`w-4 h-4 ${
              field.field_type === 'system' ? 'text-gray-600' : 'text-blue-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* Informations du champ */}
          <div className="flex-1">
            <h5 className="text-sm font-medium text-gray-900">{field.display_name}</h5>
            <p className="text-xs text-gray-500">Nom technique: {field.field_name}</p>
          </div>

          {/* Badge du type */}
          <span className={`px-2 py-1 text-xs rounded-full ${
            field.field_type === 'system' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {field.field_type === 'system' ? 'Système' : 'Personnalisé'}
          </span>
        </div>

        {/* Contrôle de visibilité */}
        <div className="ml-4">
          {isRequired ? (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              ⚠️ Obligatoire
            </div>
          ) : (
            <button
              onClick={handleToggleVisibility}
              disabled={isLoading}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium flex items-center space-x-2 ${
                isVisible 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>...</span>
                </>
              ) : (
                <span>{isVisible ? '✅ Visible' : '❌ Masqué'}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const DraggableFieldList: React.FC<DraggableFieldListProps> = ({
  fields,
  type,
  onReorder,
  onToggleVisibility,
}) => {
  // Trier les éléments selon l'ordre actuel
  const sortedItems = [...fields].sort((a, b) => {
    const orderA = type === 'catalog' ? a.catalog_order : a.product_order
    const orderB = type === 'catalog' ? b.catalog_order : b.product_order
    return orderA - orderB
  })

  const handleMoveUp = (index: number) => {
    if (index === 0) return // Déjà en haut

    const newItems = [...sortedItems]
    const item = newItems[index]
    const itemAbove = newItems[index - 1]

    // Échanger les positions
    const tempOrder = type === 'catalog' ? item.catalog_order : item.product_order
    if (type === 'catalog') {
      item.catalog_order = itemAbove.catalog_order
      itemAbove.catalog_order = tempOrder
    } else {
      item.product_order = itemAbove.product_order
      itemAbove.product_order = tempOrder
    }

    // Créer les mises à jour
    const updates = [
      { id: item.id, [type === 'catalog' ? 'catalog_order' : 'product_order']: item[type === 'catalog' ? 'catalog_order' : 'product_order'] },
      { id: itemAbove.id, [type === 'catalog' ? 'catalog_order' : 'product_order']: itemAbove[type === 'catalog' ? 'catalog_order' : 'product_order'] }
    ]

    onReorder(updates)
  }

  const handleMoveDown = (index: number) => {
    if (index === sortedItems.length - 1) return // Déjà en bas

    const newItems = [...sortedItems]
    const item = newItems[index]
    const itemBelow = newItems[index + 1]

    // Échanger les positions
    const tempOrder = type === 'catalog' ? item.catalog_order : item.product_order
    if (type === 'catalog') {
      item.catalog_order = itemBelow.catalog_order
      itemBelow.catalog_order = tempOrder
    } else {
      item.product_order = itemBelow.product_order
      itemBelow.product_order = tempOrder
    }

    // Créer les mises à jour
    const updates = [
      { id: item.id, [type === 'catalog' ? 'catalog_order' : 'product_order']: item[type === 'catalog' ? 'catalog_order' : 'product_order'] },
      { id: itemBelow.id, [type === 'catalog' ? 'catalog_order' : 'product_order']: itemBelow[type === 'catalog' ? 'catalog_order' : 'product_order'] }
    ]

    onReorder(updates)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          Ordre d'affichage - {type === 'catalog' ? 'Catalogue' : 'Page produit'}
        </h4>
        <div className="text-sm text-gray-500">
          Utilisez les flèches pour réorganiser
        </div>
      </div>

      <div className="space-y-2">
        {sortedItems.map((field, index) => (
          <FieldItem
            key={field.id}
            field={field}
            type={type}
            onToggleVisibility={onToggleVisibility}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            canMoveUp={index > 0}
            canMoveDown={index < sortedItems.length - 1}
          />
        ))}
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm">Aucun champ à configurer</p>
        </div>
      )}
    </div>
  )
}

export default DraggableFieldList 