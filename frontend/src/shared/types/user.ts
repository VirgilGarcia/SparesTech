// Types centralisés pour les utilisateurs

// Interface pour les utilisateurs SaaS (avec tenant)
export interface UserProfile {
  id: string
  tenant_id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
  role: 'admin' | 'manager' | 'employee' | 'client'
  is_active: boolean
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
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  is_active?: boolean
}


// Types pour les plans d'abonnement
export interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description?: string | null
  price_monthly: number
  price_yearly?: number | null
  features: string[]
  limits?: Record<string, unknown> | null
  custom_domain_allowed: boolean
  priority_support: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Types pour les abonnements
export interface Subscription {
  id: string
  customer_id: string
  plan_id: string
  tenant_id?: string | null
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  billing_cycle: 'monthly' | 'yearly'
  current_period_start?: string | null
  current_period_end?: string | null
  trial_end?: string | null
  cancelled_at?: string | null
  payment_method_id?: string | null
  created_at: string
  updated_at: string
}

