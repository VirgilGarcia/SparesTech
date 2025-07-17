import { supabase } from '../../lib/supabase'

export interface CreateUserData {
  email: string
  password: string
  role: 'admin' | 'client'
  company_name?: string
  phone?: string
  tenant_id?: string
}

export interface UserProfile {
  id: string
  email: string
  company_name: string | null
  phone: string | null
  role: string
  is_active: boolean
  tenant_id: string | null
  created_at: string
}

export const userManagementService = {
  // Créer un nouvel utilisateur (par un admin)
  async createUser(userData: CreateUserData): Promise<{ user: any, profile: any }> {
    // 1. Créer l'utilisateur dans auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        company_name: userData.company_name,
        role: userData.role
      }
    })

    if (authError) throw authError

    // 2. Créer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authUser.user.id,
        email: userData.email,
        company_name: userData.company_name,
        phone: userData.phone,
        role: userData.role,
        tenant_id: userData.tenant_id
      }])
      .select()
      .single()

    if (profileError) throw profileError

    return { user: authUser.user, profile }
  },

  // Récupérer tous les utilisateurs d'un tenant
  async getUsersByTenant(tenantId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        company_name,
        phone,
        role,
        is_active,
        tenant_id,
        created_at
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Récupérer tous les utilisateurs (pour super admin)
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        company_name,
        phone,
        role,
        is_active,
        tenant_id,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Désactiver/activer un utilisateur
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: isActive })
      .eq('id', userId)

    if (error) throw error
  },

  // Supprimer un utilisateur
  async deleteUser(userId: string): Promise<void> {
    // Supprimer le profil (l'utilisateur auth sera supprimé en cascade)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
  }
}