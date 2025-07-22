import { query, transaction } from '../../lib/database'
import { 
  Tenant, 
  TenantSettings, 
  UserProfile, 
  StartupUser,
  ApiResponse 
} from '../../types'
import logger from '../../lib/logger'

export class MarketplaceService {
  /**
   * Créer une nouvelle marketplace (tenant) pour un startup user
   */
  static async createMarketplace(marketplaceData: {
    name: string
    subdomain: string
    custom_domain?: string
    owner_id: string
    settings: {
      company_name: string
      logo_url?: string
      primary_color?: string
      show_prices?: boolean
      show_stock?: boolean
      show_categories?: boolean
      public_access?: boolean
      contact_email?: string
      contact_phone?: string
    }
  }): Promise<ApiResponse<Tenant>> {
    try {
      return await transaction(async (client) => {
        // Vérifier que le subdomain n'existe pas déjà
        const existingSubdomain = await client.query(
          'SELECT id FROM tenants WHERE subdomain = $1',
          [marketplaceData.subdomain]
        )

        if (existingSubdomain.rows.length > 0) {
          throw new Error('Ce sous-domaine est déjà utilisé')
        }

        // Vérifier que le custom domain n'existe pas déjà (si fourni)
        if (marketplaceData.custom_domain) {
          const existingDomain = await client.query(
            'SELECT id FROM tenants WHERE custom_domain = $1',
            [marketplaceData.custom_domain]
          )

          if (existingDomain.rows.length > 0) {
            throw new Error('Ce domaine personnalisé est déjà utilisé')
          }
        }

        // Créer le tenant
        const tenantResult = await client.query(
          `INSERT INTO tenants (name, subdomain, custom_domain, owner_id, subscription_status, is_active) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [
            marketplaceData.name,
            marketplaceData.subdomain,
            marketplaceData.custom_domain || null,
            marketplaceData.owner_id,
            'trial',
            true
          ]
        )

        const tenant = tenantResult.rows[0]

        // Créer les paramètres du tenant
        await client.query(
          `INSERT INTO tenant_settings (tenant_id, company_name, logo_url, primary_color, show_prices, show_stock, show_categories, public_access, contact_email, contact_phone) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            tenant.id,
            marketplaceData.settings.company_name,
            marketplaceData.settings.logo_url || null,
            marketplaceData.settings.primary_color || '#10b981',
            marketplaceData.settings.show_prices ?? true,
            marketplaceData.settings.show_stock ?? true,
            marketplaceData.settings.show_categories ?? true,
            marketplaceData.settings.public_access ?? true,
            marketplaceData.settings.contact_email || null,
            marketplaceData.settings.contact_phone || null
          ]
        )

        // Ajouter le propriétaire comme admin du tenant
        await client.query(
          'INSERT INTO tenant_users (tenant_id, user_id, role, is_active) VALUES ($1, $2, $3, $4)',
          [tenant.id, marketplaceData.owner_id, 'admin', true]
        )

        logger.info('Nouvelle marketplace créée', {
          tenantId: tenant.id,
          ownerId: marketplaceData.owner_id,
          subdomain: marketplaceData.subdomain,
          name: marketplaceData.name
        })

        return tenant
      })
    } catch (error: any) {
      logger.error('Erreur lors de la création de la marketplace', {
        error: error.message,
        marketplaceData
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de la marketplace'
      }
    }
  }

  /**
   * Récupérer les marketplaces d'un propriétaire
   */
  static async getOwnerMarketplaces(ownerId: string): Promise<ApiResponse<Tenant[]>> {
    try {
      const result = await query(
        `SELECT t.*, ts.company_name, ts.logo_url, ts.primary_color 
         FROM tenants t 
         LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id 
         WHERE t.owner_id = $1 
         ORDER BY t.created_at DESC`,
        [ownerId]
      )

      return {
        success: true,
        data: result.rows
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des marketplaces', {
        error: error.message,
        ownerId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des marketplaces'
      }
    }
  }

  /**
   * Récupérer une marketplace par ID
   */
  static async getMarketplaceById(tenantId: string): Promise<ApiResponse<Tenant>> {
    try {
      const result = await query(
        `SELECT t.*, ts.company_name, ts.logo_url, ts.primary_color, ts.show_prices, ts.show_stock, ts.show_categories, ts.public_access, ts.contact_email, ts.contact_phone
         FROM tenants t 
         LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id 
         WHERE t.id = $1`,
        [tenantId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Marketplace non trouvée'
        }
      }

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération de la marketplace', {
        error: error.message,
        tenantId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de la marketplace'
      }
    }
  }

  /**
   * Récupérer une marketplace par subdomain
   */
  static async getMarketplaceBySubdomain(subdomain: string): Promise<ApiResponse<Tenant>> {
    try {
      const result = await query(
        `SELECT t.*, ts.company_name, ts.logo_url, ts.primary_color, ts.show_prices, ts.show_stock, ts.show_categories, ts.public_access, ts.contact_email, ts.contact_phone
         FROM tenants t 
         LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id 
         WHERE t.subdomain = $1 AND t.is_active = true`,
        [subdomain]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Marketplace non trouvée'
        }
      }

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération de la marketplace par subdomain', {
        error: error.message,
        subdomain
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de la marketplace'
      }
    }
  }

  /**
   * Mettre à jour les paramètres d'une marketplace
   */
  static async updateMarketplaceSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<ApiResponse<TenantSettings>> {
    try {
      // Construire la requête UPDATE dynamiquement
      const fields = Object.keys(settings).filter(key => settings[key as keyof typeof settings] !== undefined)
      const values = fields.map(key => settings[key as keyof typeof settings])
      
      if (fields.length === 0) {
        return {
          success: false,
          error: 'Aucune donnée à mettre à jour'
        }
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
      
      const result = await query(
        `UPDATE tenant_settings 
         SET ${setClause}, updated_at = NOW() 
         WHERE tenant_id = $1 
         RETURNING *`,
        [tenantId, ...values]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Paramètres de marketplace non trouvés'
        }
      }

      logger.info('Paramètres marketplace mis à jour', { tenantId })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour des paramètres marketplace', {
        error: error.message,
        tenantId,
        settings
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour des paramètres'
      }
    }
  }

  /**
   * Supprimer/désactiver une marketplace
   */
  static async deleteMarketplace(tenantId: string, ownerId: string): Promise<ApiResponse<boolean>> {
    try {
      // Vérifier que l'utilisateur est bien le propriétaire
      const tenantResult = await query(
        'SELECT owner_id FROM tenants WHERE id = $1',
        [tenantId]
      )

      if (tenantResult.rows.length === 0) {
        return {
          success: false,
          error: 'Marketplace non trouvée'
        }
      }

      if (tenantResult.rows[0].owner_id !== ownerId) {
        return {
          success: false,
          error: 'Seul le propriétaire peut supprimer la marketplace'
        }
      }

      // Désactiver plutôt que supprimer (soft delete)
      await query(
        'UPDATE tenants SET is_active = false, updated_at = NOW() WHERE id = $1',
        [tenantId]
      )

      logger.info('Marketplace désactivée', { tenantId, ownerId })

      return {
        success: true,
        data: true
      }
    } catch (error: any) {
      logger.error('Erreur lors de la suppression de la marketplace', {
        error: error.message,
        tenantId,
        ownerId
      })
      return {
        success: false,
        error: 'Erreur lors de la suppression de la marketplace'
      }
    }
  }

  /**
   * Vérifier si un subdomain est disponible
   */
  static async checkSubdomainAvailability(subdomain: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await query(
        'SELECT id FROM tenants WHERE subdomain = $1',
        [subdomain]
      )

      return {
        success: true,
        data: result.rows.length === 0
      }
    } catch (error: any) {
      logger.error('Erreur lors de la vérification du subdomain', {
        error: error.message,
        subdomain
      })
      return {
        success: false,
        error: 'Erreur lors de la vérification du subdomain'
      }
    }
  }

  /**
   * Générer des suggestions de sous-domaine
   */
  static async generateSubdomainSuggestions(baseName: string): Promise<ApiResponse<string[]>> {
    try {
      // Nettoyer le nom de base
      const cleanBase = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20)

      if (!cleanBase) {
        return {
          success: false,
          error: 'Nom de base invalide'
        }
      }

      const suggestions: string[] = []
      
      // Vérifier si le nom de base est disponible
      const baseAvailable = await this.checkSubdomainAvailability(cleanBase)
      if (baseAvailable.success && baseAvailable.data) {
        suggestions.push(cleanBase)
      }

      // Générer des variations
      const variations = [
        `${cleanBase}shop`,
        `${cleanBase}store`,
        `${cleanBase}marketplace`,
        `${cleanBase}parts`,
        `${cleanBase}auto`,
        `${cleanBase}spare`,
        `${cleanBase}01`,
        `${cleanBase}02`,
        `${cleanBase}03`
      ]

      // Vérifier la disponibilité de chaque variation
      for (const variation of variations) {
        if (suggestions.length >= 5) break // Limiter à 5 suggestions
        
        const available = await this.checkSubdomainAvailability(variation)
        if (available.success && available.data) {
          suggestions.push(variation)
        }
      }

      return {
        success: true,
        data: suggestions
      }
    } catch (error: any) {
      logger.error('Erreur lors de la génération des suggestions de subdomain', {
        error: error.message,
        baseName
      })
      return {
        success: false,
        error: 'Erreur lors de la génération des suggestions'
      }
    }
  }
}