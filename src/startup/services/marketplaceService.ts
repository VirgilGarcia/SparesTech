import { supabase } from '../../lib/supabase'
import { startupCustomerService } from './customerService'
import { startupSubscriptionService } from './subscriptionService'
import { getOrCreateStartupUserProfile } from './userProfileService'
import type { MarketplaceCreationRequest as SharedMarketplaceCreationRequest } from '../../shared/types/marketplace'

export interface MarketplaceCreationResult {
  success: boolean
  tenant_id?: string
  marketplace_url?: string
  admin_login_url?: string
  subscription_id?: string
  error?: string
}

export const startupMarketplaceService = {
  
  /**
   * Créer un client startup
   */
  createCustomer: async (customerData: {
    email: string
    first_name: string
    last_name: string
    company_name: string
    phone?: string
  }) => {
    return await startupCustomerService.createCustomer(customerData)
  },

  /**
   * Créer un prospect
   */
  createProspect: async (prospectData: {
    email: string
    first_name: string
    last_name: string
    company_name: string
    phone?: string
    desired_subdomain?: string
    selected_plan_id?: string
  }): Promise<{ id: string; error?: string } | null> => {
    try {
      // D'abord, essayer d'insérer un nouveau prospect
      const { data, error } = await supabase
        .from('marketplace_prospects')
        .insert([{
          email: prospectData.email,
          first_name: prospectData.first_name,
          last_name: prospectData.last_name,
          company_name: prospectData.company_name,
          phone: prospectData.phone,
          desired_subdomain: prospectData.desired_subdomain,
          selected_plan_id: prospectData.selected_plan_id && prospectData.selected_plan_id.length > 10 ? prospectData.selected_plan_id : null,
          status: 'prospect'
        }])
        .select('id')
        .single()

      if (error) {
        // Gestion des erreurs de contraintes
        if (error.code === '23505') {
          if (error.message.includes('email')) {
            // L'email existe déjà, récupérer l'enregistrement existant
            // Un utilisateur peut créer plusieurs marketplaces avec le même email
            const { data: existingProspect, error: selectError } = await supabase
              .from('marketplace_prospects')
              .select('id')
              .eq('email', prospectData.email)
              .single()
            
            if (selectError) {
              console.error('Erreur lors de la récupération du prospect existant:', selectError)
              return { id: '', error: 'Erreur technique lors de la création du prospect' }
            }
            
            return existingProspect
          }
          if (error.message.includes('company_name')) {
            return { id: '', error: 'Ce nom d\'entreprise est déjà pris' }
          }
          if (error.message.includes('desired_subdomain')) {
            return { id: '', error: 'Ce sous-domaine est déjà pris' }
          }
        }
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Erreur lors de la création du prospect:', error)
      return { id: '', error: 'Erreur technique lors de la création du prospect' }
    }
  },

  /**
   * Créer un marketplace en mode développement (sans paiement)
   */
  createMarketplaceDev: async (requestData: {
    prospectId?: string
    company_name: string
    admin_first_name: string
    admin_last_name: string
    admin_email: string
    admin_password: string
    subdomain?: string
    custom_domain?: string
    public_access: boolean
    primary_color?: string
    plan_id: string
    billing_cycle: 'monthly' | 'yearly'
    user_id: string // ID de l'utilisateur connecté
  }): Promise<{ url?: string; company_name?: string; admin_email?: string } | null> => {
    try {
      // Utiliser le sous-domaine fourni ou générer un sous-domaine temporaire
      let subdomain = requestData.subdomain
      if (!subdomain) {
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        subdomain = `dev-${requestData.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${randomSuffix}`
      }
      
      // 1. Créer le marketplace directement (mode dev)
      const marketplace = await startupMarketplaceService.createMarketplace({
        company_name: requestData.company_name,
        admin_first_name: requestData.admin_first_name,
        admin_last_name: requestData.admin_last_name,
        admin_email: requestData.admin_email,
        admin_password: requestData.admin_password,
        subdomain: subdomain,
        custom_domain: requestData.custom_domain,
        public_access: requestData.public_access,
        primary_color: requestData.primary_color || '#10b981'
      })
      
      if (!marketplace?.success || !marketplace.tenant_id) {
        return null
      }

      // 2. Créer le customer (startup)
      const customer = await startupCustomerService.createCustomer({
        email: requestData.admin_email,
        first_name: requestData.admin_first_name,
        last_name: requestData.admin_last_name,
        company_name: requestData.company_name,
        phone: ''
      })

      if (!customer) {
        return null
      }

              // 3. Créer la subscription
        const subscription = await startupSubscriptionService.createSubscription({
          customer_id: customer.id,
          plan_id: requestData.plan_id,
          tenant_id: marketplace.tenant_id,
          billing_cycle: requestData.billing_cycle
        })

      if (!subscription) {
        return null
      }

      // 4. Créer ou mettre à jour le profil startup de l'utilisateur
      try {
        await getOrCreateStartupUserProfile(requestData.user_id, {
          email: requestData.admin_email,
          first_name: requestData.admin_first_name,
          last_name: requestData.admin_last_name,
          company_name: requestData.company_name
        })
      } catch (profileError) {
        console.error('Erreur lors de la création du profil startup:', profileError)
      }

      // 5. Créer le user_profile admin pour le tenant SaaS
      const { error: tenantProfileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: requestData.user_id,
          tenant_id: marketplace.tenant_id,
          first_name: requestData.admin_first_name,
          last_name: requestData.admin_last_name,
          email: requestData.admin_email,
          role: 'admin',
          is_active: true
        }])

      if (tenantProfileError) {
        console.error('Erreur lors de la création du profil admin tenant:', tenantProfileError)
      }

      return {
        url: `http://localhost:5174?tenant=${subdomain}`,
        company_name: requestData.company_name,
        admin_email: requestData.admin_email
      }
      
    } catch (error) {
      console.error('Erreur lors de la création du marketplace dev:', error)
      return null
    }
  },

  /**
   * Traiter le paiement et créer le marketplace
   */
  processPaymentAndCreateMarketplace: async (requestData: {
    prospectId?: string
    company_name: string
    admin_first_name: string
    admin_last_name: string
    admin_email: string
    admin_password: string
    subdomain: string
    custom_domain?: string
    public_access: boolean
    primary_color?: string
    plan_id: string
    billing_cycle: 'monthly' | 'yearly'
    payment_data: Record<string, unknown>
  }): Promise<{ url?: string; company_name?: string; admin_email?: string } | null> => {
    try {
      // Simuler le traitement du paiement
      
      
      // Créer le marketplace (simulation)
      const marketplace = await startupMarketplaceService.createMarketplace({
        company_name: requestData.company_name,
        admin_first_name: requestData.admin_first_name,
        admin_last_name: requestData.admin_last_name,
        admin_email: requestData.admin_email,
        admin_password: requestData.admin_password,
        subdomain: requestData.subdomain,
        custom_domain: requestData.custom_domain,
        public_access: requestData.public_access,
        primary_color: requestData.primary_color
      })

      if (marketplace?.success && marketplace.marketplace_url) {
        return {
          url: marketplace.marketplace_url,
          company_name: requestData.company_name,
          admin_email: requestData.admin_email
        }
      }
      
      return null
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error)
      return null
    }
  },
  
  /**
   * Vérifie la disponibilité d'un sous-domaine
   */
  checkSubdomainAvailability: async (subdomain: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id')
        .eq('subdomain', subdomain.toLowerCase())
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Si data existe, sous-domaine déjà pris
      return !data
    } catch (error) {
      console.error('Erreur lors de la vérification du sous-domaine:', error)
      return false
    }
  },

  /**
   * Vérifie la disponibilité d'un domaine personnalisé
   */
  checkCustomDomainAvailability: async (domain: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tenants')
        .select('id')
        .eq('custom_domain', domain.toLowerCase())
        .single()

      if (error && error.code === 'PGRST116') {
        return true
      }

      if (error) throw error
      return false
    } catch (error) {
      console.error('Erreur lors de la vérification du domaine:', error)
      return false
    }
  },

  /**
   * Génère des suggestions de sous-domaines disponibles
   */
  generateSubdomainSuggestions: async (baseName: string): Promise<string[]> => {
    const suggestions: string[] = []
    const base = baseName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Essayer le nom de base
    if (await startupMarketplaceService.checkSubdomainAvailability(base)) {
      suggestions.push(base)
    }

    // Essayer avec des suffixes
    const suffixes = ['store', 'shop', 'marketplace', 'parts', 'spares']
    for (const suffix of suffixes) {
      if (suggestions.length >= 5) break
      
      const candidate = `${base}-${suffix}`
      if (await startupMarketplaceService.checkSubdomainAvailability(candidate)) {
        suggestions.push(candidate)
      }
    }

    // Essayer avec des numéros
    for (let i = 1; i <= 10; i++) {
      if (suggestions.length >= 5) break
      
      const candidate = `${base}${i}`
      if (await startupMarketplaceService.checkSubdomainAvailability(candidate)) {
        suggestions.push(candidate)
      }
    }

    return suggestions
  },

  /**
   * Crée un marketplace complet pour un client
   */
  createMarketplace: async (request: SharedMarketplaceCreationRequest): Promise<MarketplaceCreationResult> => {
    try {
      // 1. Vérifier la disponibilité du sous-domaine
      const isSubdomainAvailable = await startupMarketplaceService.checkSubdomainAvailability(request.subdomain)
      if (!isSubdomainAvailable) {
        return {
          success: false,
          error: 'Sous-domaine non disponible'
        }
      }

      // 2. Vérifier la disponibilité du domaine personnalisé
      if (request.custom_domain) {
        const isDomainAvailable = await startupMarketplaceService.checkCustomDomainAvailability(request.custom_domain)
        if (!isDomainAvailable) {
          return {
            success: false,
            error: 'Domaine personnalisé non disponible'
          }
        }
      }

      // 3. Créer le tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([{
          name: request.company_name,
          subdomain: request.subdomain.toLowerCase(),
          custom_domain: request.custom_domain?.toLowerCase() || null,
          subscription_status: 'active'
        }])
        .select()
        .single()

      if (tenantError) {
        // Gestion des erreurs de contraintes
        if (tenantError.code === '23505') {
          if (tenantError.message.includes('subdomain')) {
            return {
              success: false,
              error: 'Ce sous-domaine est déjà utilisé'
            }
          }
          if (tenantError.message.includes('custom_domain')) {
            return {
              success: false,
              error: 'Ce domaine personnalisé est déjà utilisé'
            }
          }
        }
        throw new Error(`Erreur lors de la création du tenant: ${tenantError.message}`)
      }

      // 4. Créer les paramètres du marketplace
      const { error: settingsError } = await supabase
        .from('marketplace_settings')
        .insert([{
          tenant_id: tenant.id,
          company_name: request.company_name,
          subdomain: request.subdomain.toLowerCase(),
          custom_domain: request.custom_domain?.toLowerCase() || null,
          public_access: request.public_access ?? true,
          primary_color: request.primary_color || '#10b981',
          show_prices: true,
          show_stock: true,
          show_categories: true
        }])

      if (settingsError) {
        // Nettoyer les données créées
        await supabase.from('tenants').delete().eq('id', tenant.id)
        return {
          success: false,
          error: 'Erreur lors de la création des paramètres'
        }
      }

      // 5. Construire les URLs
      const marketplaceUrl = `https://${request.subdomain}.spares-tech.com`
      const adminLoginUrl = `${marketplaceUrl}/admin/login`

      return {
        success: true,
        tenant_id: tenant.id,
        marketplace_url: marketplaceUrl,
        admin_login_url: adminLoginUrl
      }

    } catch (error: unknown) {
      console.error('Erreur lors de la création du marketplace:', error)
      return {
        success: false,
        error: (error as Error).message || 'Erreur technique lors de la création'
      }
    }
  },

  /**
   * Supprime un marketplace et toutes ses données
   */
  deleteMarketplace: async (tenantId: string): Promise<boolean> => {
    try {
      // 1. Supprimer l'abonnement
      const subscription = await startupSubscriptionService.getSubscriptionByTenant(tenantId)
      if (subscription) {
        await startupSubscriptionService.cancelSubscription(subscription.id)
      }

      // 2. Supprimer les données du marketplace (ordre important pour les FK)
      const tablesToClean = [
        'order_items',
        'orders',
        'product_categories',
        'product_field_values',
        'product_field_display',
        'product_fields',
        'products',
        'categories',
        'marketplace_settings',
        'tenant_users',
        'user_profiles',
        'marketplace_subscriptions'
      ]

      for (const table of tablesToClean) {
        await supabase.from(table).delete().eq('tenant_id', tenantId)
      }

      // 3. Supprimer le tenant
      await supabase.from('tenants').delete().eq('id', tenantId)

      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du marketplace:', error)
      return false
    }
  },

  /**
   * Récupère les marketplaces d'un client
   */
  getCustomerMarketplaces: async (customerId: string): Promise<Array<{
    tenant_id: string
    tenant_name: string
    subdomain: string
    custom_domain: string | null
    marketplace_url: string
    subscription_status: string
    plan_name: string
    created_at: string
  }>> => {
    try {
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select(`
          tenant_id,
          status,
          created_at,
          subscription_plans(name, display_name),
          tenants(name, subdomain, custom_domain)
        `)
        .eq('customer_id', customerId)

      if (error) throw error

      return (data || []).map((sub: Record<string, unknown>) => {
        const tenant = sub.tenants as Record<string, unknown> | null
        const plan = sub.subscription_plans as Record<string, unknown> | null
        return {
          tenant_id: sub.tenant_id as string,
          tenant_name: tenant?.name as string || '',
          subdomain: tenant?.subdomain as string || '',
          custom_domain: tenant?.custom_domain as string | null,
          marketplace_url: tenant?.custom_domain as string || `${tenant?.subdomain}.spares-tech.com`,
          subscription_status: sub.status as string,
          plan_name: plan?.display_name as string || '',
          created_at: sub.created_at as string
        }
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des marketplaces:', error)
      return []
    }
  },

  /**
   * Récupère les statistiques globales des marketplaces
   */
  getMarketplaceStats: async (): Promise<{
    totalMarketplaces: number
    activeMarketplaces: number
    totalCustomers: number
    totalRevenue: number
    recentMarketplaces: Array<{
      tenant_name: string
      subdomain: string
      customer_name: string
      created_at: string
    }>
  }> => {
    try {
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select(`
          status,
          created_at,
          startup_customers(first_name, last_name, company_name),
          tenants(name, subdomain),
          startup_subscription_plans(price_monthly, price_yearly),
          billing_cycle
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const subscriptions = data || []
      const active = subscriptions.filter((sub: Record<string, unknown>) => sub.status === 'active')
      
      let totalRevenue = 0
      active.forEach((sub: Record<string, unknown>) => {
        if (sub.startup_subscription_plans) {
          const plans = sub.startup_subscription_plans as Record<string, unknown>
          if (sub.billing_cycle === 'monthly') {
            totalRevenue += (plans.price_monthly as number) * 12 // ARR
          } else if (sub.billing_cycle === 'yearly' && plans.price_yearly) {
            totalRevenue += plans.price_yearly as number
          }
        }
      })

      const recentMarketplaces = subscriptions.slice(0, 5).map((sub: Record<string, unknown>) => {
        const tenant = sub.tenants as Record<string, unknown> | null
        const customer = sub.startup_customers as Record<string, unknown> | null
        return {
          tenant_name: tenant?.name as string || '',
          subdomain: tenant?.subdomain as string || '',
          customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
          created_at: sub.created_at as string
        }
      })

      // Compter les clients uniques
      const uniqueCustomers = new Set(subscriptions.map((sub: Record<string, unknown>) => {
        const customer = sub.startup_customers as Record<string, unknown> | null
        return customer?.company_name as string
      }).filter(Boolean))

      return {
        totalMarketplaces: subscriptions.length,
        activeMarketplaces: active.length,
        totalCustomers: uniqueCustomers.size,
        totalRevenue,
        recentMarketplaces
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        totalMarketplaces: 0,
        activeMarketplaces: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        recentMarketplaces: []
      }
    }
  }
}