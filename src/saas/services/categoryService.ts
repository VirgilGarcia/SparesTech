import { supabase } from '../../lib/supabase'
import { withTenant, getCurrentTenantId } from '../../utils/tenantUtils'

export interface Category {
  id: number
  name: string
  description?: string
  parent_id?: number | null
  level: number
  path: string
  order_index: number
  is_active: boolean
  tenant_id?: string
  created_at: string
  updated_at: string
  children?: Category[]
  product_count?: number
}

export interface CategoryTree {
  id: number
  name: string
  description?: string
  level: number
  path: string
  order_index: number
  tenant_id?: string
  product_count?: number
  children: CategoryTree[]
}

export interface ProductCategory {
  id: string
  product_id: string
  category_id: number
  created_at: string
  category?: Category
}


export const categoryService = {
  
  async getAllCategories(tenantId?: string): Promise<Category[]> {
    return withTenant(async (currentTenantId) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      
      if (error) throw error
      return data || []
    }, [], tenantId)
  },

  async getCategoryTree(tenantId?: string): Promise<CategoryTree[]> {
    const categories = await this.getAllCategories(tenantId)
    const tree = this.buildCategoryTree(categories)
    
    // Ajouter le nombre de produits par catégorie
    const productCounts = await this.getCategoryProductCounts(tenantId)
    this.addProductCountsToTree(tree, productCounts)
    
    return tree
  },

  async getCategoriesByLevel(level: number, tenantId?: string): Promise<Category[]> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', currentTenantId)
      .eq('is_active', true)
      .eq('level', level)
      .order('order_index')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getCategoryChildren(parentId: number, tenantId?: string): Promise<Category[]> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', currentTenantId)
      .eq('is_active', true)
      .eq('parent_id', parentId)
      .order('order_index')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getCategoryPath(categoryId: number, tenantId?: string): Promise<Category[]> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', currentTenantId)
      .eq('is_active', true)
      .eq('id', categoryId)
      .single()
    
    if (error) throw error
    if (!data) return []

    const path: Category[] = [data]
    let current = data

    while (current.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .eq('is_active', true)
        .eq('id', current.parent_id)
        .single()
      
      if (parentError || !parent) break
      
      path.unshift(parent)
      current = parent
    }

    return path
  },

  // Ajouter une nouvelle catégorie
  async addCategory(category: { 
    name: string; 
    description?: string; 
    parent_id?: number | null;
  }, tenantId?: string): Promise<Category> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    // Calculer le level et le path
    let level = 0
    let path = category.name

    if (category.parent_id) {
      const parent = await this.getCategoryById(category.parent_id, tenantId)
      if (parent) {
        level = parent.level + 1
        path = `${parent.path} > ${category.name}`
      }
    }

    // Calculer l'order_index
    const siblings = await this.getCategoryChildren(category.parent_id || 0, tenantId)
    const orderIndex = siblings.length

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        ...category,
        level,
        path,
        order_index: orderIndex,
        is_active: true,
        tenant_id: currentTenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Mettre à jour une catégorie
  async updateCategory(id: number, updates: Partial<Category>, tenantId?: string): Promise<Category> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    // Si le parent change, recalculer level et path
    if (updates.parent_id !== undefined) {
      let level = 0
      let path = updates.name || ''

      if (updates.parent_id) {
        const parent = await this.getCategoryById(updates.parent_id, tenantId)
        if (parent) {
          level = parent.level + 1
          path = `${parent.path} > ${updates.name || ''}`
        }
      }

      updates.level = level
      updates.path = path
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', currentTenantId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Supprimer une catégorie (hard delete)
  async deleteCategory(id: number, tenantId?: string): Promise<void> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    // Vérifier s'il y a des enfants
    const children = await this.getCategoryChildren(id, tenantId)
    if (children.length > 0) {
      throw new Error('Impossible de supprimer une catégorie qui a des sous-catégories')
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('tenant_id', currentTenantId)
    
    if (error) throw error
  },

  // Obtenir une catégorie par ID
  async getCategoryById(id: number, tenantId?: string): Promise<Category | null> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', currentTenantId)
      .eq('is_active', true)
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },

  // Construire l'arbre des catégories
  buildCategoryTree(categories: Category[]): CategoryTree[] {
    const map: { [id: number]: CategoryTree } = {}
    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] }
    })
    const tree: CategoryTree[] = []
    categories.forEach(cat => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.id])
      } else {
        tree.push(map[cat.id])
      }
    })
    // Tri par order_index
    const sortChildren = (nodes: CategoryTree[]) => {
      nodes.sort((a, b) => a.order_index - b.order_index)
      nodes.forEach(node => sortChildren(node.children))
    }
    sortChildren(tree)
    return tree
  },

  // Ajouter le nombre de produits à l'arbre des catégories
  addProductCountsToTree(tree: CategoryTree[], productCounts: Map<number, number>): void {
    const addCounts = (nodes: CategoryTree[]) => {
      nodes.forEach(node => {
        node.product_count = productCounts.get(node.id) || 0
        if (node.children.length > 0) {
          addCounts(node.children)
        }
      })
    }
    addCounts(tree)
  },


  
  // Obtenir toutes les catégories d'un produit
  async getProductCategories(productId: string): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select(`
        *,
        categories (
          id,
          name,
          path
        )
      `)
      .eq('product_id', productId)
    
    if (error) throw error
    return data || []
  },

  // Ajouter une catégorie à un produit
  async addProductCategory(productId: string, categoryId: number): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from('product_categories')
      .insert([{
        product_id: productId,
        category_id: categoryId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Supprimer une catégorie d'un produit
  async removeProductCategory(productId: string, categoryId: number): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)
      .eq('category_id', categoryId)
    
    if (error) throw error
  },

  // Mettre à jour toutes les catégories d'un produit
  async updateProductCategories(productId: string, categoryIds: number[]): Promise<void> {
    // Supprimer toutes les catégories actuelles
    await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)

    // Ajouter les nouvelles catégories
    if (categoryIds.length > 0) {
      const productCategories = categoryIds.map(categoryId => ({
        product_id: productId,
        category_id: categoryId,
        created_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('product_categories')
        .insert(productCategories)
      
      if (error) throw error
    }
  },

  // Obtenir le nombre de produits par catégorie
  async getCategoryProductCounts(tenantId?: string): Promise<Map<number, number>> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    // Joindre avec products pour filtrer par tenant
    const { data, error } = await supabase
      .from('product_categories')
      .select(`
        category_id,
        products!inner (
          tenant_id
        )
      `)
      .eq('products.tenant_id', currentTenantId)
    
    if (error) throw error

    const counts = new Map<number, number>()
    data?.forEach(pc => {
      counts.set(pc.category_id, (counts.get(pc.category_id) || 0) + 1)
    })

    return counts
  },

  // Vérifier si des catégories existent
  async hasCategories(tenantId?: string): Promise<boolean> {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      throw new Error('Tenant non trouvé')
    }

    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('tenant_id', currentTenantId)
      .eq('is_active', true)
      .limit(1)
    
    if (error) throw error
    return data && data.length > 0
  },

  // Initialiser les catégories par défaut pour un nouveau tenant
  async initializeDefaultCategories(specificTenantId?: string): Promise<void> {
    const tenantId = specificTenantId || await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant ID requis pour initialiser les catégories')
    }

    const hasExisting = await this.hasCategories(tenantId)
    if (hasExisting) {
      return
    }

    const defaultCategories = [
      {
        name: 'Pièces détachées',
        description: 'Pièces de rechange et composants',
        parent_id: null
      },
      {
        name: 'Équipements',
        description: 'Équipements et machines',
        parent_id: null
      },
      {
        name: 'Consommables',
        description: 'Produits consommables et fournitures',
        parent_id: null
      },
      {
        name: 'Outillage',
        description: 'Outils et accessoires',
        parent_id: null
      }
    ]

    for (const category of defaultCategories) {
      try {
        await this.addCategory(category, tenantId)
      } catch (error) {
        console.error(`Erreur lors de la création de la catégorie "${category.name}":`, error)
      }
    }
  },

  // Récupérer tous les IDs descendants d'une catégorie (y compris elle-même)
  getAllDescendantCategoryIds(tree: CategoryTree[], categoryId: number): number[] {
    const result: number[] = []
    const find = (nodes: CategoryTree[]) => {
      for (const node of nodes) {
        if (node.id === categoryId) {
          collect(node)
        } else if (node.children.length > 0) {
          find(node.children)
        }
      }
    }
    const collect = (node: CategoryTree) => {
      result.push(node.id)
      node.children.forEach(collect)
    }
    find(tree)
    return result
  }
}