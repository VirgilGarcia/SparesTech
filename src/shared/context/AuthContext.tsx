import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
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
  const { createOrGetStartupProfile, updateUserMetadata } = useAuthenticationApi()

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Si l'utilisateur vient de confirmer son email, créer son profil startup_users via l'API
        if (event === 'SIGNED_IN' && session?.user && !session?.user.user_metadata?.startup_profile_created) {
          try {
            const success = await createOrGetStartupProfile(session.user.id, {
              email: session.user.email!,
              first_name: session.user.user_metadata?.first_name,
              last_name: session.user.user_metadata?.last_name,
            })
            
            if (success) {
              // Marquer que le profil a été créé
              await updateUserMetadata({ startup_profile_created: true })
            }
          } catch (error) {
            console.error('Erreur lors de la création du profil startup après connexion:', error)
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [createOrGetStartupProfile, updateUserMetadata])

  const { signIn, signUp, signOut } = useAuthenticationApi()

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
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