import { createContext, useContext, useEffect } from 'react'
import { useMarketplaceTheme } from '../hooks/useMarketplaceTheme'
import type { MarketplaceSettings } from '../services/settingsService'

interface MarketplaceContextType {
  settings: MarketplaceSettings | null
  loading: boolean
  refreshSettings: () => void
  theme: {
    primaryColor: string
    secondaryColor: string
    companyName: string
    logoUrl: string | null
  }
  display: {
    showPrices: boolean
    showStock: boolean
    showReferences: boolean
    showDescriptions: boolean
    showCategories: boolean
  }
  access: {
    isPublic: boolean
    allowRegistration: boolean
  }
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

interface MarketplaceProviderProps {
  children: React.ReactNode
}

export function MarketplaceProvider({ children }: MarketplaceProviderProps) {
  const themeData = useMarketplaceTheme()

  // Appliquer les couleurs CSS dynamiquement
  useEffect(() => {
    if (themeData.settings) {
      const root = document.documentElement
      root.style.setProperty('--primary-color', themeData.theme.primaryColor)
      root.style.setProperty('--secondary-color', themeData.theme.secondaryColor)
    }
  }, [themeData.settings])

  return (
    <MarketplaceContext.Provider value={themeData}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(MarketplaceContext)
  if (!context) {
    throw new Error('useTheme must be used within a MarketplaceProvider')
  }
  return context
}