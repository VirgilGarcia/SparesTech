import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Client avec clé publique (pour authentification)
export const supabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
)

// Client avec service role (pour opérations privilégiées)
export const supabaseServiceRole = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper pour extraire l'utilisateur depuis le token JWT
export async function getUserFromToken(authHeader?: string): Promise<{ user: any; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Token manquant ou invalide' }
  }

  const token = authHeader.substring(7)
  
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)
    
    if (error || !user) {
      return { user: null, error: 'Token invalide ou expiré' }
    }

    return { user }
  } catch (error) {
    return { user: null, error: 'Erreur lors de la validation du token' }
  }
}

// Helper pour créer un client Supabase avec un token spécifique
export function createSupabaseClientWithToken(token: string) {
  return createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )
}