import { supabase } from '../../lib/supabase'
import type { ProductField, ProductFieldDisplay } from './productService'
import { getCurrentTenantId } from '../../shared/utils/tenantUtils'

export const productStructureService = {
  
  async getAllFields(): Promise<ProductField[]> {
    const tenantId = await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_fields')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getActiveFields(): Promise<ProductField[]> {
    const tenantId = await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_fields')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async addField(field: {
    name: string
    label: string
    type: ProductField['type']
    required?: boolean
    options?: string[]
    default_value?: string
  }): Promise<ProductField> {
    const tenantId = await getCurrentTenantId()
    
    // Vérifier que le nom est unique
    const existingField = await this.getFieldByName(field.name)
    if (existingField) {
      throw new Error('Un champ avec ce nom existe déjà')
    }

    const { data, error } = await supabase
      .from('product_fields')
      .insert([{ ...field, tenant_id: tenantId }])
      .select('*')
      .single()
    
    if (error) throw error

    // Calculer les prochains ordres disponibles
    const allDisplayFields = await this.getAllFieldDisplay()
    const maxCatalogOrder = Math.max(...allDisplayFields.map(f => f.catalog_order || 0), 0)
    const maxProductOrder = Math.max(...allDisplayFields.map(f => f.product_order || 0), 0)

    // Ajouter automatiquement l'entrée d'affichage avec les bons ordres
    await this.addFieldDisplay({
      field_name: field.name,
      field_type: 'custom',
      display_name: field.label,
      show_in_catalog: true,
      show_in_product: true,
      catalog_order: maxCatalogOrder + 1,
      product_order: maxProductOrder + 1
    })

    return data
  },

  async updateField(id: string, updates: Partial<ProductField>): Promise<ProductField> {
    const { data, error } = await supabase
      .from('product_fields')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async deleteField(id: string): Promise<void> {
    // Récupérer le nom du champ avant suppression
    const field = await this.getFieldById(id)
    if (!field) throw new Error('Champ non trouvé')

    // Supprimer le champ
    const { error: fieldError } = await supabase
      .from('product_fields')
      .delete()
      .eq('id', id)
    
    if (fieldError) throw fieldError

    // Supprimer aussi la configuration d'affichage associée
    const { error: displayError } = await supabase
      .from('product_field_display')
      .delete()
      .eq('field_name', field.name)
    
    if (displayError) throw displayError
  },

  async restoreField(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_fields')
      .update({ active: true })
      .eq('id', id)
    
    if (error) throw error
  },

  async getFieldByName(name: string): Promise<ProductField | null> {
    const tenantId = await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_fields')
      .select('*')
      .eq('name', name)
      .eq('tenant_id', tenantId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async getFieldById(id: string): Promise<ProductField | null> {
    const { data, error } = await supabase
      .from('product_fields')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },


  async getAllFieldDisplay(): Promise<ProductFieldDisplay[]> {
    const tenantId = await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_field_display')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('catalog_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getActiveFieldDisplay(): Promise<ProductFieldDisplay[]> {
    const tenantId = await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_field_display')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .order('catalog_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async addFieldDisplay(display: {
    field_name: string
    field_type: 'system' | 'custom'
    display_name: string
    show_in_catalog?: boolean
    show_in_product?: boolean
    catalog_order?: number
    product_order?: number
    tenant_id?: string
  }): Promise<ProductFieldDisplay> {
    const tenantId = display.tenant_id || await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_field_display')
      .insert([{ ...display, tenant_id: tenantId }])
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async updateFieldDisplay(id: string, updates: Partial<ProductFieldDisplay>): Promise<ProductFieldDisplay> {
    const { data, error } = await supabase
      .from('product_field_display')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async toggleFieldVisibility(id: string, type: 'catalog' | 'product'): Promise<void> {
    const field = await this.getFieldDisplayById(id)
    if (!field) throw new Error('Champ non trouvé')

    const updates: Partial<ProductFieldDisplay> = {}
    if (type === 'catalog') {
      updates.show_in_catalog = !field.show_in_catalog
    } else {
      updates.show_in_product = !field.show_in_product
    }

    await this.updateFieldDisplay(id, updates)
  },

  async reorderFields(updates: { id: string, catalog_order?: number, product_order?: number }[]): Promise<void> {
    
    
    // Mettre à jour chaque champ individuellement pour éviter les problèmes avec upsert
    for (const update of updates) {
      const updateData: Partial<ProductFieldDisplay> = {}
      
      // Validation des valeurs
      if (update.catalog_order !== undefined && !isNaN(update.catalog_order) && update.catalog_order >= 0) {
        updateData.catalog_order = update.catalog_order
      }
      if (update.product_order !== undefined && !isNaN(update.product_order) && update.product_order >= 0) {
        updateData.product_order = update.product_order
      }
      
      if (Object.keys(updateData).length > 0) {
        
        
                  const { error } = await supabase
          .from('product_field_display')
          .update(updateData)
          .eq('id', update.id)
          .select('*')
        
        if (error) {
          console.error('❌ Erreur lors de la mise à jour du champ:', update.id, error)
          throw error
        }
        
        
      } else {

      }
    }
    
    
  },

  async getFieldDisplayById(id: string): Promise<ProductFieldDisplay | null> {
    const { data, error } = await supabase
      .from('product_field_display')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },


  async getCatalogFields(): Promise<ProductFieldDisplay[]> {
    const tenantId = await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_field_display')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .eq('show_in_catalog', true)
      .order('catalog_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getProductFields(): Promise<ProductFieldDisplay[]> {
    const tenantId = await getCurrentTenantId()
    
    const { data, error } = await supabase
      .from('product_field_display')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .eq('show_in_product', true)
      .order('product_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },


  async initializeSystemFields(specificTenantId?: string): Promise<void> {
    const tenantId = specificTenantId || await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Tenant ID requis pour initialiser les champs système')
    }
    
    const hasFields = await this.hasSystemFields()
    if (hasFields) {
      return
    }

    await this.hideTechnicalFields()
    const systemFields = [
      {
        field_name: 'name',
        field_type: 'system' as const,
        display_name: 'Nom',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 1,
        product_order: 1
      },
      {
        field_name: 'reference',
        field_type: 'system' as const,
        display_name: 'Référence',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 2,
        product_order: 2
      },
      {
        field_name: 'prix',
        field_type: 'system' as const,
        display_name: 'Prix',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 3,
        product_order: 3
      },
      {
        field_name: 'stock',
        field_type: 'system' as const,
        display_name: 'Stock',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 4,
        product_order: 4
      },
      {
        field_name: 'photo_url',
        field_type: 'system' as const,
        display_name: 'Photo',
        show_in_catalog: false,
        show_in_product: false,
        catalog_order: 999,
        product_order: 999
      }
    ]

    for (const field of systemFields) {
      try {
        const { data: existing } = await supabase
          .from('product_field_display')
          .select('id')
          .eq('field_name', field.field_name)
          .eq('field_type', field.field_type)
          .eq('tenant_id', tenantId)
          .single()

        if (!existing) {
          await this.addFieldDisplay({ ...field, tenant_id: tenantId })
        }
      } catch (error) {
        console.error(`Erreur lors de l'initialisation du champ système "${field.display_name}":`, error)
      }
    }
  },

  async hideTechnicalFields(): Promise<void> {
    const technicalFields = ['visible', 'vendable', 'photo_url']
    
    for (const fieldName of technicalFields) {
      try {
        // Vérifier si le champ existe
        const tenantId = await getCurrentTenantId()
        
        const { data: existing } = await supabase
          .from('product_field_display')
          .select('id, show_in_catalog, show_in_product')
          .eq('field_name', fieldName)
          .eq('tenant_id', tenantId)
          .single()

        if (existing) {
          // Masquer le champ s'il est actuellement visible
          if (existing.show_in_catalog || existing.show_in_product) {
            await this.updateFieldDisplay(existing.id, {
              show_in_catalog: false,
              show_in_product: false
            })
          }
        } else {
          // Créer le champ technique masqué s'il n'existe pas
          await this.addFieldDisplay({
            field_name: fieldName,
            field_type: 'system',
            display_name: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
            show_in_catalog: false,
            show_in_product: false,
            catalog_order: 999,
            product_order: 999
          })
        }
      } catch (error) {
        console.error(`Erreur lors du masquage du champ technique "${fieldName}":`, error)
      }
    }
  },

  async hasSystemFields(): Promise<boolean> {
    try {
      const tenantId = await getCurrentTenantId()
      
      const { data, error } = await supabase
        .from('product_field_display')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('field_type', 'system')
        .limit(1)

      if (error) throw error
      return data && data.length > 0
    } catch (error) {
      console.error('Erreur lors de la vérification des champs système:', error)
      return false
    }
  },


  async fixOrderValues(): Promise<void> {
    try {
      const allFields = await this.getAllFieldDisplay()
      
      // Vérifier s'il y a des champs avec des ordres en conflit (même valeur)
      const catalogOrders = allFields.map(f => f.catalog_order || 0)
      const productOrders = allFields.map(f => f.product_order || 0)
      const hasCatalogConflicts = catalogOrders.length !== new Set(catalogOrders).size
      const hasProductConflicts = productOrders.length !== new Set(productOrders).size
      
      // Ne faire la migration que s'il y a des conflits
      if (!hasCatalogConflicts && !hasProductConflicts) {
  
        return
      }
      
      
      
      // Séparer les champs système et personnalisés
      const systemFields = allFields.filter(f => f.field_type === 'system')
      const customFields = allFields.filter(f => f.field_type === 'custom')
      
      // Réassigner les ordres pour le catalogue seulement si nécessaire
      if (hasCatalogConflicts) {
        let catalogOrder = 1
        for (const field of systemFields.sort((a, b) => (a.catalog_order || 999) - (b.catalog_order || 999))) {
          if (field.catalog_order !== catalogOrder) {
            await this.updateFieldDisplay(field.id, { catalog_order: catalogOrder })
          }
          catalogOrder++
        }
        
        for (const field of customFields) {
          await this.updateFieldDisplay(field.id, { catalog_order: catalogOrder })
          catalogOrder++
        }
      }
      
      // Réassigner les ordres pour la page produit seulement si nécessaire
      if (hasProductConflicts) {
        let productOrder = 1
        for (const field of systemFields.sort((a, b) => (a.product_order || 999) - (b.product_order || 999))) {
          if (field.product_order !== productOrder) {
            await this.updateFieldDisplay(field.id, { product_order: productOrder })
          }
          productOrder++
        }
        
        for (const field of customFields) {
          await this.updateFieldDisplay(field.id, { product_order: productOrder })
          productOrder++
        }
      }
      
      
    } catch (error) {
      console.error('Erreur lors de la migration des ordres:', error)
      throw error
    }
  },


  validateFieldName(name: string): boolean {
    // Nom doit être en minuscules, sans espaces, uniquement lettres, chiffres et underscores
    return /^[a-z][a-z0-9_]*$/.test(name)
  },

  validateFieldLabel(label: string): boolean {
    return label.length > 0 && label.length <= 255
  }
} 