import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useMarketplaceTheme } from '../context/ThemeContext'
import FieldRenderer from './FieldRenderer'
import type { Product, ProductFieldDisplay } from '../services/productService'

interface ProductCardProps {
  product: Product
  fieldDisplay?: ProductFieldDisplay
  fieldValues?: { [key: string]: string }
  onAddToCart?: (product: Product) => void
  showPrices?: boolean
  showStock?: boolean
  userRole?: string | null
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  fieldDisplay = {}, 
  fieldValues = {},
  onAddToCart,
  showPrices = true,
  showStock = true,
  userRole
}) => {
  const { theme } = useMarketplaceTheme()

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const getFieldValue = (fieldName: string): string | null => {
    // Pour les champs système, prendre directement depuis le produit
    if (['name', 'reference', 'prix', 'stock'].includes(fieldName)) {
      return product[fieldName]?.toString() || null
    }
    // Pour les champs personnalisés, prendre depuis fieldValues
    return fieldValues[fieldName] || null
  }

  const getFieldDisplayName = (fieldName: string): string => {
    // Pour les champs système, utiliser des noms par défaut
    const systemFieldNames: { [key: string]: string } = {
      name: 'Nom',
      reference: 'Référence',
      prix: 'Prix',
      stock: 'Stock'
    }
    
    if (systemFieldNames[fieldName]) {
      return systemFieldNames[fieldName]
    }
    
    // Pour les champs personnalisés, utiliser fieldDisplay
    return fieldDisplay[fieldName]?.display_name || fieldName
  }

  const shouldShowField = (fieldName: string): boolean => {
    // Les champs système sont toujours affichés sauf si explicitement cachés
    if (['name', 'reference', 'prix', 'stock'].includes(fieldName)) {
      if (fieldName === 'prix' && !showPrices) return false
      if (fieldName === 'stock' && !showStock) return false
      return true
    }
    
    // Pour les champs personnalisés, vérifier dans fieldDisplay
    return fieldDisplay[fieldName]?.show_in_catalog ?? true
  }

  // Rendu des champs dans l'ordre configuré
  const renderFields = () => {
    // Champs système toujours affichés en premier
    const systemFieldNames = ['name', 'reference', 'prix', 'stock']
    const systemFields = systemFieldNames
      .filter(fieldName => shouldShowField(fieldName))
      .map(fieldName => ({ fieldName, type: 'system' as const, order: systemFieldNames.indexOf(fieldName) }))

    // Champs personnalisés depuis fieldDisplay
    const customFields = Object.entries(fieldDisplay)
      .filter(([fieldName]) => shouldShowField(fieldName))
      .filter(([fieldName]) => !['visible', 'vendable', 'photo_url'].includes(fieldName))
      .map(([fieldName, config]) => ({ 
        fieldName, 
        type: 'custom' as const, 
        order: config.catalog_order || 999 
      }))

    // Combiner et trier
    const allFields = [...systemFields, ...customFields]
      .sort((a, b) => a.order - b.order)

    return allFields.map(({ fieldName, type }) => {
      const value = getFieldValue(fieldName)
      if (!value) return null

      // Rendu spécial pour les champs système
      if (type === 'system') {
        if (fieldName === 'name') {
          return (
            <Link key={fieldName} to={`/product/${product.id}`} className="block group">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 leading-tight">
                {value}
              </h3>
            </Link>
          )
        }
        if (fieldName === 'reference') {
          return (
            <div key={fieldName} className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-mono">{value}</span>
            </div>
          )
        }
        if (fieldName === 'prix' && showPrices) {
          return (
            <div key={fieldName} className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
              {value}€
            </div>
          )
        }
        if (fieldName === 'stock' && showStock) {
          const stockLevel = product.stock > 10 ? 'high' : product.stock > 0 ? 'low' : 'out'
          const stockConfig = {
            high: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
            low: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
            out: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
          }
          const config = stockConfig[stockLevel]
          
          return (
            <div key={fieldName} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
              <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
              {product.stock > 0 ? `${value} en stock` : 'Rupture de stock'}
            </div>
          )
        }
        // Autres champs système
        return (
          <div key={fieldName} className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">{getFieldDisplayName(fieldName)}:</span> {value}
          </div>
        )
      } else {
        // Champs personnalisés
        const fieldConfig = fieldDisplay[fieldName]
        return (
          <div key={fieldName} className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">{getFieldDisplayName(fieldName)}:</span> 
            <FieldRenderer type={fieldConfig.field_type} value={value} />
          </div>
        )
      }
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gray-50">
          <img 
            src={product.photo_url || '/default-product-image.svg'} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-product-image.svg';
            }}
          />
        </div>

        {/* Badges de statut */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.vendable && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-sm">
              Non vendable
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-sm">
              Rupture
            </span>
          )}
        </div>


      </div>

      {/* Contenu */}
      <div className="p-6 space-y-4">
        {/* Champs affichés */}
        <div className="space-y-3">
          {renderFields()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link 
            to={`/product/${product.id}`}
            className="text-sm font-medium transition-colors hover:opacity-80 flex items-center gap-2"
            style={{ color: theme.primaryColor }}
          >
            <span>Détails</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          {onAddToCart && (
            <>
              {product.vendable && product.stock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="px-4 py-2 text-white font-medium rounded-lg transition-all hover:opacity-90 shadow-sm flex items-center gap-2"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Ajouter</span>
                </button>
              ) : !product.vendable ? (
                <span className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium">
                  Non vendable
                </span>
              ) : product.stock === 0 ? (
                <span className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">
                  Rupture
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard 