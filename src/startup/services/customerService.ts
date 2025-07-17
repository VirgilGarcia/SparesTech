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
      const { data, error } = await supabase
        .from('startup.customers')
        .insert([customerData])
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
        .from('startup.customers')
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
        .from('startup.customers')
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
        .from('startup.customers')
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
   * Lister tous les clients avec pagination
   */
  getCustomers: async (page: number = 1, pageSize: number = 20): Promise<{
    customers: StartupCustomer[]
    totalCount: number
  }> => {
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await supabase
        .from('startup.customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

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
    plan_name?: string
  }): Promise<{ success: boolean; prospect_id?: string; plan_id?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('startup.create_prospect', {
        p_email: prospectData.email,
        p_company_name: prospectData.company_name,
        p_first_name: prospectData.first_name,
        p_last_name: prospectData.last_name,
        p_phone: prospectData.phone || null,
        p_desired_subdomain: prospectData.desired_subdomain || null,
        p_plan_name: prospectData.plan_name || 'basic'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création du prospect:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Récupérer un prospect par ID
   */
  getProspectById: async (prospectId: string): Promise<StartupProspect | null> => {
    try {
      const { data, error } = await supabase
        .from('startup.prospects')
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
        .from('startup.prospects')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', prospectId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prospect:', error)
      return false
    }
  },

  /**
   * Créer un lead
   */
  createLead: async (leadData: {
    email: string
    first_name?: string
    last_name?: string
    company_name?: string
    phone?: string
    source?: string
    notes?: string
  }): Promise<StartupLead | null> => {
    try {
      const { data, error } = await supabase
        .from('startup.leads')
        .insert([leadData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création du lead:', error)
      return null
    }
  },

  /**
   * Convertir un prospect en client
   */
  convertProspectToCustomer: async (prospectId: string): Promise<StartupCustomer | null> => {
    try {
      // Récupérer le prospect
      const prospect = await startupCustomerService.getProspectById(prospectId)
      if (!prospect) {
        throw new Error('Prospect non trouvé')
      }

      // Créer le client
      const customer = await startupCustomerService.createCustomer({
        email: prospect.email,
        first_name: prospect.first_name,
        last_name: prospect.last_name,
        company_name: prospect.company_name,
        phone: prospect.phone || undefined
      })

      if (customer) {
        // Mettre à jour le statut du prospect
        await startupCustomerService.updateProspectStatus(prospectId, 'converted')
      }

      return customer
    } catch (error) {
      console.error('Erreur lors de la conversion:', error)
      return null
    }
  },

  /**
   * Rechercher des clients
   */
  searchCustomers: async (query: string): Promise<StartupCustomer[]> => {
    try {
      const { data, error } = await supabase
        .from('startup.customers')
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