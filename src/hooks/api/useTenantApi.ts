import { useState } from 'react'
import { api } from '../../lib/api'

export function useTenantApi() {
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  /**
   * Récupérer le tenant_id de l'utilisateur connecté
   */
  const getCurrentTenantId = async (): Promise<string | null> => {
    try {
      const response = await api.get<{ tenant_id: string }>('/saas/tenant/current')
      
      if (!response.success) {
        return null
      }
      
      return response.data?.tenant_id || null
    } catch (err: any) {
      console.warn('Impossible de récupérer le tenant_id:', err.message)
      return null
    }
  }

  /**
   * Fonction utilitaire pour les opérations tenant-aware
   */
  const withTenant = async <T>(
    operation: (tenantId: string) => Promise<T>,
    defaultValue: T,
    tenantId?: string
  ): Promise<T> => {
    const currentTenantId = tenantId || await getCurrentTenantId()
    if (!currentTenantId) {
      return defaultValue
    }
    return operation(currentTenantId)
  }

  /**
   * Fonction utilitaire pour les opérations qui nécessitent un tenant
   */
  const requireTenant = async <T>(
    operation: (tenantId: string) => Promise<T>
  ): Promise<T> => {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) {
      throw new Error('Cette opération nécessite un tenant configuré')
    }
    return operation(tenantId)
  }

  return {
    loading,
    error,
    getCurrentTenantId,
    withTenant,
    requireTenant
  }
}