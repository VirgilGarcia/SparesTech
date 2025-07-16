import { supabase } from '../lib/supabase'
import { categoryService } from './categoryService'

// Types pour la nouvelle structure
export interface Product {
  id: string
  reference: string
  name: string
  prix: number
  stock: number
  visible: boolean
  vendable: boolean
  photo_url?: string
  created_at: string
  updated_at: string
  product_categories?: {
    id: string
    category_id: number
    categories: {
      id: number
      name: string
      path: string
    }
  }[]
  [key: string]: any
}

export interface ProductField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'boolean'
  required: boolean
  options?: string[]
  default_value?: string
  created_at: string
}

export interface ProductFieldDisplay {
  id: string
  field_name: string
  field_type: 'system' | 'custom'
  display_name: string
  show_in_catalog: boolean
  show_in_product: boolean
  catalog_order: number
  product_order: number
}

export interface ProductFieldValue {
  id: string
  product_id: string
  field_id: string
  value: string
  created_at: string
}

export interface ProductFieldValueWithField extends ProductFieldValue {
  product_fields: ProductField
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  categoryId?: number
  categoryIds?: number[] // Nouveau paramètre pour filtrer par plusieurs catégories
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  // Nouveaux filtres pour optimisation serveur
  stockLevel?: 'in_stock' | 'low_stock' | 'out_of_stock'
  visible?: boolean
  vendable?: boolean
  priceMin?: number
  priceMax?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const productService = {
  // Méthode pour les admins - retourne TOUS les produits avec pagination optimisée
  async getAllProductsPaginated(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    const { 
      page, 
      limit, 
      search, 
      categoryId, 
      categoryIds, 
      sortBy = 'name', 
      sortOrder = 'asc',
      stockLevel,
      visible,
      vendable,
      priceMin,
      priceMax
    } = params
    const offset = (page - 1) * limit

    // Si on filtre par catégorie, on doit d'abord obtenir les product_ids
    let productIds: string[] | undefined
    if (categoryIds && categoryIds.length > 0) {
      const { data: productCategoryData, error: pcError } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', categoryIds)
      
      if (pcError) throw pcError
      productIds = productCategoryData?.map(pc => pc.product_id) || []
    } else if (categoryId) {
      const { data: productCategoryData, error: pcError } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryId)
      
      if (pcError) throw pcError
      productIds = productCategoryData?.map(pc => pc.product_id) || []
    }

    let query = supabase
      .from('products')
      .select('*, product_categories(id, category_id, categories(id, name, path))', { count: 'exact' })

    // Filtres de recherche
    if (search) {
      query = query.or(`name.ilike.%${search}%,reference.ilike.%${search}%`)
    }

    // Filtre par catégorie
    if (productIds) {
      if (productIds.length === 0) {
        // Aucun produit pour cette catégorie
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
      query = query.in('id', productIds)
    }

    // Filtres de statut - CÔTÉ SERVEUR pour performance
    if (visible !== undefined) {
      query = query.eq('visible', visible)
    }
    
    if (vendable !== undefined) {
      query = query.eq('vendable', vendable)
    }

    // Filtres de stock - CÔTÉ SERVEUR
    if (stockLevel) {
      switch (stockLevel) {
        case 'in_stock':
          query = query.gt('stock', 10)
          break
        case 'low_stock':
          query = query.and('stock.gt.0,stock.lte.10')
          break
        case 'out_of_stock':
          query = query.eq('stock', 0)
          break
      }
    }

    // Filtres de prix - CÔTÉ SERVEUR
    if (priceMin !== undefined) {
      query = query.gte('prix', priceMin)
    }
    if (priceMax !== undefined) {
      query = query.lte('prix', priceMax)
    }

    // Tri et pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  },

  // Méthode pour le catalogue public - retourne seulement les produits visibles avec pagination OPTIMISÉE
  async getVisibleProductsPaginated(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    const { 
      page, 
      limit, 
      search, 
      categoryId, 
      categoryIds, 
      sortBy = 'name', 
      sortOrder = 'asc',
      stockLevel,
      priceMin,
      priceMax
    } = params
    const offset = (page - 1) * limit

    // Si on a des categoryIds, on doit d'abord obtenir les product_ids correspondants
    let productIds: string[] | undefined
    if (categoryIds && categoryIds.length > 0) {
      console.log('🔍 Service: Recherche des produits pour les catégories:', categoryIds)
      
      const { data: productCategoryData, error: pcError } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', categoryIds)
      
      if (pcError) throw pcError
      productIds = productCategoryData?.map(pc => pc.product_id) || []
      
      console.log('🔍 Service: Produits trouvés:', productIds.length, 'IDs:', productIds)
      
      // Si aucun produit trouvé pour ces catégories, retourner une réponse vide
      if (productIds.length === 0) {
        console.log('🔍 Service: Aucun produit trouvé, retour réponse vide')
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

    let query = supabase
      .from('products')
      .select('*, product_categories(id, category_id, categories(id, name, path))', { count: 'exact' })
      .eq('visible', true)

    // Filtres de recherche
    if (search) {
      query = query.or(`name.ilike.%${search}%,reference.ilike.%${search}%`)
    }

    // Filtre par catégorie
    if (productIds && productIds.length > 0) {
      query = query.in('id', productIds)
    } else if (categoryId) {
      // Pour une seule catégorie, on peut utiliser la jointure
      query = query.eq('product_categories.category_id', categoryId)
    }

    // Filtres de stock - CÔTÉ SERVEUR pour performance catalog
    if (stockLevel) {
      switch (stockLevel) {
        case 'in_stock':
          query = query.gt('stock', 10)
          break
        case 'low_stock':
          query = query.and('stock.gt.0,stock.lte.10')
          break
        case 'out_of_stock':
          query = query.eq('stock', 0)
          break
      }
    }

    // Filtres de prix - CÔTÉ SERVEUR pour performance catalog
    if (priceMin !== undefined) {
      query = query.gte('prix', priceMin)
    }
    if (priceMax !== undefined) {
      query = query.lte('prix', priceMax)
    }

    // Tri et pagination
    console.log('🔍 Service: Exécution de la requête finale avec filtres:', {
      productIds: productIds?.length || 0,
      categoryId,
      search: !!search,
      offset,
      limit
    })
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    console.log('🔍 Service: Résultat final:', { total, returned: data?.length || 0 })

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  },

  // Nouvelle méthode pour obtenir les produits par catégorie avec sous-catégories
  async getVisibleProductsByCategoryWithSubcategories(categoryId: number, params: Omit<PaginationParams, 'categoryId' | 'categoryIds'>): Promise<PaginatedResponse<Product>> {
    // Obtenir l'arbre des catégories
    const categoryTree = await categoryService.getCategoryTree()
    
    // Trouver tous les IDs de catégories descendants
    const getAllDescendantIds = (categories: any[], targetId: number): number[] => {
      const ids: number[] = []
      const findAndCollect = (cats: any[]) => {
        for (const cat of cats) {
          if (cat.id === targetId) {
            ids.push(cat.id)
            // Ajouter tous les enfants
            const collectChildren = (children: any[]) => {
              children.forEach(child => {
                ids.push(child.id)
                collectChildren(child.children)
              })
            }
            collectChildren(cat.children)
            return true
          }
          if (cat.children.length > 0 && findAndCollect(cat.children)) {
            return true
          }
        }
        return false
      }
      findAndCollect(categories)
      return ids
    }
    
    const categoryIds = getAllDescendantIds(categoryTree, categoryId)
    
    // Utiliser la méthode existante avec les IDs de catégories
    return this.getVisibleProductsPaginated({
      ...params,
      categoryIds
    })
  },

  // Méthodes existantes pour compatibilité (à déprécier progressivement)
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(id, category_id, categories(id, name, path))')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getVisibleProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(id, category_id, categories(id, name, path))')
      .eq('visible', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(id, category_id, categories(id, name, path))')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async addProduct(productData: {
    name: string
    reference: string
    prix: number
    stock: number
    photo_url?: string
    visible: boolean
    vendable: boolean
    category_ids?: number[]
  }): Promise<Product> {
    const { category_ids, ...productFields } = productData

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([productFields])
      .select()
      .single()

    if (productError) throw productError

    if (category_ids && category_ids.length > 0) {
      const categoryRelations = category_ids.map(categoryId => ({
        product_id: product.id,
        category_id: categoryId
      }))

      const { error: categoryError } = await supabase
        .from('product_categories')
        .insert(categoryRelations)

      if (categoryError) throw categoryError
    }

    return product
  },

  async updateProduct(id: string, updates: {
    name?: string
    reference?: string
    prix?: number
    stock?: number
    photo_url?: string
    visible?: boolean
    vendable?: boolean
    category_ids?: number[]
    custom_field_values?: { field_id: string; value: string }[]
  }): Promise<Product> {
    const { category_ids, custom_field_values, ...productUpdates } = updates

    const { data: product, error: productError } = await supabase
      .from('products')
      .update(productUpdates)
      .eq('id', id)
      .select()
      .single()

    if (productError) throw productError

    if (category_ids !== undefined) {
      await this.updateProductCategories(id, category_ids)
    }

    if (custom_field_values !== undefined) {
      await this.updateProductFieldValues(id, custom_field_values)
    }

    return product
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getProductFieldValues(productId: string): Promise<ProductFieldValueWithField[]> {
    const { data, error } = await supabase
      .from('product_field_values')
      .select(`
        *,
        product_fields (
          id,
          name,
          label,
          type,
          options
        )
      `)
      .eq('product_id', productId)

    if (error) throw error
    return data || []
  },

  async setProductFieldValue(productId: string, fieldId: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('product_field_values')
      .upsert({
        product_id: productId,
        field_id: fieldId,
        value
      })

    if (error) throw error
  },

  async updateProductCategories(productId: string, categoryIds: number[]): Promise<void> {
    // Supprimer toutes les catégories actuelles
    const { error: deleteError } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)

    if (deleteError) throw deleteError

    // Ajouter les nouvelles catégories
    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map(categoryId => ({
        product_id: productId,
        category_id: categoryId
      }))

      const { error: insertError } = await supabase
        .from('product_categories')
        .insert(categoryRelations)

      if (insertError) throw insertError
    }
  },

  async updateProductFieldValues(productId: string, fieldValues: { field_id: string; value: string }[]): Promise<void> {
    // Supprimer les anciennes valeurs
    const { error: deleteError } = await supabase
      .from('product_field_values')
      .delete()
      .eq('product_id', productId)

    if (deleteError) throw deleteError

    // Insérer les nouvelles valeurs
    if (fieldValues.length > 0) {
      const valuesToInsert = fieldValues.map(fv => ({
        product_id: productId,
        field_id: fv.field_id,
        value: fv.value
      }))

      const { error: insertError } = await supabase
        .from('product_field_values')
        .insert(valuesToInsert)

      if (insertError) throw insertError
    }
  },

  async searchProducts(query: string, categoryId?: number): Promise<Product[]> {
    let supabaseQuery = supabase
      .from('products')
      .select('*, product_categories(id, category_id, categories(id, name, path))')
      .eq('visible', true)
      .or(`name.ilike.%${query}%,reference.ilike.%${query}%`)

    if (categoryId) {
      supabaseQuery = supabaseQuery.eq('product_categories.category_id', categoryId)
    }

    const { data, error } = await supabaseQuery.order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(id, category_id, categories(id, name, path))')
      .eq('visible', true)
      .eq('product_categories.category_id', categoryId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }
}