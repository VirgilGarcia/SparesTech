import { Router, Response } from 'express'
import { body } from 'express-validator'
import { validate } from '../../middleware/validation'
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth'
import { StartupUserService } from '../../services/startup/userService'
import logger from '../../lib/logger'

const router = Router()

/**
 * POST /startup/auth/profile
 * Créer ou récupérer le profil startup de l'utilisateur connecté
 */
router.post('/profile',
  requireAuth,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('first_name').trim().isLength({ min: 2, max: 50 }),
    body('last_name').trim().isLength({ min: 2, max: 50 }),
    body('company_name').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim().isMobilePhone('any')
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const { email, first_name, last_name, company_name, phone } = req.body
      const userId = req.user.id

      const result = await StartupUserService.getOrCreateProfile(userId, {
        email,
        first_name,
        last_name,
        company_name,
        phone
      })

      if (!result.success) {
        return res.status(400).json(result)
      }

      logger.info('Profil startup créé/récupéré via API', { userId, email })

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API profil startup', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * GET /startup/auth/profile
 * Récupérer le profil startup de l'utilisateur connecté
 */
router.get('/profile',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user.id
      const result = await StartupUserService.getById(userId)

      if (!result.success) {
        return res.status(404).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API récupération profil startup', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * PUT /startup/auth/profile
 * Mettre à jour le profil startup
 */
router.put('/profile',
  requireAuth,
  validate([
    body('first_name').optional().trim().isLength({ min: 2, max: 50 }),
    body('last_name').optional().trim().isLength({ min: 2, max: 50 }),
    body('company_name').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim().isMobilePhone('any'),
    body('address').optional().trim().isLength({ max: 200 }),
    body('city').optional().trim().isLength({ max: 100 }),
    body('postal_code').optional().trim().isLength({ max: 10 }),
    body('country').optional().trim().isLength({ max: 100 })
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user.id
      const updates = req.body

      const result = await StartupUserService.updateProfile(userId, updates)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API mise à jour profil startup', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

export default router