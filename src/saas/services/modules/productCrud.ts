import { supabase } from '../../../lib/supabase'
import { getCurrentTenantId } from '../../../shared/utils/tenantUtils'
import type { Product } from '../productService'

export class ProductCrudService {
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        tenant_id: tenantId
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProduct(id: string) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) throw error
  }

  async getProductById(id: string) {
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
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error) throw error
    return data
  }

  async duplicateProduct(id: string, newReference: string) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const original = await this.getProductById(id)
    if (!original) {
      throw new Error('Produit original non trouvé')
    }

    const { id: _, created_at, updated_at, product_categories, ...productData } = original
    
    const duplicatedProduct = await this.createProduct({
      ...productData,
      reference: newReference,
      name: `${productData.name} (Copie)`,
      visible: false,
      vendable: false
    })

    // Dupliquer les associations de catégories
    if (product_categories && product_categories.length > 0) {
      const categoryAssociations = product_categories.map((pc: any) => ({
        product_id: duplicatedProduct.id,
        category_id: pc.category_id
      }))

      await supabase
        .from('product_categories')
        .insert(categoryAssociations)
    }

    return duplicatedProduct
  }
}