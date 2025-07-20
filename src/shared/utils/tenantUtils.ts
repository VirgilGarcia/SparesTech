import { supabase } from '../../lib/supabase'

// Fonction utilitaire pour obtenir le tenant de l'utilisateur courant
export async function getCurrentTenantId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Récupérer le tenant via user_profiles
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()
    
    return profile?.tenant_id || null
  } catch (error) {
    console.warn('Impossible de récupérer le tenant_id depuis user_profiles:', error)
    return null
  }
}

// Fonction utilitaire pour gérer les opérations tenant-aware
export async function withTenant<T>(
  operation: (tenantId: string) => Promise<T>,
  defaultValue: T,
  tenantId?: string
): Promise<T> {
  const currentTenantId = tenantId || await getCurrentTenantId()
  if (!currentTenantId) {
    return defaultValue
  }
  return operation(currentTenantId)
}

// Fonction utilitaire pour les opérations qui nécessitent un tenant
export async function requireTenant<T>(
  operation: (tenantId: string) => Promise<T>
): Promise<T> {
  const tenantId = await getCurrentTenantId()
  if (!tenantId) {
    throw new Error('Cette opération nécessite un tenant configuré')
  }
  return operation(tenantId)
}