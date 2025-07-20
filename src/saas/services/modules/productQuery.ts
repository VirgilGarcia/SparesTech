import { supabase } from '../../../lib/supabase'
import { getCurrentTenantId } from '../../../shared/utils/tenantUtils'
import type { Product } from '../productService'

export interface ProductQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  categoryId?: number
  stockLevel?: 'in_stock' | 'low_stock' | 'out_of_stock'
  visible?: boolean
  vendable?: boolean
  priceMin?: number
  priceMax?: number
}

export interface ProductQueryResult {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export class ProductQueryService {
  async getAllProducts(): Promise<Product[]> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          id,
          category_id,
          categories(id, name, path)
        )
      `)
      .eq('tenant_id', tenantId)
      .order('name')

    if (error) throw error
    return data || []
  }

  async getAllProductsPaginated(params: ProductQueryParams): Promise<ProductQueryResult> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const {
      page = 1,
      limit = 50,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      categoryId,
      stockLevel,
      visible,
      vendable,
      priceMin,
      priceMax
    } = params

    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories(
          id,
          category_id,
          categories(id, name, path)
        )
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)

    // Filtres
    if (search) {
      query = query.or(`name.ilike.%${search}%,reference.ilike.%${search}%`)
    }

    if (categoryId) {
      const { data: productIds } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryId)
      
      if (productIds && productIds.length > 0) {
        query = query.in('id', productIds.map(p => p.product_id))
      } else {
        // Si aucun produit trouvé pour cette catégorie, retourner un résultat vide
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    }

    if (stockLevel) {
      switch (stockLevel) {
        case 'in_stock':
          query = query.gt('stock', 10)
          break
        case 'low_stock':
          query = query.gte('stock', 1).lte('stock', 10)
          break
        case 'out_of_stock':
          query = query.eq('stock', 0)
          break
      }
    }

    if (visible !== undefined) {
      query = query.eq('visible', visible)
    }

    if (vendable !== undefined) {
      query = query.eq('vendable', vendable)
    }

    if (priceMin !== undefined) {
      query = query.gte('prix', priceMin)
    }

    if (priceMax !== undefined) {
      query = query.lte('prix', priceMax)
    }

    // Tri
    const sortField = sortBy === 'prix' ? 'prix' : sortBy
    query = query.order(sortField, { ascending: sortOrder === 'asc' })

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      hasNext: page < Math.ceil((count || 0) / limit),
      hasPrev: page > 1
    }
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(
          category_id,
          categories(id, name, path)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('product_categories.category_id', categoryId)
      .eq('visible', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  async getVisibleProducts(): Promise<Product[]> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          id,
          category_id,
          categories(id, name, path)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('visible', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  async searchProducts(query: string): Promise<Product[]> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          id,
          category_id,
          categories(id, name, path)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('visible', true)
      .or(`name.ilike.%${query}%,reference.ilike.%${query}%`)
      .order('name')

    if (error) throw error
    return data || []
  }
}