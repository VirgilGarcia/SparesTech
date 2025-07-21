import { useTenantApi } from '../../hooks/api/useTenantApi'

// Hook pour les utilitaires tenant - DEPRECATED: utiliser useTenantApi directement
export function useTenantUtils() {
  return useTenantApi()
}

// Fonctions utilitaires legacy - DEPRECATED: utiliser useTenantApi
const tenantApiInstance = new (class {
  private api = new (require('../../hooks/api/useTenantApi').useTenantApi)()
  
  getCurrentTenantId = () => this.api.getCurrentTenantId()
  withTenant = <T>(
    operation: (tenantId: string) => Promise<T>,
    defaultValue: T,
    tenantId?: string
  ) => this.api.withTenant(operation, defaultValue, tenantId)
  requireTenant = <T>(operation: (tenantId: string) => Promise<T>) => this.api.requireTenant(operation)
})()

export const getCurrentTenantId = tenantApiInstance.getCurrentTenantId
export const withTenant = tenantApiInstance.withTenant  
export const requireTenant = tenantApiInstance.requireTenant