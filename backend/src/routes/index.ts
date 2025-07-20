import { Router } from 'express'

// Routes Startup
import startupAuthRoutes from './startup/auth'
import startupMarketplaceRoutes from './startup/marketplace'

// Routes SaaS
import saasProductRoutes from './saas/products'

const router = Router()

// === ROUTES STARTUP ===
router.use('/startup/auth', startupAuthRoutes)
router.use('/startup/marketplace', startupMarketplaceRoutes)

// === ROUTES SAAS ===
router.use('/saas', saasProductRoutes)

// === ROUTE HEALTH CHECK ===
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SparesTech Backend API - Service en ligne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// === ROUTE 404 ===
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint non trouvé',
    path: req.originalUrl,
    method: req.method
  })
})

export default router