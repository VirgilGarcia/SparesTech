import { Router, Request, Response } from 'express'
import { body, param, query } from 'express-validator'
import { validate } from '../../middleware/validation'
import { requireAuth, requireStartupOwner, AuthenticatedRequest } from '../../middleware/auth'
import { MarketplaceService } from '../../services/startup/marketplaceService'
import { StartupSubscriptionService } from '../../services/startup/subscriptionService'
import logger from '../../lib/logger'

const router = Router()

/**
 * GET /startup/marketplace/plans
 * Récupérer tous les plans de subscription disponibles
 */
router.get('/plans', async (req, res) => {
  try {
    const result = await StartupSubscriptionService.getPlans()
    res.json(result)
  } catch (error: any) {
    logger.error('Erreur API récupération plans', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    })
  }
})

/**
 * GET /startup/marketplace/plans/:planId
 * Récupérer un plan spécifique
 */
router.get('/plans/:planId',
  validate([
    param('planId').isUUID()
  ]),
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { planId } = req.params
      if (!planId) {
        return res.status(400).json({ success: false, error: 'ID du plan requis' })
      }
      const result = await StartupSubscriptionService.getPlanById(planId)
      
      if (!result.success) {
        return res.status(404).json(result)
      }

      return res.json(result)
    } catch (error: any) {
      logger.error('Erreur API récupération plan', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * POST /startup/marketplace/check-subdomain
 * Vérifier la disponibilité d'un sous-domaine
 */
router.post('/check-subdomain',
  validate([
    body('subdomain').trim().isLength({ min: 2, max: 63 }).matches(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/)
  ]),
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { subdomain } = req.body
      const result = await MarketplaceService.checkSubdomainAvailability(subdomain)
      return res.json(result)
    } catch (error: any) {
      logger.error('Erreur API vérification sous-domaine', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * POST /startup/marketplace/suggest-subdomains
 * Générer des suggestions de sous-domaines
 */
router.post('/suggest-subdomains',
  validate([
    body('base_name').trim().isLength({ min: 2, max: 50 })
  ]),
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { base_name } = req.body
      const result = await MarketplaceService.generateSubdomainSuggestions(base_name)
      return res.json(result)
    } catch (error: any) {
      logger.error('Erreur API suggestions sous-domaines', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * POST /startup/marketplace/create
 * Créer un nouveau marketplace
 */
router.post('/create',
  requireAuth,
  requireStartupOwner,
  validate([
    body('company_name').trim().isLength({ min: 2, max: 100 }),
    body('admin_first_name').trim().isLength({ min: 2, max: 50 }),
    body('admin_last_name').trim().isLength({ min: 2, max: 50 }),
    body('admin_email').isEmail().normalizeEmail(),
    body('subdomain').trim().isLength({ min: 2, max: 63 }).matches(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/),
    body('custom_domain').optional().trim().isFQDN(),
    body('public_access').isBoolean(),
    body('primary_color').optional().matches(/^#[0-9A-F]{6}$/i),
    body('plan_id').isUUID(),
    body('billing_cycle').isIn(['monthly', 'yearly'])
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user.id
      const marketplaceData = req.body

      const result = await MarketplaceService.createMarketplace({
        ...marketplaceData,
        owner_id: userId
      })

      if (!result.success) {
        return res.status(400).json(result)
      }

      logger.info('Marketplace créé via API', { 
        userId, 
        tenantId: result.data?.id,
        subdomain: marketplaceData.subdomain 
      })

      return res.status(201).json(result)

    } catch (error: any) {
      logger.error('Erreur API création marketplace', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * GET /startup/marketplace/my-marketplaces
 * Récupérer les marketplaces de l'utilisateur connecté
 */
router.get('/my-marketplaces',
  requireAuth,
  requireStartupOwner,
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user.id
      const result = await MarketplaceService.getOwnerMarketplaces(userId)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API récupération marketplaces', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * GET /startup/marketplace/subscriptions
 * Récupérer les subscriptions de l'utilisateur connecté
 */
router.get('/subscriptions',
  requireAuth,
  requireStartupOwner,
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user.id
      const result = await StartupSubscriptionService.getCustomerSubscriptions(userId)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API récupération subscriptions', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * GET /startup/marketplace/subscriptions/active
 * Récupérer la subscription active de l'utilisateur connecté
 */
router.get('/subscriptions/active',
  requireAuth,
  requireStartupOwner,
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user.id
      const result = await StartupSubscriptionService.getActiveSubscription(userId)

      if (!result.success) {
        return res.status(404).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API récupération subscription active', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

export default router