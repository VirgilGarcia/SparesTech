import { query, transaction } from '../../lib/database'
import { Category, ApiResponse, PaginatedResponse, PaginationParams } from '../../types'
import logger from '../../lib/logger'

export class CategoryService {
  /**
   * Créer une nouvelle catégorie
   */
  static async createCategory(tenantId: string, categoryData: {
    name: string
    description?: string
    parent_id?: number
    is_visible?: boolean
    sort_order?: number
  }): Promise<ApiResponse<Category>> {
    try {
      // Vérifier que le nom n'existe pas déjà pour ce tenant
      const existingCategory = await query(
        'SELECT id FROM categories WHERE tenant_id = $1 AND name = $2',
        [tenantId, categoryData.name]
      )

      if (existingCategory.rows.length > 0) {
        return {
          success: false,
          error: 'Une catégorie avec ce nom existe déjà'
        }
      }

      // Si parent_id fourni, vérifier qu'il appartient au même tenant
      if (categoryData.parent_id) {
        const parentCategory = await query(
          'SELECT id FROM categories WHERE tenant_id = $1 AND id = $2',
          [tenantId, categoryData.parent_id]
        )

        if (parentCategory.rows.length === 0) {
          return {
            success: false,
            error: 'Catégorie parent non trouvée'
          }
        }
      }

      const result = await query(
        `INSERT INTO categories (tenant_id, name, description, parent_id, is_visible, sort_order) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          tenantId,
          categoryData.name,
          categoryData.description || null,
          categoryData.parent_id || null,
          categoryData.is_visible ?? true,
          categoryData.sort_order ?? 0
        ]
      )

      logger.info('Nouvelle catégorie créée', {
        categoryId: result.rows[0].id,
        tenantId,
        name: categoryData.name
      })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la création de la catégorie', {
        error: error.message,
        tenantId,
        categoryData
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de la catégorie'
      }
    }
  }

  /**
   * Récupérer une catégorie par ID
   */
  static async getCategoryById(tenantId: string, categoryId: number): Promise<ApiResponse<Category>> {
    try {
      const result = await query(
        `SELECT c.*, 
                pc.name as parent_name,
                (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as children_count,
                (SELECT COUNT(*) FROM product_categories WHERE category_id = c.id) as products_count
         FROM categories c 
         LEFT JOIN categories pc ON c.parent_id = pc.id 
         WHERE c.tenant_id = $1 AND c.id = $2`,
        [tenantId, categoryId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Catégorie non trouvée'
        }
      }

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération de la catégorie', {
        error: error.message,
        tenantId,
        categoryId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de la catégorie'
      }
    }
  }

  /**
   * Récupérer les catégories d'un tenant avec pagination et filtres
   */
  static async getCategoriesByTenant(
    tenantId: string,
    pagination: PaginationParams,
    filters?: {
      search?: string
      parent_id?: number | null
      is_visible?: boolean
    }
  ): Promise<PaginatedResponse<Category>> {
    try {
      const { page = 1, limit = 10 } = pagination
      const offset = (page - 1) * limit

      // Construire la clause WHERE
      const whereClauses = ['c.tenant_id = $1']
      const queryParams = [tenantId]
      let paramIndex = 2

      if (filters?.search) {
        whereClauses.push(`(c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`)
        queryParams.push(`%${filters.search}%`)
        paramIndex++
      }

      if (filters?.parent_id !== undefined) {
        if (filters.parent_id === null) {
          whereClauses.push('c.parent_id IS NULL')
        } else {
          whereClauses.push(`c.parent_id = $${paramIndex}`)
          queryParams.push(filters.parent_id.toString())
          paramIndex++
        }
      }

      if (filters?.is_visible !== undefined) {
        whereClauses.push(`c.is_visible = $${paramIndex}`)
        queryParams.push(filters.is_visible.toString())
        paramIndex++
      }

      const whereClause = whereClauses.join(' AND ')

      // Compter le total
      const countResult = await query(
        `SELECT COUNT(*) as total FROM categories c WHERE ${whereClause}`,
        queryParams
      )
      const total = parseInt(countResult.rows[0].total)

      // Récupérer les catégories
      const categoriesResult = await query(
        `SELECT c.*, 
                pc.name as parent_name,
                (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as children_count,
                (SELECT COUNT(*) FROM product_categories WHERE category_id = c.id) as products_count
         FROM categories c 
         LEFT JOIN categories pc ON c.parent_id = pc.id 
         WHERE ${whereClause}
         ORDER BY c.sort_order ASC, c.name ASC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      )

      const totalPages = Math.ceil(total / limit)

      return {
        success: true,
        data: categoriesResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des catégories', {
        error: error.message,
        tenantId,
        pagination,
        filters
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des catégories',
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
   * Récupérer l'arbre des catégories (hiérarchie complète)
   */
  static async getCategoryTree(tenantId: string): Promise<ApiResponse<Category[]>> {
    try {
      // Utiliser une requête récursive pour construire l'arbre
      const result = await query(
        `WITH RECURSIVE category_tree AS (
          -- Catégories racines (sans parent)
          SELECT c.*, 
                 NULL as parent_name,
                 0 as level,
                 ARRAY[c.sort_order, c.id] as path
          FROM categories c 
          WHERE c.tenant_id = $1 AND c.parent_id IS NULL AND c.is_visible = true
          
          UNION ALL
          
          -- Catégories enfants
          SELECT c.*, 
                 ct.name as parent_name,
                 ct.level + 1,
                 ct.path || ARRAY[c.sort_order, c.id]
          FROM categories c 
          JOIN category_tree ct ON c.parent_id = ct.id 
          WHERE c.tenant_id = $1 AND c.is_visible = true
        )
        SELECT *, 
               (SELECT COUNT(*) FROM product_categories WHERE category_id = category_tree.id) as products_count
        FROM category_tree 
        ORDER BY path`,
        [tenantId]
      )

      return {
        success: true,
        data: result.rows
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération de l\'arbre des catégories', {
        error: error.message,
        tenantId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'arbre des catégories'
      }
    }
  }

  /**
   * Mettre à jour une catégorie
   */
  static async updateCategory(tenantId: string, categoryId: number, updates: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      // Vérifier que la catégorie appartient au tenant
      const existingCategory = await this.getCategoryById(tenantId, categoryId)
      if (!existingCategory.success) {
        return existingCategory
      }

      // Si on change le parent, vérifier qu'on ne crée pas de boucle
      if (updates.parent_id !== undefined) {
        if (updates.parent_id === categoryId) {
          return {
            success: false,
            error: 'Une catégorie ne peut pas être son propre parent'
          }
        }

        if (updates.parent_id) {
          // Vérifier que le nouveau parent appartient au même tenant
          const parentCategory = await query(
            'SELECT id FROM categories WHERE tenant_id = $1 AND id = $2',
            [tenantId, updates.parent_id]
          )

          if (parentCategory.rows.length === 0) {
            return {
              success: false,
              error: 'Catégorie parent non trouvée'
            }
          }

          // Vérifier qu'on ne crée pas de boucle (le parent ne doit pas être un descendant)
          const descendantsResult = await query(
            `WITH RECURSIVE descendants AS (
              SELECT id FROM categories WHERE id = $1
              UNION ALL
              SELECT c.id FROM categories c 
              JOIN descendants d ON c.parent_id = d.id
            )
            SELECT id FROM descendants WHERE id = $2`,
            [categoryId, updates.parent_id]
          )

          if (descendantsResult.rows.length > 0) {
            return {
              success: false,
              error: 'Impossible de créer une boucle dans la hiérarchie des catégories'
            }
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
      const values = fields.map(key => updates[key as keyof typeof updates])
      
      if (fields.length === 0) {
        return {
          success: false,
          error: 'Aucune donnée à mettre à jour'
        }
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ')
      
      const result = await query(
        `UPDATE categories 
         SET ${setClause}, updated_at = NOW() 
         WHERE tenant_id = $1 AND id = $2 
         RETURNING *`,
        [tenantId, categoryId, ...values]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Catégorie non trouvée'
        }
      }

      logger.info('Catégorie mise à jour', { tenantId, categoryId })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour de la catégorie', {
        error: error.message,
        tenantId,
        categoryId,
        updates
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de la catégorie'
      }
    }
  }

  /**
   * Supprimer une catégorie
   */
  static async deleteCategory(tenantId: string, categoryId: number): Promise<ApiResponse<boolean>> {
    try {
      return await transaction(async (client) => {
        // Vérifier que la catégorie appartient au tenant
        const existingCategory = await client.query(
          'SELECT id FROM categories WHERE tenant_id = $1 AND id = $2',
          [tenantId, categoryId]
        )

        if (existingCategory.rows.length === 0) {
          throw new Error('Catégorie non trouvée')
        }

        // Vérifier qu'il n'y a pas de catégories enfants
        const childrenResult = await client.query(
          'SELECT id FROM categories WHERE parent_id = $1',
          [categoryId]
        )

        if (childrenResult.rows.length > 0) {
          throw new Error('Impossible de supprimer une catégorie qui a des sous-catégories')
        }

        // Vérifier qu'il n'y a pas de produits associés
        const productsResult = await client.query(
          'SELECT product_id FROM product_categories WHERE category_id = $1',
          [categoryId]
        )

        if (productsResult.rows.length > 0) {
          throw new Error('Impossible de supprimer une catégorie qui contient des produits')
        }

        // Supprimer la catégorie
        await client.query(
          'DELETE FROM categories WHERE tenant_id = $1 AND id = $2',
          [tenantId, categoryId]
        )

        logger.info('Catégorie supprimée', { tenantId, categoryId })

        return true
      })
    } catch (error: any) {
      logger.error('Erreur lors de la suppression de la catégorie', {
        error: error.message,
        tenantId,
        categoryId
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression de la catégorie'
      }
    }
  }

  /**
   * Réorganiser l'ordre des catégories
   */
  static async reorderCategories(tenantId: string, categoryOrders: Array<{ id: number; sort_order: number }>): Promise<ApiResponse<boolean>> {
    try {
      return await transaction(async (client) => {
        for (const { id, sort_order } of categoryOrders) {
          // Vérifier que la catégorie appartient au tenant
          const categoryResult = await client.query(
            'SELECT id FROM categories WHERE tenant_id = $1 AND id = $2',
            [tenantId, id]
          )

          if (categoryResult.rows.length === 0) {
            throw new Error(`Catégorie ${id} non trouvée`)
          }

          // Mettre à jour l'ordre
          await client.query(
            'UPDATE categories SET sort_order = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3',
            [sort_order, tenantId, id]
          )
        }

        logger.info('Ordre des catégories mis à jour', { 
          tenantId, 
          categoriesCount: categoryOrders.length 
        })

        return true
      })
    } catch (error: any) {
      logger.error('Erreur lors de la réorganisation des catégories', {
        error: error.message,
        tenantId,
        categoryOrders
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la réorganisation des catégories'
      }
    }
  }
}