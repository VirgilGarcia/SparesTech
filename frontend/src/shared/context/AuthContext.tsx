import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '../../types/auth'
import { useAuthenticationApi } from '../../hooks/api/useAuthenticationApi'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; company?: string }) => Promise<{ data: { user: any; session: any }; error: null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const authApi = useAuthenticationApi()

  // Event listeners pour les changements d'auth
  const authListeners = new Set<(session: Session | null) => void>()

  const notifyAuthChange = (newSession: Session | null) => {
    authListeners.forEach(listener => listener(newSession))
  }

  useEffect(() => {
    // Récupérer la session actuelle depuis localStorage
    const currentSession = authApi.getCurrentSession()
    if (currentSession) {
      setSession(currentSession)
      setUser(currentSession.user)
      
      // Créer le profil startup si nécessaire
      authApi.createOrGetStartupProfile(currentSession.user.id, {
        email: currentSession.user.email,
        first_name: '',
        last_name: ''
      }).catch(error => {
        console.error('Erreur lors de la création du profil startup:', error)
      })
    }
    setLoading(false)
  }, [])

  // Wrapper pour signIn qui met à jour le state
  const handleSignIn = async (email: string, password: string): Promise<void> => {
    await authApi.signIn(email, password)
    const newSession = authApi.getCurrentSession()
    setSession(newSession)
    setUser(newSession?.user || null)
    notifyAuthChange(newSession)
  }

  // Wrapper pour signUp qui met à jour le state 
  const handleSignUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string; company?: string }) => {
    const result = await authApi.signUp(email, password, metadata)
    const newSession = authApi.getCurrentSession()
    setSession(newSession)
    setUser(newSession?.user || null)
    notifyAuthChange(newSession)
    return result
  }

  // Wrapper pour signOut qui met à jour le state
  const handleSignOut = async (): Promise<void> => {
    await authApi.signOut()
    setSession(null)
    setUser(null)
    notifyAuthChange(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}