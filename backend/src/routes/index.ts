import { Router } from 'express'

// Routes d'authentification principales
import authRoutes from './auth'

// Routes Startup
import startupAuthRoutes from './startup/auth'
import startupMarketplaceRoutes from './startup/marketplace'

// Routes SaaS
import saasProductRoutes from './saas/products'
import saasUserRoutes from './saas/users'

// Routes API principales
import productRoutes from './products'
import categoryRoutes from './categories'
import orderRoutes from './orders'
import productFieldRoutes from './product-fields'

const router = Router()

// === ROUTES AUTHENTICATION ===
router.use('/auth', authRoutes)

// === ROUTES STARTUP ===
router.use('/startup/auth', startupAuthRoutes)
router.use('/startup/marketplace', startupMarketplaceRoutes)

// === ROUTES SAAS ===
router.use('/saas/products', saasProductRoutes)
router.use('/saas/users', saasUserRoutes)

// === ROUTES API PRINCIPALES ===
router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)
router.use('/orders', orderRoutes)
router.use('/product-fields', productFieldRoutes)

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