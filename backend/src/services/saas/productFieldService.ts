import { query, transaction } from '../../lib/database'
import { ProductField, ProductFieldValue, ApiResponse, PaginatedResponse, PaginationParams } from '../../types'
import logger from '../../lib/logger'

export class ProductFieldService {
  /**
   * Créer un nouveau champ personnalisé
   */
  static async createProductField(tenantId: string, fieldData: {
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date'
    description?: string
    is_required?: boolean
    is_visible?: boolean
    sort_order?: number
    options?: string[] // Pour les types select/multiselect
    default_value?: string
  }): Promise<ApiResponse<ProductField>> {
    try {
      // Vérifier que le nom n'existe pas déjà pour ce tenant
      const existingField = await query(
        'SELECT id FROM product_fields WHERE tenant_id = $1 AND name = $2',
        [tenantId, fieldData.name]
      )

      if (existingField.rows.length > 0) {
        return {
          success: false,
          error: 'Un champ avec ce nom existe déjà'
        }
      }

      // Valider les options pour les types select
      if (['select', 'multiselect'].includes(fieldData.type) && (!fieldData.options || fieldData.options.length === 0)) {
        return {
          success: false,
          error: 'Les champs de type select/multiselect doivent avoir des options'
        }
      }

      const result = await query(
        `INSERT INTO product_fields (
          tenant_id, name, label, type, description, is_required, is_visible, 
          sort_order, options, default_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`,
        [
          tenantId,
          fieldData.name,
          fieldData.label,
          fieldData.type,
          fieldData.description || null,
          fieldData.is_required ?? false,
          fieldData.is_visible ?? true,
          fieldData.sort_order ?? 0,
          fieldData.options ? JSON.stringify(fieldData.options) : null,
          fieldData.default_value || null
        ]
      )

      logger.info('Nouveau champ produit créé', {
        fieldId: result.rows[0].id,
        tenantId,
        name: fieldData.name,
        type: fieldData.type
      })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la création du champ produit', {
        error: error.message,
        tenantId,
        fieldData
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du champ produit'
      }
    }
  }

  /**
   * Récupérer un champ par ID
   */
  static async getProductFieldById(tenantId: string, fieldId: number): Promise<ApiResponse<ProductField>> {
    try {
      const result = await query(
        `SELECT pf.*, 
                (SELECT COUNT(*) FROM product_field_values WHERE field_id = pf.id) as values_count
         FROM product_fields pf 
         WHERE pf.tenant_id = $1 AND pf.id = $2`,
        [tenantId, fieldId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Champ produit non trouvé'
        }
      }

      // Parser les options JSON si elles existent
      const field = result.rows[0]
      if (field.options) {
        field.options = JSON.parse(field.options)
      }

      return {
        success: true,
        data: field
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération du champ produit', {
        error: error.message,
        tenantId,
        fieldId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération du champ produit'
      }
    }
  }

  /**
   * Récupérer les champs d'un tenant avec pagination et filtres
   */
  static async getProductFieldsByTenant(
    tenantId: string,
    pagination: PaginationParams,
    filters?: {
      search?: string
      type?: string
      is_required?: boolean
      is_visible?: boolean
    }
  ): Promise<PaginatedResponse<ProductField>> {
    try {
      const { page = 1, limit = 10 } = pagination
      const offset = (page - 1) * limit

      // Construire la clause WHERE
      const whereClauses = ['pf.tenant_id = $1']
      const queryParams = [tenantId]
      let paramIndex = 2

      if (filters?.search) {
        whereClauses.push(`(pf.name ILIKE $${paramIndex} OR pf.label ILIKE $${paramIndex} OR pf.description ILIKE $${paramIndex})`)
        queryParams.push(`%${filters.search}%`)
        paramIndex++
      }

      if (filters?.type) {
        whereClauses.push(`pf.type = $${paramIndex}`)
        queryParams.push(filters.type)
        paramIndex++
      }

      if (filters?.is_required !== undefined) {
        whereClauses.push(`pf.is_required = $${paramIndex}`)
        queryParams.push(filters.is_required.toString())
        paramIndex++
      }

      if (filters?.is_visible !== undefined) {
        whereClauses.push(`pf.is_visible = $${paramIndex}`)
        queryParams.push(filters.is_visible.toString())
        paramIndex++
      }

      const whereClause = whereClauses.join(' AND ')

      // Compter le total
      const countResult = await query(
        `SELECT COUNT(*) as total FROM product_fields pf WHERE ${whereClause}`,
        queryParams
      )
      const total = parseInt(countResult.rows[0].total)

      // Récupérer les champs
      const fieldsResult = await query(
        `SELECT pf.*, 
                (SELECT COUNT(*) FROM product_field_values WHERE field_id = pf.id) as values_count
         FROM product_fields pf 
         WHERE ${whereClause}
         ORDER BY pf.sort_order ASC, pf.name ASC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      )

      // Parser les options JSON pour chaque champ
      const fields = fieldsResult.rows.map(field => {
        if (field.options) {
          field.options = JSON.parse(field.options)
        }
        return field
      })

      const totalPages = Math.ceil(total / limit)

      return {
        success: true,
        data: fields,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des champs produit', {
        error: error.message,
        tenantId,
        pagination,
        filters
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des champs produit',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  /**
   * Mettre à jour un champ
   */
  static async updateProductField(tenantId: string, fieldId: number, updates: Partial<ProductField>): Promise<ApiResponse<ProductField>> {
    try {
      // Vérifier que le champ appartient au tenant
      const existingField = await this.getProductFieldById(tenantId, fieldId)
      if (!existingField.success) {
        return existingField
      }

      // Valider les options si le type est select/multiselect
      if (updates.type && ['select', 'multiselect'].includes(updates.type)) {
        if (!updates.options || updates.options.length === 0) {
          return {
            success: false,
            error: 'Les champs de type select/multiselect doivent avoir des options'
          }
        }
      }

      // Construire la requête UPDATE dynamiquement
      const fields = Object.keys(updates).filter(key => 
        key !== 'id' && 
        key !== 'tenant_id' && 
        key !== 'created_at' && 
        key !== 'updated_at' &&
        updates[key as keyof typeof updates] !== undefined
      )
      
      const values = fields.map(key => {
        const value = updates[key as keyof typeof updates]
        // Convertir les options en JSON si nécessaire
        if (key === 'options' && Array.isArray(value)) {
          return JSON.stringify(value)
        }
        return value
      })
      
      if (fields.length === 0) {
        return {
          success: false,
          error: 'Aucune donnée à mettre à jour'
        }
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ')
      
      const result = await query(
        `UPDATE product_fields 
         SET ${setClause}, updated_at = NOW() 
         WHERE tenant_id = $1 AND id = $2 
         RETURNING *`,
        [tenantId, fieldId, ...values]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Champ produit non trouvé'
        }
      }

      // Parser les options JSON
      const updatedField = result.rows[0]
      if (updatedField.options) {
        updatedField.options = JSON.parse(updatedField.options)
      }

      logger.info('Champ produit mis à jour', { tenantId, fieldId })

      return {
        success: true,
        data: updatedField
      }
    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du champ produit', {
        error: error.message,
        tenantId,
        fieldId,
        updates
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du champ produit'
      }
    }
  }

  /**
   * Supprimer un champ
   */
  static async deleteProductField(tenantId: string, fieldId: number): Promise<ApiResponse<boolean>> {
    try {
      return await transaction(async (client) => {
        // Vérifier que le champ appartient au tenant
        const existingField = await client.query(
          'SELECT id FROM product_fields WHERE tenant_id = $1 AND id = $2',
          [tenantId, fieldId]
        )

        if (existingField.rows.length === 0) {
          throw new Error('Champ produit non trouvé')
        }

        // Supprimer toutes les valeurs associées
        await client.query(
          'DELETE FROM product_field_values WHERE field_id = $1',
          [fieldId]
        )

        // Supprimer le champ
        await client.query(
          'DELETE FROM product_fields WHERE tenant_id = $1 AND id = $2',
          [tenantId, fieldId]
        )

        logger.info('Champ produit supprimé', { tenantId, fieldId })

        return true
      })
    } catch (error: any) {
      logger.error('Erreur lors de la suppression du champ produit', {
        error: error.message,
        tenantId,
        fieldId
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression du champ produit'
      }
    }
  }

  /**
   * Définir la valeur d'un champ pour un produit
   */
  static async setProductFieldValue(
    tenantId: string, 
    productId: string, 
    fieldId: number, 
    value: string
  ): Promise<ApiResponse<ProductFieldValue>> {
    try {
      return await transaction(async (client) => {
        // Vérifier que le champ appartient au tenant
        const fieldResult = await client.query(
          'SELECT id, type, is_required FROM product_fields WHERE tenant_id = $1 AND id = $2',
          [tenantId, fieldId]
        )

        if (fieldResult.rows.length === 0) {
          throw new Error('Champ produit non trouvé')
        }

        // Vérifier que le produit appartient au tenant
        const productResult = await client.query(
          'SELECT id FROM products WHERE tenant_id = $1 AND id = $2',
          [tenantId, productId]
        )

        if (productResult.rows.length === 0) {
          throw new Error('Produit non trouvé')
        }

        const field = fieldResult.rows[0]

        // Valider la valeur selon le type de champ
        if (field.type === 'number' && value && isNaN(Number(value))) {
          throw new Error('La valeur doit être un nombre')
        }

        if (field.type === 'boolean' && value && !['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          throw new Error('La valeur doit être un booléen (true/false)')
        }

        if (field.type === 'date' && value && isNaN(Date.parse(value))) {
          throw new Error('La valeur doit être une date valide')
        }

        // Vérifier si une valeur existe déjà
        const existingValueResult = await client.query(
          'SELECT id FROM product_field_values WHERE product_id = $1 AND field_id = $2',
          [productId, fieldId]
        )

        let result
        if (existingValueResult.rows.length > 0) {
          // Mettre à jour la valeur existante
          result = await client.query(
            `UPDATE product_field_values 
             SET value = $1, updated_at = NOW() 
             WHERE product_id = $2 AND field_id = $3 
             RETURNING *`,
            [value, productId, fieldId]
          )
        } else {
          // Créer une nouvelle valeur
          result = await client.query(
            `INSERT INTO product_field_values (product_id, field_id, value) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [productId, fieldId, value]
          )
        }

        logger.info('Valeur de champ produit définie', {
          tenantId,
          productId,
          fieldId,
          value: value.substring(0, 100) + (value.length > 100 ? '...' : '')
        })

        return result.rows[0]
      })
    } catch (error: any) {
      logger.error('Erreur lors de la définition de la valeur du champ', {
        error: error.message,
        tenantId,
        productId,
        fieldId,
        value
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la définition de la valeur du champ'
      }
    }
  }

  /**
   * Récupérer les valeurs des champs pour un produit
   */
  static async getProductFieldValues(tenantId: string, productId: string): Promise<ApiResponse<ProductFieldValue[]>> {
    try {
      // Vérifier que le produit appartient au tenant
      const productResult = await query(
        'SELECT id FROM products WHERE tenant_id = $1 AND id = $2',
        [tenantId, productId]
      )

      if (productResult.rows.length === 0) {
        return {
          success: false,
          error: 'Produit non trouvé'
        }
      }

      const result = await query(
        `SELECT pfv.*, 
                pf.name as field_name,
                pf.label as field_label,
                pf.type as field_type,
                pf.options as field_options
         FROM product_field_values pfv 
         JOIN product_fields pf ON pfv.field_id = pf.id 
         WHERE pfv.product_id = $1 AND pf.tenant_id = $2
         ORDER BY pf.sort_order ASC, pf.name ASC`,
        [productId, tenantId]
      )

      // Parser les options JSON pour chaque champ
      const values = result.rows.map(value => {
        if (value.field_options) {
          value.field_options = JSON.parse(value.field_options)
        }
        return value
      })

      return {
        success: true,
        data: values
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des valeurs des champs', {
        error: error.message,
        tenantId,
        productId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des valeurs des champs'
      }
    }
  }

  /**
   * Supprimer la valeur d'un champ pour un produit
   */
  static async deleteProductFieldValue(tenantId: string, productId: string, fieldId: number): Promise<ApiResponse<boolean>> {
    try {
      // Vérifier que le champ appartient au tenant
      const fieldResult = await query(
        'SELECT id FROM product_fields WHERE tenant_id = $1 AND id = $2',
        [tenantId, fieldId]
      )

      if (fieldResult.rows.length === 0) {
        return {
          success: false,
          error: 'Champ produit non trouvé'
        }
      }

      // Supprimer la valeur
      const result = await query(
        'DELETE FROM product_field_values WHERE product_id = $1 AND field_id = $2',
        [productId, fieldId]
      )

      if (result.rowCount === 0) {
        return {
          success: false,
          error: 'Valeur de champ non trouvée'
        }
      }

      logger.info('Valeur de champ produit supprimée', {
        tenantId,
        productId,
        fieldId
      })

      return {
        success: true,
        data: true
      }
    } catch (error: any) {
      logger.error('Erreur lors de la suppression de la valeur du champ', {
        error: error.message,
        tenantId,
        productId,
        fieldId
      })
      return {
        success: false,
        error: 'Erreur lors de la suppression de la valeur du champ'
      }
    }
  }

  /**
   * Réorganiser l'ordre des champs
   */
  static async reorderProductFields(tenantId: string, fieldOrders: Array<{ id: number; sort_order: number }>): Promise<ApiResponse<boolean>> {
    try {
      return await transaction(async (client) => {
        for (const { id, sort_order } of fieldOrders) {
          // Vérifier que le champ appartient au tenant
          const fieldResult = await client.query(
            'SELECT id FROM product_fields WHERE tenant_id = $1 AND id = $2',
            [tenantId, id]
          )

          if (fieldResult.rows.length === 0) {
            throw new Error(`Champ ${id} non trouvé`)
          }

          // Mettre à jour l'ordre
          await client.query(
            'UPDATE product_fields SET sort_order = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3',
            [sort_order, tenantId, id]
          )
        }

        logger.info('Ordre des champs produit mis à jour', { 
          tenantId, 
          fieldsCount: fieldOrders.length 
        })

        return true
      })
    } catch (error: any) {
      logger.error('Erreur lors de la réorganisation des champs produit', {
        error: error.message,
        tenantId,
        fieldOrders
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la réorganisation des champs produit'
      }
    }
  }
}