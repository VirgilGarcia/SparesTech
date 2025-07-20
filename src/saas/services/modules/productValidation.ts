// Module obsolète - Remplacé par l'API backend

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ProductValidationService {
  static validateProductData(): ValidationResult {
    throw new Error('Module obsolète - Les validations sont maintenant gérées par l\'API backend')
  }
}