import { supabase } from '../../../lib/supabase'
import { getCurrentTenantId } from '../../../shared/utils/tenantUtils'

export class ProductCategoriesService {
  async assignCategoriesToProduct(productId: string, categoryIds: number[]): Promise<void> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    // Supprimer les anciennes associations
    await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)

    // Ajouter les nouvelles associations
    if (categoryIds.length > 0) {
      const associations = categoryIds.map(categoryId => ({
        product_id: productId,
        category_id: categoryId
      }))

      const { error } = await supabase
        .from('product_categories')
        .insert(associations)

      if (error) throw error
    }
  }

  async getProductCategories(productId: string): Promise<number[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('category_id')
      .eq('product_id', productId)

    if (error) throw error
    return data.map(item => item.category_id)
  }

  async removeProductFromCategory(productId: string, categoryId: number): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)
      .eq('category_id', categoryId)

    if (error) throw error
  }

  async addProductToCategory(productId: string, categoryId: number): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .insert({
        product_id: productId,
        category_id: categoryId
      })

    if (error) throw error
  }

  async bulkAssignCategories(assignments: { productId: string, categoryIds: number[] }[]): Promise<void> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    // Préparer toutes les associations
    const allAssociations = assignments.flatMap(assignment => 
      assignment.categoryIds.map(categoryId => ({
        product_id: assignment.productId,
        category_id: categoryId
      }))
    )

    // Supprimer les anciennes associations pour tous les produits
    const productIds = assignments.map(a => a.productId)
    await supabase
      .from('product_categories')
      .delete()
      .in('product_id', productIds)

    // Insérer les nouvelles associations
    if (allAssociations.length > 0) {
      const { error } = await supabase
        .from('product_categories')
        .insert(allAssociations)

      if (error) throw error
    }
  }

  async getProductsByMultipleCategories(categoryIds: number[]): Promise<string[]> {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('product_categories')
      .select(`
        product_id,
        products!inner(tenant_id)
      `)
      .in('category_id', categoryIds)
      .eq('products.tenant_id', tenantId)

    if (error) throw error
    return [...new Set(data.map(item => item.product_id))]
  }
}