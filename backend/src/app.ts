import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import routes from './routes'
import logger from './lib/logger'

const app = express()

// === MIDDLEWARE SÉCURITÉ ===
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.SUPABASE_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}))

// === CORS ===
app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (config.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    
    // Permettre les sous-domaines en développement
    if (config.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true)
    }
    
    logger.warn('CORS: Origine non autorisée', { origin })
    callback(new Error('Non autorisé par CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes par défaut
  max: config.RATE_LIMIT_MAX_REQUESTS, // 100 requêtes par défaut
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit dépassé', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'),
      path: req.path 
    })
    res.status(429).json({
      success: false,
      error: 'Trop de requêtes, veuillez réessayer plus tard'
    })
  }
})

// Appliquer le rate limiting à toutes les routes
app.use(limiter)

// Rate limiting plus strict pour les routes sensibles
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  skipSuccessfulRequests: true
})

app.use('/api/startup/marketplace/create', strictLimiter)

// === MIDDLEWARE PARSING ===
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// === LOGGING DES REQUÊTES ===
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('Requête HTTP', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
  })
  
  next()
})

// === ROUTES ===
app.use('/api', routes)

// === GESTION GLOBALE DES ERREURS ===
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erreur non gérée', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  })

  // Ne pas exposer les détails d'erreur en production
  const message = config.NODE_ENV === 'production' 
    ? 'Erreur interne du serveur' 
    : error.message

  res.status(500).json({
    success: false,
    error: message,
    ...(config.NODE_ENV !== 'production' && { stack: error.stack })
  })
})

// === GESTION 404 ===
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.originalUrl
  })
})

export default app