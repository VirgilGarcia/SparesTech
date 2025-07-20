import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../shared/types/user'

// Réexporter le type pour compatibilité
export type { UserProfile }

export const userProfileService = {
  // Récupérer le profil d'un utilisateur (SaaS avec tenant_id)
  async getUserProfile(userId: string, tenantId?: string): Promise<UserProfile | null> {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Mettre à jour le profil d'un utilisateur (SaaS avec tenant_id)
  async updateUserProfile(userId: string, updates: Partial<UserProfile>, tenantId?: string): Promise<UserProfile> {
    let query = supabase
      .from('user_profiles')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId)

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query.select().single()

    if (error) throw error
    return data
  },

  // Sauvegarder l'adresse de livraison dans le profil (SaaS avec tenant_id)
  async saveDeliveryAddress(userId: string, addressData: {
    address: string
    city: string
    postal_code: string
  }, tenantId?: string): Promise<void> {
    let query = supabase
      .from('user_profiles')
      .update({
        address: addressData.address,
        city: addressData.city,
        postal_code: addressData.postal_code,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { error } = await query

    if (error) throw error
  },

  // Alias pour getProfile (utilisé dans Profile.tsx)
  async getProfile(userId: string, tenantId?: string): Promise<UserProfile | null> {
    return this.getUserProfile(userId, tenantId)
  },

  // Alias pour updateProfile (utilisé dans Profile.tsx)
  async updateProfile(userId: string, updates: Partial<UserProfile>, tenantId?: string): Promise<UserProfile> {
    return this.updateUserProfile(userId, updates, tenantId)
  },

  // Changer le mot de passe (utilisé dans Profile.tsx)
  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }
} 