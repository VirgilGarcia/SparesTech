import { supabase } from '../lib/supabase'
import type { Product } from '../context/CartContext'

export interface ProductDB extends Product {
  description?: string
  stock: number
  category: string
  image_url?: string
  created_at: string
}

export const productService = {
  async getAllProducts(): Promise<ProductDB[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async searchProducts(query: string): Promise<ProductDB[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,reference.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getProductsByCategory(category: string): Promise<ProductDB[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
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
    category: string
    image_url?: string
  }): Promise<ProductDB> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Modifier un produit
  async updateProduct(id: number, updates: Partial<ProductDB>): Promise<ProductDB> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Récupérer un produit par ID
  async getProductById(id: number): Promise<ProductDB | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Produit non trouvé
      throw error
    }
    return data
  }
}