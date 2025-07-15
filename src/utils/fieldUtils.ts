import { productStructureService } from '../services/productStructureService'
import { productService } from '../services/productService'
import type { ProductField, ProductFieldDisplay, ProductFieldValueWithField } from '../services/productService'

export const fieldUtils = {
  async loadFieldDisplay(): Promise<ProductFieldDisplay[]> {
    try {
      return await productStructureService.getAllFieldDisplay()
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration d\'affichage:', error)
      return []
    }
  },

  async loadCustomFields(): Promise<ProductField[]> {
    try {
      return await productStructureService.getAllFields()
    } catch (error) {
      console.error('Erreur lors du chargement des champs personnalisés:', error)
      return []
    }
  },

  async loadFieldValues(productId: string): Promise<{ [key: string]: string }> {
    try {
      const fieldValues = await productService.getProductFieldValues(productId) as ProductFieldValueWithField[]
      const values: { [key: string]: string } = {}
      
      fieldValues.forEach(fv => {
        if (fv.product_fields) {
          values[fv.product_fields.name] = fv.value
        }
      })
      
      return values
    } catch (error) {
      console.error('Erreur lors du chargement des valeurs des champs personnalisés:', error)
      return {}
    }
  },

  shouldShowField(fieldName: string, fieldDisplay: ProductFieldDisplay[], context: 'catalog' | 'product'): boolean {
    const field = fieldDisplay.find(f => f.field_name === fieldName)
    if (!field) return false
    
    return context === 'catalog' ? field.show_in_catalog : field.show_in_product
  },

  getFieldValue(fieldName: string, fieldDisplay: ProductFieldDisplay[], product: any, customFieldValues: { [key: string]: string }): string | null {
    const field = fieldDisplay.find(f => f.field_name === fieldName)
    
    if (field?.field_type === 'system') {
      return product?.[fieldName]?.toString() || null
    } else {
      return customFieldValues[fieldName] || null
    }
  },

  getFieldDisplayName(fieldName: string, fieldDisplay: ProductFieldDisplay[]): string {
    const field = fieldDisplay.find(f => f.field_name === fieldName)
    return field ? field.display_name : fieldName
  }
} 