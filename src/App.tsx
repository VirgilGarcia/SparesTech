import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'
import { TenantProvider } from './shared/context/TenantContext'
import { MarketplaceProvider } from './shared/context/ThemeContext'
import { CartProvider } from './shared/context/CartContext'
import DomainRouter from './shared/components/routing/DomainRouter'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <MarketplaceProvider>
          <CartProvider>
            <Router>
              <DomainRouter />
            </Router>
          </CartProvider>
        </MarketplaceProvider>
      </TenantProvider>
    </AuthProvider>
  )
}

export default App