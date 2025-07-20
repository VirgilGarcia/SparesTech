// Types centralisés pour les utilisateurs

// Interface pour les utilisateurs SaaS (avec tenant)
export interface UserProfile {
  id: string
  email: string
  company_name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
  role: string
  is_active: boolean
  tenant_id?: string | null
  created_at: string
  updated_at: string
}

// Interface pour les utilisateurs du site startup (sans tenant)
export interface StartupUser {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Type pour la création d'un utilisateur startup (sans id et timestamps)
export interface CreateStartupUser {
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
}

// Type pour la mise à jour d'un utilisateur startup (tous les champs optionnels sauf email)
export interface UpdateStartupUser {
  email?: string
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
  is_active?: boolean
}

