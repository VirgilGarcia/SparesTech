import { Router, Request, Response } from 'express'
import { body, param, query } from 'express-validator'
import { validate } from '../../middleware/validation'
import { requireAuth, requireTenantAccess, AuthenticatedRequest } from '../../middleware/auth'
import { ProductService } from '../../services/saas/productService'
import logger from '../../lib/logger'

const router = Router()

/**
 * GET /saas/:tenantId/products
 * Récupérer les produits d'un tenant (admin)
 */
router.get('/:tenantId/products',
  requireAuth,
  requireTenantAccess,
  validate([
    param('tenantId').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim().isLength({ max: 100 }),
    query('category_id').optional().isInt(),
    query('is_visible').optional().isBoolean(),
    query('is_sellable').optional().isBoolean(),
    query('sort_by').optional().isIn(['name', 'reference', 'price', 'stock_quantity', 'created_at']),
    query('sort_order').optional().isIn(['asc', 'desc'])
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const { tenantId } = req.params
      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'ID du tenant requis' })
      }
      const queryParams = req.query

      const filters: any = {}
      if (queryParams.page) filters.page = parseInt(queryParams.page as string)
      if (queryParams.limit) filters.limit = parseInt(queryParams.limit as string)  
      if (queryParams.search) filters.search = queryParams.search as string
      if (queryParams.category_id) filters.category_id = parseInt(queryParams.category_id as string)
      if (queryParams.is_visible !== undefined) filters.is_visible = queryParams.is_visible === 'true'
      if (queryParams.is_sellable !== undefined) filters.is_sellable = queryParams.is_sellable === 'true'
      if (queryParams.sort_by) filters.sort_by = queryParams.sort_by as string
      if (queryParams.sort_order) filters.sort_order = queryParams.sort_order as 'asc' | 'desc'

      const result = await ProductService.getProducts(tenantId, filters)

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API récupération produits', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * GET /saas/:tenantId/products/public
 * Recherche publique de produits (pour les clients)
 */
router.get('/:tenantId/products/public',
  validate([
    param('tenantId').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('search').optional().trim().isLength({ max: 100 }),
    query('category_id').optional().isInt(),
    query('min_price').optional().isFloat({ min: 0 }),
    query('max_price').optional().isFloat({ min: 0 })
  ]),
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { tenantId } = req.params
      const queryParams = req.query

      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'ID du tenant requis' })
      }

      const searchParams: any = {}
      if (queryParams.page) searchParams.page = parseInt(queryParams.page as string)
      if (queryParams.limit) searchParams.limit = parseInt(queryParams.limit as string)
      if (queryParams.search) searchParams.search = queryParams.search as string
      if (queryParams.category_id) searchParams.category_id = parseInt(queryParams.category_id as string)
      if (queryParams.min_price) searchParams.min_price = parseFloat(queryParams.min_price as string)
      if (queryParams.max_price) searchParams.max_price = parseFloat(queryParams.max_price as string)

      const result = await ProductService.searchPublicProducts(tenantId, searchParams)

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API recherche produits publics', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * GET /saas/:tenantId/products/:productId
 * Récupérer un produit spécifique
 */
router.get('/:tenantId/products/:productId',
  validate([
    param('tenantId').isUUID(),
    param('productId').isUUID()
  ]),
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { tenantId, productId } = req.params
      if (!tenantId || !productId) {
        return res.status(400).json({ success: false, error: 'ID du tenant et du produit requis' })
      }
      const result = await ProductService.getProductById(tenantId, productId)

      if (!result.success) {
        return res.status(404).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API récupération produit', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * POST /saas/:tenantId/products
 * Créer un nouveau produit
 */
router.post('/:tenantId/products',
  requireAuth,
  requireTenantAccess,
  validate([
    param('tenantId').isUUID(),
    body('reference').trim().isLength({ min: 1, max: 100 }),
    body('name').trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('price').isFloat({ min: 0 }),
    body('stock_quantity').isInt({ min: 0 }),
    body('is_visible').optional().isBoolean(),
    body('is_sellable').optional().isBoolean(),
    body('featured_image_url').optional().isURL()
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const { tenantId } = req.params
      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'ID du tenant requis' })
      }
      const productData = req.body

      const result = await ProductService.createProduct(tenantId, productData)

      if (!result.success) {
        return res.status(400).json(result)
      }

      logger.info('Produit créé via API', { 
        tenantId, 
        productId: result.data?.id,
        userId: req.user.id 
      })

      return res.status(201).json(result)

    } catch (error: any) {
      logger.error('Erreur API création produit', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * PUT /saas/:tenantId/products/:productId
 * Mettre à jour un produit
 */
router.put('/:tenantId/products/:productId',
  requireAuth,
  requireTenantAccess,
  validate([
    param('tenantId').isUUID(),
    param('productId').isUUID(),
    body('reference').optional().trim().isLength({ min: 1, max: 100 }),
    body('name').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('price').optional().isFloat({ min: 0 }),
    body('stock_quantity').optional().isInt({ min: 0 }),
    body('is_visible').optional().isBoolean(),
    body('is_sellable').optional().isBoolean(),
    body('featured_image_url').optional().isURL()
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const { tenantId, productId } = req.params
      if (!tenantId || !productId) {
        return res.status(400).json({ success: false, error: 'ID du tenant et du produit requis' })
      }
      const updates = req.body

      const result = await ProductService.updateProduct(tenantId, productId, updates)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API mise à jour produit', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

/**
 * DELETE /saas/:tenantId/products/:productId
 * Supprimer un produit
 */
router.delete('/:tenantId/products/:productId',
  requireAuth,
  requireTenantAccess,
  validate([
    param('tenantId').isUUID(),
    param('productId').isUUID()
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const { tenantId, productId } = req.params
      if (!tenantId || !productId) {
        return res.status(400).json({ success: false, error: 'ID du tenant et du produit requis' })
      }

      const result = await ProductService.deleteProduct(tenantId, productId)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)

    } catch (error: any) {
      logger.error('Erreur API suppression produit', { error: error.message })
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }
)

export default router