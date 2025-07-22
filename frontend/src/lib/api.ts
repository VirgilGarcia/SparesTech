// Client API pour notre backend PostgreSQL

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: string[]
  message?: string
}

class ApiClient {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.spares-tech.com' 
    : 'http://localhost:3001'

  /**
   * Effectuer une requête API avec authentification automatique
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Récupérer le token d'authentification depuis localStorage
      const authToken = localStorage.getItem('auth_token')
      
      const url = `${this.baseUrl}/api${endpoint}`
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && {
            'Authorization': `Bearer ${authToken}`
          }),
          ...options.headers
        }
      }

      console.log(`🌐 API ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data)
        return {
          success: false,
          error: data.error || `Erreur ${response.status}`,
          errors: data.errors
        }
      }

      console.log(`✅ API Success:`, data)
      return data

    } catch (error: any) {
      console.error('❌ API Request failed:', error)
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      }
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: { params?: any, responseType?: 'json' | 'blob' }): Promise<ApiResponse<T>> {
    const url = options?.params ? 
      `${endpoint}?${new URLSearchParams(Object.entries(options.params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))}` : 
      endpoint
    
    if (options?.responseType === 'blob') {
      return this.request<T>(url, { method: 'GET' }) as Promise<ApiResponse<T>>
    }
    
    return this.request<T>(url, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options?.headers
      }
    })
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Instance globale du client API
export const api = new ApiClient()

// Types pour les réponses API courantes
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export type { ApiResponse }