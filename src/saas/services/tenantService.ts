// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du wrapper qui utilise l'API backend
export { tenantService } from './tenantServiceWrapper'

// Réexporter les types pour compatibilité
export type { Tenant, TenantUser, TenantSettings } from '../../shared/types/tenant'
export type { UserProfile } from '../../shared/types/user'

// Service original maintenu pour compatibilité mais non utilisé
const _originalTenantService = {
  
  // Récupérer le tenant d'un utilisateur
  async getUserTenant(userId: string): Promise<Tenant | null> {
    // Contournement temporaire - récupérer le tenant via user_profiles
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single()
      
      if (!profile?.tenant_id) return null
      
      // Récupérer le tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single()
      
      if (tenantError) {
        if (tenantError.code === 'PGRST116') return null
        throw tenantError
      }
      
      return tenant
    } catch (error) {
      console.warn('Impossible de récupérer le tenant via user_profiles:', error)
      return null
    }
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
    owner_id: string
    subdomain?: string
    custom_domain?: string
    subscription_status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  }): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert([{
        name: tenantData.name,
        owner_id: tenantData.owner_id,
        subdomain: tenantData.subdomain,
        custom_domain: tenantData.custom_domain,
        subscription_status: tenantData.subscription_status || 'trial',
        is_active: true
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Associer un utilisateur à un tenant
  async addUserToTenant(tenantId: string, userId: string, role: 'admin' | 'manager' | 'employee' | 'client' = 'client'): Promise<TenantUser> {
    const { data, error } = await supabase
      .from('tenant_users')
      .insert([{
        tenant_id: tenantId,
        user_id: userId,
        role,
        is_active: true
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Créer un profil utilisateur avec tenant
  async createUserProfile(profileData: {
    id: string
    tenant_id: string
    email: string
    first_name?: string
    last_name?: string
    company_name?: string
    phone?: string
    address?: string
    city?: string
    postal_code?: string
    country?: string
    role?: 'admin' | 'manager' | 'employee' | 'client'
  }): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id: profileData.id,
        tenant_id: profileData.tenant_id,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        company_name: profileData.company_name,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postal_code,
        country: profileData.country || 'France',
        role: profileData.role || 'client',
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
  async updateTenantStatus(tenantId: string, status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'): Promise<Tenant> {
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
    owner_id: string
    subdomain?: string
    adminUserId: string
    adminEmail: string
    adminFirstName?: string
    adminLastName?: string
    adminCompanyName?: string
  }): Promise<{ tenant: Tenant; profile: UserProfile; settings: TenantSettings }> {
    // Créer le tenant
    const tenant = await this.createTenant({
      name: tenantData.name,
      owner_id: tenantData.owner_id,
      subdomain: tenantData.subdomain
    })

    // Créer le profil utilisateur avec tenant
    const profile = await this.createUserProfile({
      id: tenantData.adminUserId,
      tenant_id: tenant.id,
      email: tenantData.adminEmail,
      first_name: tenantData.adminFirstName,
      last_name: tenantData.adminLastName,
      company_name: tenantData.adminCompanyName,
      role: 'admin'
    })

    // Associer l'utilisateur au tenant comme admin
    await this.addUserToTenant(tenant.id, tenantData.adminUserId, 'admin')

    // Créer les paramètres par défaut du tenant
    const settings = await this.createTenantSettings({
      tenant_id: tenant.id,
      company_name: tenantData.name,
      primary_color: '#10b981',
      show_prices: true,
      show_stock: true,
      show_categories: true,
      public_access: true
    })

    return { tenant, profile, settings }
  },

  // Créer les paramètres d'un tenant
  async createTenantSettings(settingsData: {
    tenant_id: string
    company_name: string
    logo_url?: string
    primary_color?: string
    show_prices?: boolean
    show_stock?: boolean
    show_categories?: boolean
    public_access?: boolean
    contact_email?: string
    contact_phone?: string
  }): Promise<TenantSettings> {
    const { data, error } = await supabase
      .from('tenant_settings')
      .insert([{
        tenant_id: settingsData.tenant_id,
        company_name: settingsData.company_name,
        logo_url: settingsData.logo_url,
        primary_color: settingsData.primary_color || '#10b981',
        show_prices: settingsData.show_prices ?? true,
        show_stock: settingsData.show_stock ?? true,
        show_categories: settingsData.show_categories ?? true,
        public_access: settingsData.public_access ?? true,
        contact_email: settingsData.contact_email,
        contact_phone: settingsData.contact_phone
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Récupérer les paramètres d'un tenant
  async getTenantSettings(tenantId: string): Promise<TenantSettings | null> {
    const { data, error } = await supabase
      .from('tenant_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    
    return data
  },

  // Mettre à jour les paramètres d'un tenant
  async updateTenantSettings(tenantId: string, updates: Partial<Omit<TenantSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>): Promise<TenantSettings> {
    const { data, error } = await supabase
      .from('tenant_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', tenantId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}