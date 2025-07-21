import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import logger from '../lib/logger'

// Middleware pour traiter les erreurs de validation
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): Response | void {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }))

    logger.warn('Erreurs de validation', { 
      url: req.url, 
      method: req.method, 
      errors: errorMessages 
    })

    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      errors: errorMessages
    })
  }

  next()
}

// Helper pour combiner validation + gestion d'erreurs
export function validate(validations: ValidationChain[]) {
  return [...validations, handleValidationErrors]
}