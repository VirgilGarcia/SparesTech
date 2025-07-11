import { supabase } from '../lib/supabase'
import type { Product } from '../context/CartContext'

export interface ProductDB extends Product {
  description?: string
  stock: number
  category_id: number
  category?: { name: string } // Relation avec la table categories
  image_url?: string
  is_active: boolean
  // Nouvelles options de visibilité
  is_visible: boolean
  is_sellable: boolean
  // Nouvelles informations techniques
  weight?: number
  dimensions?: string
  sku?: string
  brand?: string
  supplier?: string
  technical_specs?: string
  warranty_info?: string
  delivery_info?: string
  created_at: string
  updated_at: string
}

export const productService = {
  async getAllProducts(): Promise<ProductDB[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner (
          name
        )
      `)
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async searchProducts(query: string): Promise<ProductDB[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner (
          name
        )
      `)
      .or(`name.ilike.%${query}%,reference.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getProductsByCategory(categoryId: number): Promise<ProductDB[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner (
          name
        )
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
  },

  // Ajouter un produit
  async addProduct(product: {
    name: string
    reference: string
    price: number
    description?: string
    stock: number
    category_id: number
    image_url?: string
  }): Promise<ProductDB> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select(`
        *,
        categories!inner (
          name
        )
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Modifier un produit
  async updateProduct(id: number, updates: Partial<ProductDB>): Promise<ProductDB> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        categories!inner (
          name
        )
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Récupérer un produit par ID
  async getProductById(id: number): Promise<ProductDB | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner (
          name
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_visible', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Récupérer tous les produits (admin - inclut les invisibles)
  async getAllProductsAdmin(): Promise<ProductDB[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner (
          name
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}