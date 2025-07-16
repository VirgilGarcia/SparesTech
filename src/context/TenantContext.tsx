import { createContext, useContext, type ReactNode } from 'react'
import { useTenant } from '../hooks/useTenant'
import type { Tenant, UserProfile } from '../services/tenantService'

interface TenantContextType {
  tenant: Tenant | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  refreshTenant: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | undefined>
  isAdmin: boolean
  tenantId: string | undefined
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const tenantData = useTenant()
  
  return (
    <TenantContext.Provider value={tenantData}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenantContext() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider')
  }
  return context
}