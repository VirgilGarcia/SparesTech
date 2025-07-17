import { supabase } from '../lib/supabase'

// Fonction pour forcer la réinitialisation des champs système
export async function forceInitializeSystemFields(): Promise<boolean> {
  try {
    console.log('🔧 Début de la réinitialisation forcée des champs système...')
    
    const tenantId = 'bea06359-f61c-45c9-85b4-177be2fc8f5a'
    
    // 1. Supprimer tous les anciens champs système
    console.log('🗑️ Suppression des anciens champs système...')
    const { error: deleteError } = await supabase
      .from('product_field_display')
      .delete()
      .eq('field_type', 'system')
      .eq('tenant_id', tenantId)
    
    if (deleteError) {
      console.error('❌ Erreur suppression:', deleteError)
    }
    
    // 2. Insérer les nouveaux champs système
    console.log('✨ Insertion des nouveaux champs système...')
    const systemFields = [
      {
        field_name: 'name',
        field_type: 'system',
        display_name: 'Nom',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 1,
        product_order: 1,
        tenant_id: tenantId,
        active: true
      },
      {
        field_name: 'reference',
        field_type: 'system',
        display_name: 'Référence',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 2,
        product_order: 2,
        tenant_id: tenantId,
        active: true
      },
      {
        field_name: 'prix',
        field_type: 'system',
        display_name: 'Prix',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 3,
        product_order: 3,
        tenant_id: tenantId,
        active: true
      },
      {
        field_name: 'stock',
        field_type: 'system',
        display_name: 'Stock',
        show_in_catalog: true,
        show_in_product: true,
        catalog_order: 4,
        product_order: 4,
        tenant_id: tenantId,
        active: true
      },
      {
        field_name: 'visible',
        field_type: 'system',
        display_name: 'Visible',
        show_in_catalog: false,
        show_in_product: false,
        catalog_order: 999,
        product_order: 999,
        tenant_id: tenantId,
        active: true
      },
      {
        field_name: 'vendable',
        field_type: 'system',
        display_name: 'Vendable',
        show_in_catalog: false,
        show_in_product: false,
        catalog_order: 998,
        product_order: 998,
        tenant_id: tenantId,
        active: true
      },
      {
        field_name: 'photo_url',
        field_type: 'system',
        display_name: 'Photo',
        show_in_catalog: false,
        show_in_product: false,
        catalog_order: 997,
        product_order: 997,
        tenant_id: tenantId,
        active: true
      }
    ]
    
    const { error: insertError } = await supabase
      .from('product_field_display')
      .insert(systemFields)
    
    if (insertError) {
      console.error('❌ Erreur insertion:', insertError)
      return false
    }
    
    console.log('✅ Réinitialisation terminée avec succès!')
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
    return false
  }
}