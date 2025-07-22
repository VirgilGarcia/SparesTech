import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { AuthService } from '../services/auth/authService'
import logger from '../lib/logger'

const router = Router()

/**
 * POST /api/auth/signup
 * Inscription utilisateur
 */
router.post('/signup',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit faire au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
  ],
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          errors: errors.array().map(err => err.msg)
        })
      }

      const { email, password } = req.body

      const result = await AuthService.signUp(email, password)

      if (!result.success) {
        return res.status(400).json(result)
      }

      logger.info('Nouvel utilisateur inscrit via API', { email })

      return res.status(201).json(result)

    } catch (error: any) {
      logger.error('Erreur API inscription', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * POST /api/auth/signin
 * Connexion utilisateur
 */
router.post('/signin',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    body('password')
      .notEmpty()
      .withMessage('Mot de passe requis')
  ],
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          errors: errors.array().map(err => err.msg)
        })
      }

      const { email, password } = req.body

      const result = await AuthService.signIn(email, password)

      if (!result.success) {
        return res.status(401).json(result)
      }

      logger.info('Connexion utilisateur réussie via API', { email })

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API connexion', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * POST /api/auth/signout
 * Déconnexion utilisateur (optionnel - peut être géré côté client)
 */
router.post('/signout',
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      // Pour l'instant, la déconnexion est gérée côté client
      // On pourrait ici implémenter une blacklist de tokens si nécessaire
      
      return res.json({
        success: true,
        message: 'Déconnexion réussie'
      })

    } catch (error: any) {
      logger.error('Erreur API déconnexion', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me',
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token manquant'
        })
      }

      const { user, error } = await AuthService.getUserFromToken(token)

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: error || 'Token invalide'
        })
      }

      return res.json({
        success: true,
        data: user
      })

    } catch (error: any) {
      logger.error('Erreur API récupération utilisateur', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * PATCH /api/auth/user
 * Mettre à jour les informations utilisateur
 */
router.patch('/user',
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token manquant'
        })
      }

      const { user, error } = await AuthService.getUserFromToken(token)

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: error || 'Token invalide'
        })
      }

      // Ici on pourrait implémenter la mise à jour des métadonnées
      // Pour l'instant on retourne juste l'utilisateur
      return res.json({
        success: true,
        data: user
      })

    } catch (error: any) {
      logger.error('Erreur API mise à jour utilisateur', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

export default router