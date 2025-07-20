import { supabaseServiceRole } from '../../lib/supabase'
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
      const { data: existingUser, error: findError } = await supabaseServiceRole
        .from('startup_users')
        .select('*')
        .eq('id', userId)
        .single()

      if (findError && findError.code !== 'PGRST116') { // PGRST116 = pas trouvé
        throw findError
      }

      if (existingUser) {
        logger.info('Profil startup existant récupéré', { userId })
        return {
          success: true,
          data: existingUser
        }
      }

      // Créer le profil startup
      const { data: newUser, error: createError } = await supabaseServiceRole
        .from('startup_users')
        .insert([{
          id: userId,
          email: userData.email.toLowerCase().trim(),
          first_name: userData.first_name.trim(),
          last_name: userData.last_name.trim(),
          company_name: userData.company_name?.trim() || null,
          phone: userData.phone?.trim() || null,
          country: 'France',
          is_active: true
        }])
        .select()
        .single()

      if (createError) {
        throw createError
      }

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
      const { data, error } = await supabaseServiceRole
        .from('startup_users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Profil startup non trouvé'
          }
        }
        throw error
      }

      return {
        success: true,
        data
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
      const { data, error } = await supabaseServiceRole
        .from('startup_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Profil startup non trouvé'
          }
        }
        throw error
      }

      return {
        success: true,
        data
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
      const { data, error } = await supabaseServiceRole
        .from('startup_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Profil startup mis à jour', { userId })
      return {
        success: true,
        data
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