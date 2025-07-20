import app from './app'
import { config } from './config'
import logger from './lib/logger'
import fs from 'fs'
import path from 'path'

// Créer le dossier de logs s'il n'existe pas
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Gestion gracieuse des arrêts
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt gracieux du serveur...')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT reçu, arrêt gracieux du serveur...')
  process.exit(0)
})

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Exception non capturée', { error: error.message, stack: error.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejetée non gérée', { reason, promise })
  process.exit(1)
})

// Démarrage du serveur
const server = app.listen(config.PORT, () => {
  logger.info('🚀 Serveur SparesTech démarré', {
    port: config.PORT,
    environment: config.NODE_ENV,
    nodeVersion: process.version,
    pid: process.pid
  })

  if (config.NODE_ENV === 'development') {
    console.log(`
    🔥 SparesTech Backend API
    
    📍 Serveur: http://localhost:${config.PORT}
    📊 Health: http://localhost:${config.PORT}/api/health
    
    🏢 Routes Startup:
    - POST /api/startup/auth/profile
    - GET  /api/startup/marketplace/plans  
    - POST /api/startup/marketplace/create
    
    🏪 Routes SaaS:
    - GET  /api/saas/:tenantId/products
    - POST /api/saas/:tenantId/products
    
    📝 Logs: backend/logs/
    `)
  }
})

// Timeout pour les requêtes longues
server.timeout = 30000 // 30 secondes

export default server