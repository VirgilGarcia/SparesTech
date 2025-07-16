import { createContext, useContext } from 'react'
import { useTheme } from '../hooks/useTheme'
import type { MarketplaceSettings } from '../services/settingsService'

interface MarketplaceContextType {
  settings: MarketplaceSettings | null
  loading: boolean
  initialized: boolean
  refreshSettings: () => void
  theme: {
    primaryColor: string
    companyName: string
    logoUrl: string | null
  }
  display: {
    showPrices: boolean
    showStock: boolean
    showCategories: boolean
  }
  access: {
    isPublic: boolean
    allowRegistration: boolean
  }
  updateSettings: (updates: Partial<MarketplaceSettings>) => Promise<MarketplaceSettings | undefined>
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const themeData = useTheme()

  return (
    <MarketplaceContext.Provider value={themeData}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplaceTheme() {
  const context = useContext(MarketplaceContext)
  if (context === undefined) {
    throw new Error('useMarketplaceTheme must be used within a MarketplaceProvider')
  }
  return context
}