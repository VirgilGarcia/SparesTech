import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { productService } from '../services/productService'
import FieldRenderer from './FieldRenderer'
import type { Product, ProductFieldDisplay, ProductFieldValue, ProductField } from '../services/productService'

interface ProductFieldValueWithField extends ProductFieldValue {
  product_fields: ProductField
}

interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
  fieldDisplay?: ProductFieldDisplay[]
  fieldValues?: { [key: string]: string }
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showAddToCart = true, 
  fieldDisplay = [], 
  fieldValues = {} 
}) => {
  const { addToCart } = useCart()
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const shouldShowField = (fieldName: string): boolean => {
    const field = fieldDisplay.find(f => f.field_name === fieldName)
    return field ? field.show_in_catalog : true
  }

  const getFieldValue = (fieldName: string): string | null => {
    if (fieldDisplay.find(f => f.field_name === fieldName)?.field_type === 'system') {
      return product[fieldName]?.toString() || null
    } else {
      return fieldValues[fieldName] || null
    }
  }

  const getFieldDisplayName = (fieldName: string): string => {
    const field = fieldDisplay.find(f => f.field_name === fieldName)
    return field ? field.display_name : fieldName
  }

  const handleAddToCart = () => {
    addToCart(product)
  }

  // Fonction pour afficher tous les champs dans l'ordre configuré (catalogue)
  const renderOrderedFields = () => {
    const allFields = fieldDisplay
      .filter(display => display.show_in_catalog)
      .filter(display => !['visible', 'vendable', 'photo_url'].includes(display.field_name))
      .sort((a, b) => a.catalog_order - b.catalog_order)

    return allFields.map(display => {
      const value = getFieldValue(display.field_name)
      if (!value) return null

      // Rendu spécial pour certains champs système
      if (display.field_type === 'system') {
        if (display.field_name === 'name') {
          return (
            <Link key={display.id} to={`/product/${product.id}`} className="block group">
              <h3 className="text-sm font-semibold text-gray-900 transition-all duration-200 group-hover:opacity-80 line-clamp-2 leading-tight">
                {value}
              </h3>
            </Link>
          )
        }
        if (display.field_name === 'reference') {
          return (
            <div key={display.id} className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
              </svg>
              <span className="font-mono">{value}</span>
            </div>
          )
        }
        if (display.field_name === 'prix') {
          return (
            <div key={display.id} className="text-lg font-bold" style={{ color: theme.primaryColor }}>
              {value}€
            </div>
          )
        }
        if (display.field_name === 'stock') {
          return (
            <div key={display.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              product.stock > 10 
                ? 'bg-green-100 text-green-700' 
                : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              {product.stock > 0 ? `${value}` : 'Rupture'}
            </div>
          )
        }
        // Autres champs système (fallback)
        return (
          <div key={display.id} className="text-xs text-gray-600">
            <span className="font-medium text-gray-700">{getFieldDisplayName(display.field_name)}:</span> {value}
          </div>
        )
      } else {
        // Champs custom : utiliser FieldRenderer si besoin
        return (
          <div key={display.id} className="text-xs text-gray-600">
            <span className="font-medium text-gray-700">{getFieldDisplayName(display.field_name)}:</span> <FieldRenderer type={display.field_type} value={value} />
          </div>
        )
      }
    })
  }

  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image avec overlay */}
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
          <img 
            src={product.photo_url || '/default-product-image.svg'} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-product-image.svg';
            }}
          />
        </div>
        
        {/* Overlay au survol */}
        <div className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isHovered ? 'opacity-15' : 'opacity-0'
        }`}></div>

        {/* Badges de statut */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.vendable && (
            <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm">
              ⛔
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm">
              🔴
            </span>
          )}
        </div>

        {/* Bouton rapide au survol */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Link 
            to={`/product/${product.id}`}
            className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded font-medium shadow-lg hover:bg-white transition-colors text-sm"
          >
            Voir détails
          </Link>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-3 space-y-2">


        {/* Champs affichés dans l'ordre configuré */}
        <div className="space-y-1.5">
          {renderOrderedFields()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Link 
            to={`/product/${product.id}`}
            className="text-xs font-medium transition-colors hover:opacity-80 flex items-center gap-1"
            style={{ color: theme.primaryColor }}
          >
            <span>Détails</span>
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          {showAddToCart && (
            <>
              {product.vendable && product.stock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="text-white px-3 py-1.5 rounded transition-all duration-200 text-xs font-medium hover:shadow-sm transform hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Ajouter</span>
                  </div>
                </button>
              ) : !product.vendable ? (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                  ⛔
                </span>
              ) : product.stock === 0 ? (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                  🔴
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