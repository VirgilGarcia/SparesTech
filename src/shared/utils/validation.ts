export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Supprimer les balises HTML basiques
      .replace(/javascript:/gi, '') // Supprimer les protocoles dangereux
      .replace(/on\w+=/gi, '') // Supprimer les événements inline
  },

  validateFieldName: (name: string): boolean => {
    const fieldNameRegex = /^[a-z][a-z0-9_]*$/
    return fieldNameRegex.test(name) && name.length <= 50
  },

  validateFieldLabel: (label: string): boolean => {
    return label.trim().length > 0 && label.trim().length <= 100
  },

  validatePrice: (price: string): boolean => {
    const priceRegex = /^\d+(\.\d{1,2})?$/
    const numPrice = parseFloat(price)
    return priceRegex.test(price) && numPrice >= 0 && numPrice <= 999999.99
  },

  validateStock: (stock: string): boolean => {
    const stockRegex = /^\d+$/
    const numStock = parseInt(stock)
    return stockRegex.test(stock) && numStock >= 0 && numStock <= 999999
  },

  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/
    return phoneRegex.test(phone)
  },

  validatePostalCode: (postalCode: string): boolean => {
    const postalCodeRegex = /^[0-9]{5}$/
    return postalCodeRegex.test(postalCode)
  },

  validateReference: (reference: string): boolean => {
    return reference.trim().length > 0 && reference.trim().length <= 50
  },

  validateProductName: (name: string): boolean => {
    return name.trim().length > 0 && name.trim().length <= 200
  },

  validateCategoryName: (name: string): boolean => {
    return name.trim().length > 0 && name.trim().length <= 100
  },

  validateCompanyName: (name: string): boolean => {
    return name.trim().length > 0 && name.trim().length <= 100
  },

  validateAddress: (address: string): boolean => {
    return address.trim().length > 0 && address.trim().length <= 200
  },

  validateCity: (city: string): boolean => {
    return city.trim().length > 0 && city.trim().length <= 100
  },

  validateNotes: (notes: string): boolean => {
    return notes.length <= 1000
  }
} 