import { supabase } from '../lib/supabase'

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
      icon?: string
      color?: string
    }
  }[]
  // Champs dynamiques seront ajoutés ici
  [key: string]: any
}

export interface ProductField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'date' | 'url'
  required: boolean
  options?: string[]
  default_value?: string
  active: boolean
  created_at: string
  updated_at: string
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
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductFieldValue {
  id: string
  product_id: string
  field_id: string
  value: string
  created_at: string
  updated_at: string
}

export interface CustomFieldValue {
  field_id: string
  value: string
}

export const productService = {
  // === GESTION DES PRODUITS ===
  // Méthode pour les admins - retourne TOUS les produits
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories (
          id,
          category_id,
          categories (
            id,
            name,
            path
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Méthode pour le catalogue public - retourne seulement les produits visibles
  async getVisibleProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories (
          id,
          category_id,
          categories (
            id,
            name,
            path
          )
        )
      `)
      .eq('visible', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getProductById(id: string): Promise<(Product & { custom_field_values?: CustomFieldValue[] }) | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories (
          id,
          category_id,
          categories (
            id,
            name,
            path
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    // Charger les valeurs des champs personnalisés
    const { data: fieldValues, error: fieldError } = await supabase
      .from('product_field_values')
      .select('*')
      .eq('product_id', id)

    if (fieldError) throw fieldError

    return {
      ...data,
      custom_field_values: fieldValues || []
    }
  },

  async addProduct(product: {
    reference: string
    name: string
    prix: number
    stock: number
    visible?: boolean
    vendable?: boolean
    photo_url?: string
    category_ids?: number[]
  }): Promise<Product> {
    const { category_ids, ...productData } = product
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select('*')
      .single()
    
    if (error) throw error

    // Ajouter les catégories si fournies
    if (category_ids && category_ids.length > 0) {
      const { categoryService } = await import('./categoryService')
      await categoryService.updateProductCategories(data.id, category_ids)
    }

    return data
  },

  async updateProduct(id: string, updates: Partial<Product & { custom_field_values?: CustomFieldValue[], category_ids?: number[] }>): Promise<Product> {
    const { custom_field_values, category_ids, ...productUpdates } = updates
    
    // Mettre à jour le produit
    const { data, error } = await supabase
      .from('products')
      .update(productUpdates)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) throw error

    // Mettre à jour les catégories si fournies
    if (category_ids !== undefined) {
      const { categoryService } = await import('./categoryService')
      await categoryService.updateProductCategories(id, category_ids)
    }

    // Mettre à jour les valeurs des champs personnalisés si fournies
    if (custom_field_values && custom_field_values.length > 0) {
      // Supprimer les anciennes valeurs
      await supabase
        .from('product_field_values')
        .delete()
        .eq('product_id', id)

      // Insérer les nouvelles valeurs
      const fieldValues = custom_field_values.map(cfv => ({
        product_id: id,
        field_id: cfv.field_id,
        value: cfv.value
      }))

      if (fieldValues.length > 0) {
        const { error: fieldError } = await supabase
          .from('product_field_values')
          .insert(fieldValues)
        
        if (fieldError) throw fieldError
      }
    }

    return data
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // === GESTION DES VALEURS DES CHAMPS ===
  async getProductFieldValues(productId: string): Promise<ProductFieldValue[]> {
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

  async setProductFieldValue(productId: string, fieldId: string, value: string): Promise<ProductFieldValue> {
    const { data, error } = await supabase
      .from('product_field_values')
      .upsert([{ product_id: productId, field_id: fieldId, value }])
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  // === MÉTHODES UTILITAIRES ===
  async getProductWithFields(productId: string): Promise<Product & { customFields: Record<string, { value: string, label: string, type: string, options?: string[] }> }> {
    const [product, fieldValues] = await Promise.all([
      this.getProductById(productId),
      this.getProductFieldValues(productId)
    ])

    if (!product) throw new Error('Produit non trouvé')

    // Construire l'objet avec les champs personnalisés
    const customFields: Record<string, { value: string, label: string, type: string, options?: string[] }> = {}
    fieldValues.forEach(fv => {
      if (fv.product_fields) {
        customFields[fv.product_fields.name] = {
          value: fv.value,
          label: fv.product_fields.label,
          type: fv.product_fields.type,
          options: fv.product_fields.options
        }
      }
    })

    return { ...product, customFields }
  },

  async getProductsForCatalog(categoryIds?: number | number[]): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories (
          id,
          category_id,
          categories (
            id,
            name,
            path
          )
        )
      `)
      .eq('visible', true)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    
    // Filtrer les produits qui ont au moins une des catégories spécifiées
    if (categoryIds) {
      const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
      return (data || []).filter(product => 
        product.product_categories?.some(pc => ids.includes(pc.category_id))
      )
    }
    
    return data || []
  }
}