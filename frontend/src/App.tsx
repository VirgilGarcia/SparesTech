import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'
import { ToastProvider } from './shared/context/ToastContext'
import DomainRouter from './shared/components/routing/DomainRouter'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <DomainRouter />
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App