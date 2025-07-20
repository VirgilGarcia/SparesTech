import { Request, Response, NextFunction } from 'express'
import { getUserFromToken } from '../lib/supabase'
import logger from '../lib/logger'

export interface AuthenticatedRequest extends Request {
  user?: any
}

// Middleware d'authentification obligatoire
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    const { user, error } = await getUserFromToken(authHeader)

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
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    })
  }
}

// Middleware d'authentification optionnelle
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const { user } = await getUserFromToken(authHeader)
      req.user = user
    }
    next()
  } catch (error) {
    logger.error('Erreur lors de l\'authentification optionnelle', { error })
    next() // Continuer même en cas d'erreur
  }
}

// Middleware pour vérifier que l'utilisateur est propriétaire startup
export async function requireStartupOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
export async function requireTenantAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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