import { supabase } from '../../lib/supabase'

export interface Tenant {
  id: string
  name: string
  subdomain?: string
  subscription_status: 'active' | 'inactive' | 'trial'
  created_at: string
  updated_at: string
}

export interface TenantUser {
  tenant_id: string
  user_id: string
  role: 'admin' | 'client'
  created_at: string
  tenant?: Tenant
}

export interface UserProfile {
  id: string
  email: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  role: 'admin' | 'client'
  is_active: boolean
  tenant_id?: string
  created_at: string
  updated_at: string
}

export const tenantService = {
  
  // Récupérer le tenant d'un utilisateur
  async getUserTenant(userId: string): Promise<Tenant | null> {
    // Récupérer d'abord l'association tenant_users
    const { data: tenantUser, error: userError } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', userId)
      .single()
    
    if (userError) {
      if (userError.code === 'PGRST116') return null // Pas de tenant trouvé
      throw userError
    }
    
    // Puis récupérer le tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantUser.tenant_id)
      .single()
    
    if (tenantError) {
      if (tenantError.code === 'PGRST116') return null
      throw tenantError
    }
    
    return tenant
  },

  // Récupérer le profil utilisateur avec tenant
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    
    return data
  },

  // Créer un nouveau tenant
  async createTenant(tenantData: {
    name: string
    subdomain?: string
    subscription_status?: 'active' | 'inactive' | 'trial'
  }): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert([{
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        subscription_status: tenantData.subscription_status || 'active'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Associer un utilisateur à un tenant
  async addUserToTenant(tenantId: string, userId: string, role: 'admin' | 'client' = 'client'): Promise<TenantUser> {
    const { data, error } = await supabase
      .from('tenant_users')
      .insert([{
        tenant_id: tenantId,
        user_id: userId,
        role
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Créer un profil utilisateur avec tenant
  async createUserProfile(profileData: {
    id: string
    email: string
    company_name?: string
    phone?: string
    address?: string
    city?: string
    postal_code?: string
    country?: string
    role?: 'admin' | 'client'
    tenant_id?: string
  }): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id: profileData.id,
        email: profileData.email,
        company_name: profileData.company_name,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postal_code,
        country: profileData.country || 'France',
        role: profileData.role || 'client',
        tenant_id: profileData.tenant_id,
        is_active: true
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Mettre à jour un profil utilisateur
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Récupérer tous les utilisateurs d'un tenant
  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    const { data, error } = await supabase
      .from('tenant_users')
      .select(`
        *,
        user_profiles (*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Vérifier si un utilisateur appartient à un tenant
  async isUserInTenant(userId: string, tenantId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('tenant_users')
      .select('user_id')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single()
    
    if (error) return false
    return !!data
  },

  // Récupérer le rôle d'un utilisateur dans un tenant
  async getUserTenantRole(userId: string, tenantId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('tenant_users')
      .select('role')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single()
    
    if (error) return null
    return data?.role || null
  },

  // Supprimer un utilisateur d'un tenant
  async removeUserFromTenant(userId: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('tenant_users')
      .delete()
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
    
    if (error) throw error
  },

  // Mettre à jour le statut d'un tenant
  async updateTenantStatus(tenantId: string, status: 'active' | 'inactive' | 'trial'): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Récupérer un tenant par subdomain
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    
    return data
  },

  // Initialiser un nouveau tenant avec son admin
  async initializeTenant(tenantData: {
    name: string
    subdomain?: string
    adminUserId: string
    adminEmail: string
    adminCompanyName?: string
  }): Promise<{ tenant: Tenant; profile: UserProfile }> {
    // Créer le tenant
    const tenant = await this.createTenant({
      name: tenantData.name,
      subdomain: tenantData.subdomain
    })

    // Créer le profil utilisateur avec tenant
    const profile = await this.createUserProfile({
      id: tenantData.adminUserId,
      email: tenantData.adminEmail,
      company_name: tenantData.adminCompanyName,
      role: 'admin',
      tenant_id: tenant.id
    })

    // Associer l'utilisateur au tenant comme admin
    await this.addUserToTenant(tenant.id, tenantData.adminUserId, 'admin')

    return { tenant, profile }
  }
}