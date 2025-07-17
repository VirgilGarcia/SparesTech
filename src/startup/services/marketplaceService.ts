import { supabase } from '../../lib/supabase'
import { startupCustomerService } from './customerService'
import { startupSubscriptionService } from './subscriptionService'

export interface MarketplaceCreationRequest {
  customer_id: string
  company_name: string
  subdomain: string
  custom_domain?: string
  plan_id: string
  billing_cycle: 'monthly' | 'yearly'
  public_access?: boolean
  primary_color?: string
}

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
   * Vérifie la disponibilité d'un sous-domaine
   */
  checkSubdomainAvailability: async (subdomain: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('public.tenants')
        .select('id')
        .eq('subdomain', subdomain.toLowerCase())
        .single()

      if (error && error.code === 'PGRST116') {
        // Pas de résultat = disponible
        return true
      }

      if (error) throw error
      
      // Sous-domaine déjà pris
      return false
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
      const { data, error } = await supabase
        .from('public.tenants')
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
  createMarketplace: async (request: MarketplaceCreationRequest): Promise<MarketplaceCreationResult> => {
    try {
      // 1. Vérifier le client
      const customer = await startupCustomerService.getCustomerById(request.customer_id)
      if (!customer) {
        return {
          success: false,
          error: 'Client non trouvé'
        }
      }

      // 2. Vérifier le plan
      const plan = await startupSubscriptionService.getPlanById(request.plan_id)
      if (!plan) {
        return {
          success: false,
          error: 'Plan non trouvé'
        }
      }

      // 3. Vérifier la disponibilité du sous-domaine
      const isSubdomainAvailable = await startupMarketplaceService.checkSubdomainAvailability(request.subdomain)
      if (!isSubdomainAvailable) {
        return {
          success: false,
          error: 'Sous-domaine non disponible'
        }
      }

      // 4. Vérifier la disponibilité du domaine personnalisé
      if (request.custom_domain) {
        const isDomainAvailable = await startupMarketplaceService.checkCustomDomainAvailability(request.custom_domain)
        if (!isDomainAvailable) {
          return {
            success: false,
            error: 'Domaine personnalisé non disponible'
          }
        }
      }

      // 5. Créer le tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('public.tenants')
        .insert([{
          name: request.company_name,
          subdomain: request.subdomain.toLowerCase(),
          custom_domain: request.custom_domain?.toLowerCase() || null,
          subscription_status: 'active'
        }])
        .select()
        .single()

      if (tenantError) {
        throw new Error(`Erreur lors de la création du tenant: ${tenantError.message}`)
      }

      // 6. Créer l'abonnement
      const subscription = await startupSubscriptionService.createSubscription({
        customer_id: request.customer_id,
        plan_id: request.plan_id,
        tenant_id: tenant.id,
        billing_cycle: request.billing_cycle
      })

      if (!subscription) {
        // Nettoyer le tenant créé
        await supabase.from('public.tenants').delete().eq('id', tenant.id)
        return {
          success: false,
          error: 'Erreur lors de la création de l\'abonnement'
        }
      }

      // 7. Créer les paramètres du marketplace
      const { error: settingsError } = await supabase
        .from('public.marketplace_settings')
        .insert([{
          tenant_id: tenant.id,
          company_name: request.company_name,
          public_access: request.public_access ?? true,
          primary_color: request.primary_color || '#10b981',
          show_prices: true,
          show_stock: true,
          show_categories: true
        }])

      if (settingsError) {
        // Nettoyer les données créées
        await supabase.from('startup.subscriptions').delete().eq('id', subscription.id)
        await supabase.from('public.tenants').delete().eq('id', tenant.id)
        return {
          success: false,
          error: 'Erreur lors de la création des paramètres'
        }
      }

      // 8. Créer les catégories par défaut
      const defaultCategories = [
        { name: 'Général', description: 'Catégorie générale', order_index: 0 },
        { name: 'Pièces détachées', description: 'Pièces de rechange', order_index: 1 },
        { name: 'Consommables', description: 'Produits consommables', order_index: 2 }
      ]

      const { error: categoriesError } = await supabase
        .from('public.categories')
        .insert(defaultCategories.map(cat => ({
          ...cat,
          tenant_id: tenant.id,
          is_active: true,
          level: 0
        })))

      if (categoriesError) {
        console.warn('Erreur lors de la création des catégories:', categoriesError)
        // On continue même si les catégories échouent
      }

      // 9. Créer la structure de champs produits par défaut
      const defaultFields = [
        { field_name: 'reference', display_name: 'Référence', catalog_order: 1, product_order: 1 },
        { field_name: 'name', display_name: 'Nom', catalog_order: 2, product_order: 2 },
        { field_name: 'prix', display_name: 'Prix', catalog_order: 3, product_order: 3 },
        { field_name: 'stock', display_name: 'Stock', catalog_order: 4, product_order: 4 }
      ]

      const { error: fieldsError } = await supabase
        .from('public.product_field_display')
        .insert(defaultFields.map(field => ({
          ...field,
          tenant_id: tenant.id,
          field_type: 'system',
          show_in_catalog: true,
          show_in_product: true,
          active: true
        })))

      if (fieldsError) {
        console.warn('Erreur lors de la création des champs:', fieldsError)
        // On continue même si les champs échouent
      }

      // 10. Construire les URLs
      const marketplaceUrl = `${request.subdomain}.spares-tech.com`
      const adminLoginUrl = `${marketplaceUrl}/admin/login`

      return {
        success: true,
        tenant_id: tenant.id,
        marketplace_url: marketplaceUrl,
        admin_login_url: adminLoginUrl,
        subscription_id: subscription.id
      }

    } catch (error: any) {
      console.error('Erreur lors de la création du marketplace:', error)
      return {
        success: false,
        error: error.message || 'Erreur technique lors de la création'
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
        'public.order_items',
        'public.orders',
        'public.product_categories',
        'public.product_field_values',
        'public.product_field_display',
        'public.product_fields',
        'public.products',
        'public.categories',
        'public.marketplace_settings',
        'public.tenant_users',
        'public.user_profiles',
        'public.marketplace_subscriptions'
      ]

      for (const table of tablesToClean) {
        await supabase.from(table).delete().eq('tenant_id', tenantId)
      }

      // 3. Supprimer le tenant
      await supabase.from('public.tenants').delete().eq('id', tenantId)

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
        .from('startup.subscriptions')
        .select(`
          tenant_id,
          status,
          created_at,
          plan:startup.subscription_plans(name, display_name),
          tenant:public.tenants(name, subdomain, custom_domain)
        `)
        .eq('customer_id', customerId)

      if (error) throw error

      return (data || []).map(sub => ({
        tenant_id: sub.tenant_id,
        tenant_name: sub.tenant?.name || '',
        subdomain: sub.tenant?.subdomain || '',
        custom_domain: sub.tenant?.custom_domain,
        marketplace_url: sub.tenant?.custom_domain || `${sub.tenant?.subdomain}.spares-tech.com`,
        subscription_status: sub.status,
        plan_name: sub.plan?.display_name || '',
        created_at: sub.created_at
      }))
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
        .from('startup.subscriptions')
        .select(`
          status,
          created_at,
          customer:startup.customers(first_name, last_name, company_name),
          tenant:public.tenants(name, subdomain),
          plan:startup.subscription_plans(price_monthly, price_yearly),
          billing_cycle
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const subscriptions = data || []
      const active = subscriptions.filter(sub => sub.status === 'active')
      
      let totalRevenue = 0
      active.forEach(sub => {
        if (sub.plan) {
          if (sub.billing_cycle === 'monthly') {
            totalRevenue += sub.plan.price_monthly * 12 // ARR
          } else if (sub.billing_cycle === 'yearly' && sub.plan.price_yearly) {
            totalRevenue += sub.plan.price_yearly
          }
        }
      })

      const recentMarketplaces = subscriptions.slice(0, 5).map(sub => ({
        tenant_name: sub.tenant?.name || '',
        subdomain: sub.tenant?.subdomain || '',
        customer_name: sub.customer ? `${sub.customer.first_name} ${sub.customer.last_name}` : '',
        created_at: sub.created_at
      }))

      // Compter les clients uniques
      const uniqueCustomers = new Set(subscriptions.map(sub => sub.customer?.company_name).filter(Boolean))

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