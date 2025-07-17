import { supabase } from '../lib/supabase'
import { tenantService } from '../services/saas/tenantService'

// Fonction utilitaire pour obtenir le tenant de l'utilisateur courant
export async function getCurrentTenantId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const tenant = await tenantService.getUserTenant(user.id)
  return tenant?.id || null
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