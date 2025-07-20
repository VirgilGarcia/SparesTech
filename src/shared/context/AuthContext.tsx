import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { tenantService } from '../../saas/services/tenantService'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; company?: string }) => Promise<void>
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

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string; company?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          first_name: metadata?.first_name,
          last_name: metadata?.last_name,
          company_name: metadata?.company,
        },
      },
    })
    if (error) throw error
    
    // Log pour debug
    console.log('SignUp result:', { user: data.user, session: data.session })
    
    // Si l'utilisateur est créé mais pas de session, c'est probablement que la confirmation d'email est requise
    if (data.user && !data.session) {
      console.log('⚠️ Utilisateur créé mais pas de session - confirmation d\'email requise')
      throw new Error('Inscription réussie ! Vérifiez votre email pour confirmer votre compte avant de vous connecter.')
    }

    // Si l'utilisateur est créé avec succès et qu'il y a une company, initialiser le tenant
    if (data.user && metadata?.company) {
      try {
        await tenantService.initializeTenant({
          name: metadata.company,
          adminUserId: data.user.id,
          adminEmail: email,
          adminCompanyName: metadata.company
        })
      } catch (tenantError) {
        console.error('Erreur lors de l\'initialisation du tenant:', tenantError)
        // On ne throw pas l'erreur pour ne pas bloquer la création du compte
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

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