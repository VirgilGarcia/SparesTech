import { supabase } from '../../../lib/supabase'
import { getCurrentTenantId } from '../../../shared/utils/tenantUtils'
import type { Product } from '../productService'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ProductValidationService {
  validateProductData(product: Partial<Product>): ValidationResult {
    const errors: string[] = []

    // Validation du nom
    if (!product.name || product.name.trim().length === 0) {
      errors.push('Le nom du produit est requis')
    }

    if (product.name && product.name.length > 255) {
      errors.push('Le nom du produit ne peut pas dépasser 255 caractères')
    }

    // Validation de la référence
    if (!product.reference || product.reference.trim().length === 0) {
      errors.push('La référence du produit est requise')
    }

    if (product.reference && product.reference.length > 100) {
      errors.push('La référence ne peut pas dépasser 100 caractères')
    }

    // Validation du prix
    if (product.prix === undefined || product.prix === null) {
      errors.push('Le prix est requis')
    }

    if (product.prix !== undefined && product.prix < 0) {
      errors.push('Le prix ne peut pas être négatif')
    }

    if (product.prix !== undefined && product.prix > 999999.99) {
      errors.push('Le prix ne peut pas dépasser 999,999.99')
    }

    // Validation du stock
    if (product.stock === undefined || product.stock === null) {
      errors.push('Le stock est requis')
    }

    if (product.stock !== undefined && product.stock < 0) {
      errors.push('Le stock ne peut pas être négatif')
    }

    if (product.stock !== undefined && product.stock > 999999) {
      errors.push('Le stock ne peut pas dépasser 999,999')
    }

    // Validation de l'URL de la photo
    if (product.photo_url && !this.isValidUrl(product.photo_url)) {
      errors.push('L\'URL de la photo n\'est pas valide')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async validateReference(reference: string, excludeId?: string): Promise<boolean> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    let query = supabase
      .from('products')
      .select('id')
      .eq('reference', reference)
      .eq('tenant_id', tenantId)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query.limit(1)

    if (error) throw error
    return data.length === 0
  }

  async validateProductBeforeCreate(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationResult> {
    const basicValidation = this.validateProductData(product)
    if (!basicValidation.isValid) {
      return basicValidation
    }

    // Vérifier l'unicité de la référence
    const isReferenceUnique = await this.validateReference(product.reference)
    if (!isReferenceUnique) {
      return {
        isValid: false,
        errors: ['Cette référence existe déjà']
      }
    }

    return { isValid: true, errors: [] }
  }

  async validateProductBeforeUpdate(id: string, updates: Partial<Product>): Promise<ValidationResult> {
    const basicValidation = this.validateProductData(updates)
    if (!basicValidation.isValid) {
      return basicValidation
    }

    // Vérifier l'unicité de la référence si elle a été modifiée
    if (updates.reference) {
      const isReferenceUnique = await this.validateReference(updates.reference, id)
      if (!isReferenceUnique) {
        return {
          isValid: false,
          errors: ['Cette référence existe déjà']
        }
      }
    }

    return { isValid: true, errors: [] }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  validateStock(stock: number): ValidationResult {
    const errors: string[] = []

    if (stock < 0) {
      errors.push('Le stock ne peut pas être négatif')
    }

    if (stock > 999999) {
      errors.push('Le stock ne peut pas dépasser 999,999')
    }

    if (!Number.isInteger(stock)) {
      errors.push('Le stock doit être un nombre entier')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  validatePrice(price: number): ValidationResult {
    const errors: string[] = []

    if (price < 0) {
      errors.push('Le prix ne peut pas être négatif')
    }

    if (price > 999999.99) {
      errors.push('Le prix ne peut pas dépasser 999,999.99')
    }

    // Vérifier que le prix n'a pas plus de 2 décimales
    if (Math.round(price * 100) / 100 !== price) {
      errors.push('Le prix ne peut pas avoir plus de 2 décimales')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}