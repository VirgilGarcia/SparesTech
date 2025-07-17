export const security = {
  // Générer un token CSRF
  generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  },

  // Valider un token CSRF
  validateCSRFToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) return false
    return token === storedToken
  },

  // Nettoyer les données d'entrée
  sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item))
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value)
      }
      return sanitized
    }
    
    return data
  },

  // Nettoyer une chaîne de caractères
  sanitizeString(str: string): string {
    if (typeof str !== 'string') return str
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Supprimer les balises HTML
      .replace(/javascript:/gi, '') // Supprimer les protocoles dangereux
      .replace(/on\w+=/gi, '') // Supprimer les événements inline
      .replace(/data:/gi, '') // Supprimer les protocoles data
      .replace(/vbscript:/gi, '') // Supprimer VBScript
      .replace(/expression\(/gi, '') // Supprimer les expressions CSS
      .replace(/url\(/gi, '') // Supprimer les URLs CSS
      .replace(/import\(/gi, '') // Supprimer les imports CSS
      .replace(/eval\(/gi, '') // Supprimer eval
      .replace(/setTimeout\(/gi, '') // Supprimer setTimeout
      .replace(/setInterval\(/gi, '') // Supprimer setInterval
      .replace(/Function\(/gi, '') // Supprimer Function constructor
      .replace(/document\./gi, '') // Supprimer les accès au DOM
      .replace(/window\./gi, '') // Supprimer les accès à window
      .replace(/localStorage\./gi, '') // Supprimer les accès au localStorage
      .replace(/sessionStorage\./gi, '') // Supprimer les accès au sessionStorage
  },

  // Valider les types de fichiers uploadés
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  },

  // Valider la taille des fichiers
  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  },

  // Valider les extensions de fichiers
  validateFileExtension(file: File, allowedExtensions: string[]): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase()
    return extension ? allowedExtensions.includes(extension) : false
  },

  // Créer un nom de fichier sécurisé
  createSecureFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()?.toLowerCase() || ''
    const sanitizedName = originalName
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
    
    return `${sanitizedName}_${timestamp}_${random}.${extension}`
  },

  // Valider les URLs
  validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  },

  // Valider les emails
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Limiter la fréquence des requêtes (rate limiting côté client)
  rateLimiter: {
    requests: new Map<string, number[]>(),
    
    isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
      const now = Date.now()
      const windowStart = now - windowMs
      
      if (!this.requests.has(key)) {
        this.requests.set(key, [now])
        return true
      }
      
      const requests = this.requests.get(key)!
      const recentRequests = requests.filter(time => time > windowStart)
      
      if (recentRequests.length >= maxRequests) {
        return false
      }
      
      recentRequests.push(now)
      this.requests.set(key, recentRequests)
      return true
    },
    
    clear(): void {
      this.requests.clear()
    }
  },

  // Valider les données de formulaire
  validateFormData(data: Record<string, any>, schema: Record<string, (value: any) => boolean>): {
    isValid: boolean
    errors: Record<string, string>
  } {
    const errors: Record<string, string> = {}
    
    for (const [field, validator] of Object.entries(schema)) {
      if (!validator(data[field])) {
        errors[field] = `Le champ ${field} est invalide`
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
} 