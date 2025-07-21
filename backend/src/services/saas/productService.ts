import { supabaseServiceRole } from '../../lib/supabase'
import { Product, ApiResponse, PaginatedResponse, PaginationParams } from '../../types'
import logger from '../../lib/logger'

export class ProductService {
  /**
   * Créer un produit
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
  }): Promise<ApiResponse<Product>> {
    try {
      // Vérifier l'unicité de la référence dans le tenant
      const { data: existing } = await supabaseServiceRole
        .from('products')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('reference', productData.reference)
        .single()

      if (existing) {
        return {
          success: false,
          error: 'Cette référence existe déjà'
        }
      }

      const { data, error } = await supabaseServiceRole
        .from('products')
        .insert([{
          tenant_id: tenantId,
          reference: productData.reference.trim(),
          name: productData.name.trim(),
          description: productData.description?.trim() || null,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          is_visible: productData.is_visible ?? true,
          is_sellable: productData.is_sellable ?? true,
          featured_image_url: productData.featured_image_url?.trim() || null
        }])
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Produit créé', { tenantId, productId: data.id, reference: productData.reference })
      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la création du produit', { 
        tenantId, 
        productData, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la création du produit'
      }
    }
  }

  /**
   * Récupérer les produits d'un tenant avec pagination
   */
  static async getProducts(
    tenantId: string, 
    params: PaginationParams & {
      search?: string
      category_id?: number
      is_visible?: boolean
      is_sellable?: boolean
    }
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc',
        search,
        category_id,
        is_visible,
        is_sellable
      } = params

      const offset = (page - 1) * limit

      let query = supabaseServiceRole
        .from('products')
        .select(`
          *,
          product_categories (
            category_id,
            categories (id, name)
          )
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)

      // Filtres
      if (search) {
        query = query.or(`name.ilike.%${search}%,reference.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (category_id) {
        query = query.eq('product_categories.category_id', category_id)
      }

      if (is_visible !== undefined) {
        query = query.eq('is_visible', is_visible)
      }

      if (is_sellable !== undefined) {
        query = query.eq('is_sellable', is_sellable)
      }

      // Tri et pagination
      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        success: true,
        data: {
          data: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération des produits', { 
        tenantId, 
        params, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des produits'
      }
    }
  }

  /**
   * Récupérer un produit par ID
   */
  static async getProductById(tenantId: string, productId: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('products')
        .select(`
          *,
          product_categories (
            category_id,
            is_primary,
            categories (id, name, description)
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('id', productId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Produit non trouvé'
          }
        }
        throw error
      }

      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération du produit', { 
        tenantId, 
        productId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération du produit'
      }
    }
  }

  /**
   * Mettre à jour un produit
   */
  static async updateProduct(
    tenantId: string, 
    productId: string, 
    updates: Partial<Omit<Product, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
  ): Promise<ApiResponse<Product>> {
    try {
      // Vérifier l'unicité de la référence si elle est modifiée
      if (updates.reference) {
        const { data: existing } = await supabaseServiceRole
          .from('products')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('reference', updates.reference)
          .neq('id', productId)
          .single()

        if (existing) {
          return {
            success: false,
            error: 'Cette référence existe déjà'
          }
        }
      }

      const { data, error } = await supabaseServiceRole
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId)
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Produit mis à jour', { tenantId, productId })
      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du produit', { 
        tenantId, 
        productId, 
        error: error.message 
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
      const { error } = await supabaseServiceRole
        .from('products')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('id', productId)

      if (error) {
        throw error
      }

      logger.info('Produit supprimé', { tenantId, productId })
      return {
        success: true,
        data: true
      }

    } catch (error: any) {
      logger.error('Erreur lors de la suppression du produit', { 
        tenantId, 
        productId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la suppression du produit'
      }
    }
  }

  /**
   * Recherche de produits publics (pour les clients non connectés)
   */
  static async searchPublicProducts(
    tenantId: string,
    params: {
      search?: string
      category_id?: number
      min_price?: number
      max_price?: number
      page?: number
      limit?: number
    }
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const {
        search,
        category_id,
        min_price,
        max_price,
        page = 1,
        limit = 20
      } = params

      const offset = (page - 1) * limit

      let query = supabaseServiceRole
        .from('products')
        .select(`
          id,
          reference,
          name,
          description,
          price,
          stock_quantity,
          tenant_id,
          is_visible,
          is_sellable,
          featured_image_url,
          created_at,
          updated_at,
          product_categories (
            category_id,
            categories (id, name)
          )
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('is_visible', true)
        .eq('is_sellable', true)

      // Filtres
      if (search) {
        query = query.or(`name.ilike.%${search}%,reference.ilike.%${search}%`)
      }

      if (category_id) {
        query = query.eq('product_categories.category_id', category_id)
      }

      if (min_price !== undefined) {
        query = query.gte('price', min_price)
      }

      if (max_price !== undefined) {
        query = query.lte('price', max_price)
      }

      // Tri et pagination
      query = query
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        success: true,
        data: {
          data: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      }

    } catch (error: any) {
      logger.error('Erreur lors de la recherche de produits publics', { 
        tenantId, 
        params, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la recherche'
      }
    }
  }
}