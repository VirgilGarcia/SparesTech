import { query } from '../../lib/database'
import { StartupUser, ApiResponse } from '../../types'
import logger from '../../lib/logger'

export class StartupUserService {
  /**
   * Créer ou récupérer un profil startup user
   */
  static async getOrCreateProfile(userId: string, userData: {
    email: string
    first_name: string
    last_name: string
    company_name?: string
    phone?: string
  }): Promise<ApiResponse<StartupUser>> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingResult = await query(
        'SELECT * FROM startup_users WHERE id = $1',
        [userId]
      )

      if (existingResult.rows.length > 0) {
        logger.info('Profil startup existant récupéré', { userId })
        return {
          success: true,
          data: existingResult.rows[0]
        }
      }

      // Créer le profil startup
      const result = await query(
        `INSERT INTO startup_users (id, email, first_name, last_name, company_name, phone, country, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
          userId,
          userData.email.toLowerCase().trim(),
          userData.first_name.trim(),
          userData.last_name.trim(),
          userData.company_name?.trim() || null,
          userData.phone?.trim() || null,
          'France',
          true
        ]
      )

      const newUser = result.rows[0]

      logger.info('Nouveau profil startup créé', { userId, email: userData.email })
      return {
        success: true,
        data: newUser
      }

    } catch (error: any) {
      logger.error('Erreur lors de la création/récupération du profil startup', { 
        userId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la gestion du profil startup'
      }
    }
  }

  /**
   * Récupérer un profil startup par ID
   */
  static async getById(userId: string): Promise<ApiResponse<StartupUser>> {
    try {
      const result = await query(
        'SELECT * FROM startup_users WHERE id = $1',
        [userId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Profil startup non trouvé'
        }
      }

      return {
        success: true,
        data: result.rows[0]
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération du profil startup', { 
        userId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération du profil'
      }
    }
  }

  /**
   * Récupérer un profil startup par email
   */
  static async getByEmail(email: string): Promise<ApiResponse<StartupUser>> {
    try {
      const result = await query(
        'SELECT * FROM startup_users WHERE email = $1',
        [email.toLowerCase().trim()]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Profil startup non trouvé'
        }
      }

      return {
        success: true,
        data: result.rows[0]
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération du profil startup par email', { 
        email, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération du profil'
      }
    }
  }

  /**
   * Mettre à jour un profil startup
   */
  static async updateProfile(userId: string, updates: Partial<Omit<StartupUser, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<StartupUser>> {
    try {
      // Construire la requête UPDATE dynamiquement
      const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined)
      const values = fields.map(key => updates[key as keyof typeof updates])
      
      if (fields.length === 0) {
        return {
          success: false,
          error: 'Aucune donnée à mettre à jour'
        }
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
      
      const result = await query(
        `UPDATE startup_users 
         SET ${setClause}, updated_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [userId, ...values]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Profil startup non trouvé'
        }
      }

      logger.info('Profil startup mis à jour', { userId })
      return {
        success: true,
        data: result.rows[0]
      }

    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du profil startup', { 
        userId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du profil'
      }
    }
  }
}