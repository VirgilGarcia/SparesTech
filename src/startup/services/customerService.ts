import { supabase } from '../../lib/supabase'

export interface StartupCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  phone: string | null
  status: 'active' | 'suspended' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface StartupProspect {
  id: string
  email: string
  company_name: string
  first_name: string
  last_name: string
  phone: string | null
  desired_subdomain: string | null
  selected_plan_id: string | null
  status: 'prospect' | 'payment_pending' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
}

export interface StartupLead {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  phone: string | null
  source: string | null
  notes: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  created_at: string
  updated_at: string
}

export const startupCustomerService = {
  
  /**
   * Créer un nouveau client SparesTech
   */
  createCustomer: async (customerData: {
    email: string
    first_name: string
    last_name: string
    company_name: string
    phone?: string
  }): Promise<StartupCustomer | null> => {
    try {
      // Pour le workflow startup, on utilise marketplace_prospects
      // Les vrais comptes utilisateurs seront créés lors du paiement
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .insert([{
          email: customerData.email,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          company_name: customerData.company_name,
          phone: customerData.phone,
          status: 'prospect'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création du client:', error)
      return null
    }
  },

  /**
   * Récupérer un client par ID
   */
  getCustomerById: async (customerId: string): Promise<StartupCustomer | null> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .select('*')
        .eq('id', customerId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error)
      return null
    }
  },

  /**
   * Récupérer un client par email
   */
  getCustomerByEmail: async (email: string): Promise<StartupCustomer | null> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error)
      return null
    }
  },

  /**
   * Mettre à jour un client
   */
  updateCustomer: async (
    customerId: string, 
    updates: Partial<Omit<StartupCustomer, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<StartupCustomer | null> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error)
      return null
    }
  },

  /**
   * Lister tous les clients
   */
  listCustomers: async (filters?: {
    status?: StartupCustomer['status']
    limit?: number
    offset?: number
  }): Promise<{
    customers: StartupCustomer[]
    totalCount: number
  }> => {
    try {
      let query = supabase
        .from('marketplace_prospects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        customers: data || [],
        totalCount: count || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error)
      return {
        customers: [],
        totalCount: 0
      }
    }
  },

  /**
   * Créer un prospect
   */
  createProspect: async (prospectData: {
    email: string
    company_name: string
    first_name: string
    last_name: string
    phone?: string
    desired_subdomain?: string
    selected_plan_id?: string
  }): Promise<{ success: boolean; prospect_id?: string; plan_id?: string; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .insert([{
          email: prospectData.email,
          first_name: prospectData.first_name,
          last_name: prospectData.last_name,
          company_name: prospectData.company_name,
          phone: prospectData.phone,
          desired_subdomain: prospectData.desired_subdomain,
          selected_plan_id: prospectData.selected_plan_id,
          status: 'prospect'
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, prospect_id: data.id, plan_id: data.selected_plan_id }
    } catch (error) {
      console.error('Erreur lors de la création du prospect:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  /**
   * Récupérer un prospect par ID
   */
  getProspectById: async (prospectId: string): Promise<StartupProspect | null> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .select('*')
        .eq('id', prospectId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération du prospect:', error)
      return null
    }
  },

  /**
   * Mettre à jour le statut d'un prospect
   */
  updateProspectStatus: async (
    prospectId: string, 
    status: StartupProspect['status']
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('marketplace_prospects')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', prospectId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  },

  /**
   * Lister tous les prospects
   */
  listProspects: async (): Promise<StartupProspect[]> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des prospects:', error)
      return []
    }
  },

  /**
   * Rechercher des clients
   */
  searchCustomers: async (query: string): Promise<StartupCustomer[]> => {
    try {
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .select('*')
        .or(`email.ilike.%${query}%,company_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return []
    }
  }
}

// Export d'alias pour la compatibilité
export const customerService = startupCustomerService