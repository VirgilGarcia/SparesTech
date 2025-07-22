import { Pool } from 'pg'
import { config } from '../config'
import logger from './logger'

// Configuration de la pool de connexions PostgreSQL
const pool = new Pool({
  host: config.DATABASE_HOST || 'localhost',
  port: parseInt(config.DATABASE_PORT || '5432'),
  database: config.DATABASE_NAME || 'sparestech_dev',
  user: config.DATABASE_USER || process.env.USER,
  password: config.DATABASE_PASSWORD,
  // Configuration de la pool
  max: 20, // Maximum de connexions dans la pool
  idleTimeoutMillis: 30000, // Fermeture des connexions inactives après 30s
  connectionTimeoutMillis: 2000, // Timeout de connexion
})

// Test de connexion au démarrage
pool.on('connect', () => {
  logger.info('Nouvelle connexion PostgreSQL établie')
})

pool.on('error', (err) => {
  logger.error('Erreur PostgreSQL:', err)
})

// Helper pour exécuter des requêtes avec gestion d'erreur
export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    logger.debug('Requête SQL exécutée', { 
      duration: `${duration}ms`, 
      rows: res.rowCount,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    })
    return res
  } catch (error) {
    const duration = Date.now() - start
    logger.error('Erreur SQL', { 
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : error,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    })
    throw error
  }
}

// Helper pour les transactions
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Test de connexion
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()')
    logger.info('✅ Connexion PostgreSQL réussie', { 
      timestamp: result.rows[0].now 
    })
    return true
  } catch (error) {
    logger.error('❌ Échec connexion PostgreSQL:', error)
    return false
  }
}

export default pool