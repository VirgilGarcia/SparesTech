import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth/authService'
import logger from '../lib/logger'

export interface AuthenticatedRequest extends Request {
  user?: any
}

// Middleware d'authentification obligatoire
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Token d\'authentification manquant', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent')
      })
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      })
    }

    const token = authHeader.substring(7) // Supprimer "Bearer "
    const { user, error } = await AuthService.getUserFromToken(token)

    if (error || !user) {
      logger.warn('Tentative d\'accès non autorisé', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        error 
      })
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      })
    }

    req.user = user
    next()
  } catch (error) {
    logger.error('Erreur lors de l\'authentification', { error })
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    })
  }
}

// Middleware d'authentification optionnelle
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { user } = await AuthService.getUserFromToken(token)
      req.user = user
    }
    next()
  } catch (error) {
    logger.error('Erreur lors de l\'authentification optionnelle', { error })
    next() // Continuer même en cas d'erreur
  }
}

// Middleware pour vérifier que l'utilisateur est propriétaire startup
export async function requireStartupOwner(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise'
    })
  }

  // TODO: Vérifier que l'utilisateur a un profil startup_users
  // Pour l'instant, on suppose que tous les utilisateurs connectés sont des startup owners
  next()
}

// Middleware pour vérifier l'accès à un tenant
export async function requireTenantAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise'
    })
  }

  const tenantId = req.params.tenantId || req.body.tenant_id

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: 'ID du tenant requis'
    })
  }

  // TODO: Vérifier que l'utilisateur a accès à ce tenant
  // soit comme propriétaire startup, soit comme membre du tenant
  next()
}