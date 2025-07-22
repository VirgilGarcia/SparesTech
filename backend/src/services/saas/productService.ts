import { query, transaction } from '../../lib/database'
import { Product, ApiResponse, PaginatedResponse, PaginationParams } from '../../types'
import logger from '../../lib/logger'

export class ProductService {
  /**
   * Créer un nouveau produit
   */
  static async createProduct(tenantId: string, productData: {
    reference: string
    name: string
    description?: string
    price: number
    stock_quantity: number
    is_visible?: boolean
    is_sellable?: boolean
    featured_image_url?: string
    category_ids?: number[]
  }): Promise<ApiResponse<Product>> {
    try {
      return await transaction(async (client) => {
        // Vérifier que la référence n'existe pas déjà pour ce tenant
        const existingRef = await client.query(
          'SELECT id FROM products WHERE tenant_id = $1 AND reference = $2',
          [tenantId, productData.reference]
        )

        if (existingRef.rows.length > 0) {
          throw new Error('Cette référence produit existe déjà')
        }

        // Créer le produit
        const productResult = await client.query(
          `INSERT INTO products (tenant_id, reference, name, description, price, stock_quantity, is_visible, is_sellable, featured_image_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING *`,
          [
            tenantId,
            productData.reference,
            productData.name,
            productData.description || null,
            productData.price,
            productData.stock_quantity,
            productData.is_visible ?? true,
            productData.is_sellable ?? true,
            productData.featured_image_url || null
          ]
        )

        const product = productResult.rows[0]

        // Associer aux catégories si fournies
        if (productData.category_ids && productData.category_ids.length > 0) {
          for (let i = 0; i < productData.category_ids.length; i++) {
            const categoryId = productData.category_ids[i]
            await client.query(
              'INSERT INTO product_categories (product_id, category_id, is_primary) VALUES ($1, $2, $3)',
              [product.id, categoryId, i === 0] // La première catégorie est primaire
            )
          }
        }

        logger.info('Nouveau produit créé', {
          productId: product.id,
          tenantId,
          reference: productData.reference,
          name: productData.name
        })

        return product
      })
    } catch (error: any) {
      logger.error('Erreur lors de la création du produit', {
        error: error.message,
        tenantId,
        productData
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du produit'
      }
    }
  }

  /**
   * Récupérer un produit par ID
   */
  static async getProductById(tenantId: string, productId: string): Promise<ApiResponse<Product>> {
    try {
      const result = await query(
        `SELECT p.*, 
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', c.id,
                      'name', c.name,
                      'is_primary', pc.is_primary
                    )
                  ) FILTER (WHERE c.id IS NOT NULL), 
                  '[]'::json
                ) as categories
         FROM products p 
         LEFT JOIN product_categories pc ON p.id = pc.product_id 
         LEFT JOIN categories c ON pc.category_id = c.id 
         WHERE p.tenant_id = $1 AND p.id = $2
         GROUP BY p.id`,
        [tenantId, productId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Produit non trouvé'
        }
      }

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération du produit', {
        error: error.message,
        tenantId,
        productId
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération du produit'
      }
    }
  }

  /**
   * Récupérer les produits d'un tenant avec pagination et filtres
   */
  static async getProductsByTenant(
    tenantId: string, 
    pagination: PaginationParams,
    filters?: {
      search?: string
      category_id?: number
      is_visible?: boolean
      is_sellable?: boolean
      min_price?: number
      max_price?: number
    }
  ): Promise<PaginatedResponse<Product>> {
    try {
      const { page = 1, limit = 10 } = pagination
      const offset = (page - 1) * limit

      // Construire la clause WHERE
      const whereClauses = ['p.tenant_id = $1']
      const queryParams = [tenantId]
      let paramIndex = 2

      if (filters?.search) {
        whereClauses.push(`(p.name ILIKE $${paramIndex} OR p.reference ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`)
        queryParams.push(`%${filters.search}%`)
        paramIndex++
      }

      if (filters?.category_id) {
        whereClauses.push(`EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = $${paramIndex})`)
        queryParams.push(filters.category_id.toString())
        paramIndex++
      }

      if (filters?.is_visible !== undefined) {
        whereClauses.push(`p.is_visible = $${paramIndex}`)
        queryParams.push(filters.is_visible.toString())
        paramIndex++
      }

      if (filters?.is_sellable !== undefined) {
        whereClauses.push(`p.is_sellable = $${paramIndex}`)
        queryParams.push(filters.is_sellable.toString())
        paramIndex++
      }

      if (filters?.min_price !== undefined) {
        whereClauses.push(`p.price >= $${paramIndex}`)
        queryParams.push(filters.min_price.toString())
        paramIndex++
      }

      if (filters?.max_price !== undefined) {
        whereClauses.push(`p.price <= $${paramIndex}`)
        queryParams.push(filters.max_price.toString())
        paramIndex++
      }

      const whereClause = whereClauses.join(' AND ')

      // Compter le total
      const countResult = await query(
        `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`,
        queryParams
      )
      const total = parseInt(countResult.rows[0].total)

      // Récupérer les produits
      const productsResult = await query(
        `SELECT p.*, 
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', c.id,
                      'name', c.name,
                      'is_primary', pc.is_primary
                    )
                  ) FILTER (WHERE c.id IS NOT NULL), 
                  '[]'::json
                ) as categories
         FROM products p 
         LEFT JOIN product_categories pc ON p.id = pc.product_id 
         LEFT JOIN categories c ON pc.category_id = c.id 
         WHERE ${whereClause}
         GROUP BY p.id
         ORDER BY p.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      )

      const totalPages = Math.ceil(total / limit)

      return {
        success: true,
        data: productsResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des produits', {
        error: error.message,
        tenantId,
        pagination,
        filters
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des produits',
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
   * Mettre à jour un produit
   */
  static async updateProduct(tenantId: string, productId: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      // Vérifier que le produit appartient au tenant
      const existingProduct = await this.getProductById(tenantId, productId)
      if (!existingProduct.success) {
        return existingProduct
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
        `UPDATE products 
         SET ${setClause}, updated_at = NOW() 
         WHERE tenant_id = $1 AND id = $2 
         RETURNING *`,
        [tenantId, productId, ...values]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Produit non trouvé'
        }
      }

      logger.info('Produit mis à jour', { tenantId, productId })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du produit', {
        error: error.message,
        tenantId,
        productId,
        updates
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du produit'
      }
    }
  }

  /**
   * Supprimer un produit
   */
  static async deleteProduct(tenantId: string, productId: string): Promise<ApiResponse<boolean>> {
    try {
      return await transaction(async (client) => {
        // Vérifier que le produit appartient au tenant
        const existingProduct = await client.query(
          'SELECT id FROM products WHERE tenant_id = $1 AND id = $2',
          [tenantId, productId]
        )

        if (existingProduct.rows.length === 0) {
          throw new Error('Produit non trouvé')
        }

        // Supprimer les associations catégories
        await client.query(
          'DELETE FROM product_categories WHERE product_id = $1',
          [productId]
        )

        // Supprimer les valeurs des champs personnalisés
        await client.query(
          'DELETE FROM product_field_values WHERE product_id = $1',
          [productId]
        )

        // Supprimer le produit
        await client.query(
          'DELETE FROM products WHERE tenant_id = $1 AND id = $2',
          [tenantId, productId]
        )

        logger.info('Produit supprimé', { tenantId, productId })

        return true
      })
    } catch (error: any) {
      logger.error('Erreur lors de la suppression du produit', {
        error: error.message,
        tenantId,
        productId
      })
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression du produit'
      }
    }
  }

  /**
   * Mettre à jour le stock d'un produit
   */
  static async updateStock(tenantId: string, productId: string, newStock: number): Promise<ApiResponse<Product>> {
    try {
      const result = await query(
        `UPDATE products 
         SET stock_quantity = $1, updated_at = NOW() 
         WHERE tenant_id = $2 AND id = $3 
         RETURNING *`,
        [newStock, tenantId, productId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Produit non trouvé'
        }
      }

      logger.info('Stock produit mis à jour', { tenantId, productId, newStock })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du stock', {
        error: error.message,
        tenantId,
        productId,
        newStock
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du stock'
      }
    }
  }

  /**
   * Alias pour getProductsByTenant (interface simplifiée)
   */
  static async getProducts(tenantId: string, filters: any): Promise<any> {
    const pagination = { page: filters.page || 1, limit: filters.limit || 10 }
    return this.getProductsByTenant(tenantId, pagination, filters)
  }

  /**
   * Recherche publique de produits (pour les visiteurs non connectés)
   */
  static async searchPublicProducts(tenantId: string, searchParams: any): Promise<any> {
    const pagination = { page: searchParams.page || 1, limit: searchParams.limit || 10 }
    const filters = {
      search: searchParams.search,
      category_id: searchParams.category_id,
      is_visible: true,
      is_sellable: true,
      min_price: searchParams.min_price,
      max_price: searchParams.max_price
    }
    return this.getProductsByTenant(tenantId, pagination, filters)
  }
}