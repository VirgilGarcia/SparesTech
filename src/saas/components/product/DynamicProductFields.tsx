import React, { useState, useEffect } from 'react'
import { productService } from '../../services/productService'
import { productStructureService } from '../../services/productStructureService'
import type { ProductField, ProductFieldDisplay } from '../../services/productService'

interface DynamicProductFieldsProps {
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
  productId?: string // Optionnel, pour charger les valeurs existantes
}

const DynamicProductFields: React.FC<DynamicProductFieldsProps> = ({ 
  values, 
  onChange, 
  productId 
}) => {
  const [fields, setFields] = useState<ProductField[]>([])
  const [fieldDisplay, setFieldDisplay] = useState<ProductFieldDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFields()
    if (productId) {
      loadExistingValues()
    }
  }, [productId])

  const loadFields = async () => {
    try {
      setLoading(true)
      const [fieldsData, displayData] = await Promise.all([
        productStructureService.getAllFields(),
        productStructureService.getAllFieldDisplay()
      ])
      setFields(fieldsData)
      setFieldDisplay(displayData)
    } catch (error) {
      console.error('Erreur lors du chargement des champs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadExistingValues = async () => {
    if (!productId) return
    
    try {
      const fieldValues = await productService.getProductFieldValues(productId)
      const existingValues: { [key: string]: string } = {}
      
      fieldValues.forEach(fv => {
        if (fv.product_fields) {
          existingValues[fv.product_fields.name] = fv.value
        }
      })
      
      onChange({ ...values, ...existingValues })
    } catch (error) {
      console.error('Erreur lors du chargement des valeurs existantes:', error)
    }
  }

  const handleFieldChange = (fieldName: string, value: string) => {
    onChange({ ...values, [fieldName]: value })
  }

  const renderField = (field: ProductField) => {
    const display = fieldDisplay.find(d => d.field_name === field.name)
    if (!display) return null

    const currentValue = values[field.name] || field.default_value || ''

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder={field.label}
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder={field.label}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={currentValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder={field.label}
            required={field.required}
          />
        )



      case 'date':
        return (
          <input
            type="date"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            required={field.required}
          />
        )

      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder={field.label}
            required={field.required}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const customFields = fields.filter(field => 
    fieldDisplay.some(display => 
      display.field_name === field.name && 
      display.field_type === 'custom'
    )
  )

  if (customFields.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Champs personnalisés
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customFields.map(field => {
          const display = fieldDisplay.find(d => d.field_name === field.name)
          if (!display) return null

          return (
            <div key={field.id}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                {display.display_name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {field.default_value && (
                <p className="text-xs text-gray-500 mt-1">
                  Valeur par défaut: {field.default_value}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DynamicProductFields 