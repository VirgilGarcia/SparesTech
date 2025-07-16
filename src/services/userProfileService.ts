import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  email: string
  company_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  role: string
  is_active: boolean
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export const userProfileService = {
  // Récupérer le profil d'un utilisateur
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

  // Mettre à jour le profil d'un utilisateur
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

  // Sauvegarder l'adresse de livraison dans le profil
  async saveDeliveryAddress(userId: string, addressData: {
    address: string
    city: string
    postal_code: string
  }): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        address: addressData.address,
        city: addressData.city,
        postal_code: addressData.postal_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
  },

  // Alias pour getProfile (utilisé dans Profile.tsx)
  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.getUserProfile(userId)
  },

  // Alias pour updateProfile (utilisé dans Profile.tsx)
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.updateUserProfile(userId, updates)
  },

  // Changer le mot de passe (utilisé dans Profile.tsx)
  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }
} 