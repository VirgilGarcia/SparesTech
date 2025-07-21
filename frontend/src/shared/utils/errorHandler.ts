interface ErrorInfo {
  message: string
  code?: string
  details?: string
}

interface SupabaseError {
  message?: string
  code?: string
  status?: number
  stack?: string
}

export const errorHandler = {
  // Erreurs génériques pour l'utilisateur
  get userFriendlyErrors() {
    return {
      AUTH_INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
      AUTH_USER_NOT_FOUND: 'Utilisateur non trouvé',
      AUTH_WEAK_PASSWORD: 'Le mot de passe est trop faible',
      AUTH_EMAIL_ALREADY_IN_USE: 'Cet email est déjà utilisé',
      AUTH_TOO_MANY_REQUESTS: 'Trop de tentatives. Veuillez réessayer plus tard',
      NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet',
      PERMISSION_DENIED: 'Vous n\'avez pas les permissions nécessaires',
      VALIDATION_ERROR: 'Les données saisies sont invalides',
      NOT_FOUND: 'Ressource non trouvée',
      SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard',
      UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite'
    }
  },

  // Traiter les erreurs Supabase
  handleSupabaseError(error: SupabaseError | Error | unknown): ErrorInfo {
    if (!error) {
      return { message: this.userFriendlyErrors.UNKNOWN_ERROR }
    }

    const errorObj = error as SupabaseError

    // Erreurs d'authentification
    if (errorObj.message?.includes('Invalid login credentials')) {
      return { message: this.userFriendlyErrors.AUTH_INVALID_CREDENTIALS }
    }

    if (errorObj.message?.includes('User not found')) {
      return { message: this.userFriendlyErrors.AUTH_USER_NOT_FOUND }
    }

    if (errorObj.message?.includes('Password should be at least')) {
      return { message: this.userFriendlyErrors.AUTH_WEAK_PASSWORD }
    }

    if (errorObj.message?.includes('already registered')) {
      return { message: this.userFriendlyErrors.AUTH_EMAIL_ALREADY_IN_USE }
    }

    if (errorObj.message?.includes('Too many requests')) {
      return { message: this.userFriendlyErrors.AUTH_TOO_MANY_REQUESTS }
    }

    // Erreurs de réseau
    if (errorObj.message?.includes('fetch') || errorObj.message?.includes('network')) {
      return { message: this.userFriendlyErrors.NETWORK_ERROR }
    }

    // Erreurs de permissions
    if (errorObj.code === 'PGRST301' || errorObj.message?.includes('permission')) {
      return { message: this.userFriendlyErrors.PERMISSION_DENIED }
    }

    // Erreurs de validation
    if (errorObj.code === 'PGRST116' || errorObj.message?.includes('validation')) {
      return { message: this.userFriendlyErrors.VALIDATION_ERROR }
    }

    // Erreurs 404
    if (errorObj.code === 'PGRST116' || errorObj.message?.includes('not found')) {
      return { message: this.userFriendlyErrors.NOT_FOUND }
    }

    // Erreurs serveur
    if (errorObj.code?.startsWith('PGRST') || (errorObj.status && errorObj.status >= 500)) {
      return { message: this.userFriendlyErrors.SERVER_ERROR }
    }

    // Erreur par défaut
    return { message: this.userFriendlyErrors.UNKNOWN_ERROR }
  },

  // Logger les erreurs pour le debugging (en développement seulement)
  logError(error: SupabaseError | Error | unknown, context?: string): void {
    if (import.meta.env.DEV) {
      console.group(`Erreur${context ? ` dans ${context}` : ''}`)
      console.error('Erreur complète:', error)
      console.error('Message:', (error as SupabaseError)?.message)
      console.error('Code:', (error as SupabaseError)?.code)
      console.error('Stack:', (error as Error)?.stack)
      console.groupEnd()
    }
  },

  // Valider et nettoyer les messages d'erreur
  sanitizeErrorMessage(message: string): string {
    if (!message) return this.userFriendlyErrors.UNKNOWN_ERROR
    
    // Supprimer les informations sensibles
    return message
      .replace(/password/gi, '***')
      .replace(/token/gi, '***')
      .replace(/key/gi, '***')
      .replace(/secret/gi, '***')
      .replace(/api/gi, '***')
      .replace(/sql/gi, '***')
      .replace(/database/gi, '***')
      .replace(/connection/gi, '***')
      .replace(/localhost/gi, '***')
      .replace(/127\.0\.0\.1/gi, '***')
      .replace(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/gi, '***')
  },

  // Créer une erreur sécurisée pour l'utilisateur
  createUserError(error: SupabaseError | Error | unknown, context?: string): ErrorInfo {
    this.logError(error, context)
    
    const supabaseError = this.handleSupabaseError(error)
    const sanitizedMessage = this.sanitizeErrorMessage(supabaseError.message)
    
    return {
      message: sanitizedMessage,
      code: supabaseError.code,
      details: context
    }
  },

  // Obtenir un message d'erreur simple pour l'utilisateur
  getErrorMessage(error: SupabaseError | Error | unknown, context?: string): string {
    return this.createUserError(error, context).message
  }
} 