import { useState } from 'react'
import { api } from '../../lib/api'

interface StartupCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CreateCustomerData {
  email: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
}

export function useStartupCustomerApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupérer tous les clients startup
   */
  const getAllCustomers = async (): Promise<StartupCustomer[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<StartupCustomer[]>('/startup/customers')
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la récupération des clients')
        return []
      }
      
      return response.data || []
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupérer un client par ID
   */
  const getCustomerById = async (customerId: string): Promise<StartupCustomer | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<StartupCustomer>(`/startup/customers/${customerId}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération du client')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupérer un client par email
   */
  const getCustomerByEmail = async (email: string): Promise<StartupCustomer | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<StartupCustomer>(`/startup/customers/by-email?email=${encodeURIComponent(email)}`)
      
      if (!response.success) {
        if (response.error?.includes('not found')) {
          return null
        }
        setError(response.error || 'Erreur lors de la récupération du client')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Créer un nouveau client
   */
  const createCustomer = async (customerData: CreateCustomerData): Promise<StartupCustomer | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<StartupCustomer>('/startup/customers', customerData)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création du client')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Mettre à jour un client
   */
  const updateCustomer = async (customerId: string, updates: Partial<StartupCustomer>): Promise<StartupCustomer | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<StartupCustomer>(`/startup/customers/${customerId}`, updates)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour du client')
        return null
      }
      
      return response.data || null
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Désactiver un client
   */
  const deactivateCustomer = async (customerId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put(`/startup/customers/${customerId}/deactivate`)
      
      if (!response.success) {
        setError(response.error || 'Erreur lors de la désactivation du client')
        return false
      }
      
      return true
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getAllCustomers,
    getCustomerById,
    getCustomerByEmail,
    createCustomer,
    updateCustomer,
    deactivateCustomer
  }
}

export type { StartupCustomer, CreateCustomerData }