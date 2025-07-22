import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../../lib/database'
import { config } from '../../config'
import logger from '../../lib/logger'
import { ApiResponse } from '../../types'

export interface User {
  id: string
  email: string
  email_confirmed: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  access_token: string
}

export class AuthService {
  /**
   * Créer un utilisateur avec mot de passe hashé
   */
  static async signUp(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      )

      if (existingUser.rows.length > 0) {
        return {
          success: false,
          error: 'Un compte avec cet email existe déjà'
        }
      }

      // Hasher le mot de passe
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // Créer l'utilisateur
      const result = await query(
        `INSERT INTO users (email, password_hash) 
         VALUES ($1, $2) 
         RETURNING id, email, email_confirmed, created_at, updated_at`,
        [email.toLowerCase(), passwordHash]
      )

      const user = result.rows[0]

      // Générer le token JWT
      const accessToken = jwt.sign(
        { 
          sub: user.id, 
          email: user.email,
          iat: Math.floor(Date.now() / 1000)
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
      )

      logger.info('Nouvel utilisateur créé', { userId: user.id, email })

      return {
        success: true,
        data: {
          user,
          access_token: accessToken
        }
      }

    } catch (error: any) {
      logger.error('Erreur lors de la création du compte', { error: error.message, email })
      return {
        success: false,
        error: 'Erreur lors de la création du compte'
      }
    }
  }

  /**
   * Connexion avec email/mot de passe
   */
  static async signIn(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      // Récupérer l'utilisateur et son mot de passe hashé
      const result = await query(
        `SELECT id, email, password_hash, email_confirmed, created_at, updated_at 
         FROM users 
         WHERE email = $1`,
        [email.toLowerCase()]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect'
        }
      }

      const user = result.rows[0]

      // Vérifier le mot de passe
      const passwordValid = await bcrypt.compare(password, user.password_hash)
      if (!passwordValid) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect'
        }
      }

      // Générer le token JWT
      const accessToken = jwt.sign(
        { 
          sub: user.id, 
          email: user.email,
          iat: Math.floor(Date.now() / 1000)
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
      )

      // Supprimer le password_hash de la réponse
      const { password_hash, ...userWithoutPassword } = user

      logger.info('Connexion utilisateur réussie', { userId: user.id, email })

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          access_token: accessToken
        }
      }

    } catch (error: any) {
      logger.error('Erreur lors de la connexion', { error: error.message, email })
      return {
        success: false,
        error: 'Erreur lors de la connexion'
      }
    }
  }

  /**
   * Récupérer un utilisateur à partir d'un token JWT
   */
  static async getUserFromToken(token: string): Promise<{ user: User | null; error?: string }> {
    try {
      // Vérifier et décoder le JWT
      const decoded = jwt.verify(token, config.JWT_SECRET) as any
      
      if (!decoded.sub) {
        return { user: null, error: 'Token invalide' }
      }

      // Récupérer l'utilisateur depuis la base
      const result = await query(
        `SELECT id, email, email_confirmed, created_at, updated_at 
         FROM users 
         WHERE id = $1`,
        [decoded.sub]
      )

      if (result.rows.length === 0) {
        return { user: null, error: 'Utilisateur non trouvé' }
      }

      return { user: result.rows[0] }

    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return { user: null, error: 'Token expiré' }
      }
      
      logger.error('Erreur lors de la validation du token', { error: error.message })
      return { user: null, error: 'Token invalide' }
    }
  }

  /**
   * Changer le mot de passe d'un utilisateur
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<boolean>> {
    try {
      // Récupérer le mot de passe actuel
      const result = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Utilisateur non trouvé'
        }
      }

      const { password_hash } = result.rows[0]

      // Vérifier le mot de passe actuel
      const passwordValid = await bcrypt.compare(currentPassword, password_hash)
      if (!passwordValid) {
        return {
          success: false,
          error: 'Mot de passe actuel incorrect'
        }
      }

      // Hasher le nouveau mot de passe
      const saltRounds = 12
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

      // Mettre à jour le mot de passe
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, userId]
      )

      logger.info('Mot de passe changé', { userId })

      return {
        success: true,
        data: true
      }

    } catch (error: any) {
      logger.error('Erreur lors du changement de mot de passe', { error: error.message, userId })
      return {
        success: false,
        error: 'Erreur lors du changement de mot de passe'
      }
    }
  }
}