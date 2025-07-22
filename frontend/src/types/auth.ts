// Types d'authentification personnalisés pour remplacer Supabase

export interface User {
  id: string
  email: string
  email_confirmed: boolean
  created_at: string
  updated_at: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    company?: string
    [key: string]: any
  }
}

export interface AuthResponse {
  user: User
  access_token: string
}

export interface Session {
  access_token: string
  user: User
  expires_at?: number
}

export interface SignUpData {
  user: User | null
  session: Session | null
}

export interface SignUpResponse {
  data: SignUpData
  error: null
}

export interface SignUpMetadata {
  first_name?: string
  last_name?: string
  company?: string
}