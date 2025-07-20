import { supabaseServiceRole } from '../../lib/supabase'
import { 
  Tenant, 
  TenantSettings, 
  UserProfile, 
  MarketplaceCreationRequest, 
  MarketplaceCreationResult,
  ApiResponse 
} from '../../types'
import { StartupUserService } from './userService'
import { StartupSubscriptionService } from './subscriptionService'
import logger from '../../lib/logger'

export class MarketplaceService {
  /**
   * Créer un marketplace complet
   */
  static async createMarketplace(
    userId: string, 
    request: MarketplaceCreationRequest
  ): Promise<ApiResponse<MarketplaceCreationResult>> {
    const transaction = await supabaseServiceRole.rpc('begin_transaction')
    
    try {
      // 1. Vérifier/créer le profil startup
      const userResult = await StartupUserService.getOrCreateProfile(userId, {
        email: request.admin_email,
        first_name: request.admin_first_name,
        last_name: request.admin_last_name,
        company_name: request.company_name
      })

      if (!userResult.success) {
        throw new Error(userResult.error)
      }

      // 2. Vérifier le plan de subscription
      const planResult = await StartupSubscriptionService.getPlanById(request.plan_id)
      if (!planResult.success) {
        throw new Error('Plan de subscription invalide')
      }

      const plan = planResult.data!

      // 3. Valider le domaine personnalisé selon le plan
      let finalCustomDomain = request.custom_domain?.toLowerCase().trim() || null
      if (finalCustomDomain && !plan.custom_domain_allowed) {
        logger.warn('Domaine personnalisé refusé pour ce plan', { 
          planId: request.plan_id, 
          domain: finalCustomDomain 
        })
        finalCustomDomain = null
      }

      // 4. Vérifier la disponibilité du sous-domaine
      const subdomainCheck = await this.checkSubdomainAvailability(request.subdomain)
      if (!subdomainCheck.success) {
        throw new Error(subdomainCheck.error)
      }

      // 5. Créer la subscription AVANT le tenant
      const subscriptionResult = await StartupSubscriptionService.createSubscription({
        customer_id: userId,
        plan_id: request.plan_id,
        billing_cycle: request.billing_cycle,
        // tenant_id sera mis à jour après création du tenant
      })

      if (!subscriptionResult.success) {
        throw new Error(subscriptionResult.error)
      }

      const subscription = subscriptionResult.data!

      // 6. Créer le tenant
      const { data: tenant, error: tenantError } = await supabaseServiceRole
        .from('tenants')
        .insert([{
          name: request.company_name,
          subdomain: request.subdomain.toLowerCase(),
          custom_domain: finalCustomDomain,
          owner_id: userId,
          subscription_status: 'trial',
          is_active: true
        }])
        .select()
        .single()

      if (tenantError) {
        throw new Error(`Erreur création tenant: ${tenantError.message}`)
      }

      // 7. Créer immédiatement le profil admin user_profiles
      const { error: adminProfileError } = await supabaseServiceRole
        .from('user_profiles')
        .insert([{
          id: userId,
          tenant_id: tenant.id,
          email: request.admin_email,
          first_name: request.admin_first_name,
          last_name: request.admin_last_name,
          role: 'admin',
          is_active: true
        }])

      if (adminProfileError) {
        throw new Error(`Erreur création profil admin: ${adminProfileError.message}`)
      }

      // 8. Créer les paramètres du tenant
      const { error: settingsError } = await supabaseServiceRole
        .from('tenant_settings')
        .insert([{
          tenant_id: tenant.id,
          company_name: request.company_name,
          primary_color: request.primary_color || '#10b981',
          public_access: request.public_access,
          show_prices: true,
          show_stock: true,
          show_categories: true
        }])

      if (settingsError) {
        throw new Error(`Erreur création paramètres: ${settingsError.message}`)
      }

      // 9. Associer la subscription au tenant
      await StartupSubscriptionService.updateSubscriptionTenant(subscription.id, tenant.id)

      // 10. Créer les catégories par défaut
      await this.createDefaultCategories(tenant.id)

      // 11. Créer les champs produits par défaut
      await this.createDefaultProductFields(tenant.id)

      await supabaseServiceRole.rpc('commit_transaction')

      const marketplaceUrl = finalCustomDomain 
        ? `https://${finalCustomDomain}` 
        : `https://${request.subdomain}.spares-tech.com`

      const result: MarketplaceCreationResult = {
        success: true,
        tenant_id: tenant.id,
        subscription_id: subscription.id,
        marketplace_url: marketplaceUrl,
        admin_login_url: `${marketplaceUrl}/admin/login`
      }

      logger.info('Marketplace créé avec succès', {
        userId,
        tenantId: tenant.id,
        subscriptionId: subscription.id,
        subdomain: request.subdomain
      })

      return {
        success: true,
        data: result
      }

    } catch (error: any) {
      await supabaseServiceRole.rpc('rollback_transaction')
      
      logger.error('Erreur lors de la création du marketplace', {
        userId,
        request,
        error: error.message
      })

      return {
        success: false,
        error: error.message || 'Erreur lors de la création du marketplace'
      }
    }
  }

  /**
   * Vérifier la disponibilité d'un sous-domaine
   */
  static async checkSubdomainAvailability(subdomain: string): Promise<ApiResponse<boolean>> {
    try {
      // Validation du format
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
      if (!subdomainRegex.test(subdomain.toLowerCase())) {
        return {
          success: false,
          error: 'Format de sous-domaine invalide'
        }
      }

      // Mots réservés
      const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'shop', 'store', 'support']
      if (reserved.includes(subdomain.toLowerCase())) {
        return {
          success: false,
          error: 'Ce sous-domaine est réservé'
        }
      }

      // Vérifier la disponibilité en base
      const { data, error } = await supabaseServiceRole
        .from('tenants')
        .select('id')
        .eq('subdomain', subdomain.toLowerCase())
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        return {
          success: false,
          error: 'Ce sous-domaine est déjà utilisé'
        }
      }

      return {
        success: true,
        data: true
      }

    } catch (error: any) {
      logger.error('Erreur lors de la vérification du sous-domaine', {
        subdomain,
        error: error.message
      })
      return {
        success: false,
        error: 'Erreur lors de la vérification'
      }
    }
  }

  /**
   * Générer des suggestions de sous-domaines
   */
  static async generateSubdomainSuggestions(baseName: string): Promise<ApiResponse<string[]>> {
    try {
      const suggestions: string[] = []
      const base = baseName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 20) // Limiter la longueur

      if (base.length < 2) {
        return {
          success: true,
          data: []
        }
      }

      // Essayer le nom de base
      const baseCheck = await this.checkSubdomainAvailability(base)
      if (baseCheck.success && baseCheck.data) {
        suggestions.push(base)
      }

      // Avec suffixes métier
      const suffixes = ['store', 'shop', 'parts', 'pro', 'biz']
      for (const suffix of suffixes) {
        if (suggestions.length >= 5) break
        
        const candidate = `${base}-${suffix}`
        const check = await this.checkSubdomainAvailability(candidate)
        if (check.success && check.data) {
          suggestions.push(candidate)
        }
      }

      // Avec numéros
      for (let i = 1; i <= 10; i++) {
        if (suggestions.length >= 5) break
        
        const candidate = `${base}${i}`
        const check = await this.checkSubdomainAvailability(candidate)
        if (check.success && check.data) {
          suggestions.push(candidate)
        }
      }

      return {
        success: true,
        data: suggestions.slice(0, 5)
      }

    } catch (error: any) {
      logger.error('Erreur lors de la génération de suggestions', {
        baseName,
        error: error.message
      })
      return {
        success: false,
        error: 'Erreur lors de la génération de suggestions'
      }
    }
  }

  /**
   * Récupérer les marketplaces d'un utilisateur startup
   */
  static async getUserMarketplaces(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('tenants')
        .select(`
          id,
          name,
          subdomain,
          custom_domain,
          subscription_status,
          is_active,
          created_at,
          startup_subscriptions (
            id,
            status,
            billing_cycle,
            current_period_start,
            current_period_end,
            startup_subscription_plans (
              name,
              display_name,
              price_monthly,
              price_yearly
            )
          )
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const marketplaces = (data || []).map(tenant => ({
        tenant_id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        custom_domain: tenant.custom_domain,
        marketplace_url: tenant.custom_domain 
          ? `https://${tenant.custom_domain}`
          : `https://${tenant.subdomain}.spares-tech.com`,
        admin_url: tenant.custom_domain
          ? `https://${tenant.custom_domain}/admin`
          : `https://${tenant.subdomain}.spares-tech.com/admin`,
        subscription_status: tenant.subscription_status,
        is_active: tenant.is_active,
        created_at: tenant.created_at,
        subscription: tenant.startup_subscriptions?.[0] || null
      }))

      return {
        success: true,
        data: marketplaces
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération des marketplaces', {
        userId,
        error: error.message
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des marketplaces'
      }
    }
  }

  /**
   * Créer les catégories par défaut pour un nouveau tenant
   */
  private static async createDefaultCategories(tenantId: string): Promise<void> {
    const defaultCategories = [
      { name: 'Pièces moteur', description: 'Pièces et composants moteur' },
      { name: 'Carrosserie', description: 'Éléments de carrosserie et accessoires' },
      { name: 'Électronique', description: 'Composants électroniques et électriques' },
      { name: 'Filtres', description: 'Filtres à air, huile, carburant' },
      { name: 'Freinage', description: 'Système de freinage' }
    ]

    await supabaseServiceRole
      .from('categories')
      .insert(
        defaultCategories.map((cat, index) => ({
          tenant_id: tenantId,
          name: cat.name,
          description: cat.description,
          level: 0,
          path: '',
          sort_order: index,
          is_active: true
        }))
      )
  }

  /**
   * Créer les champs produits par défaut
   */
  private static async createDefaultProductFields(tenantId: string): Promise<void> {
    const defaultFields = [
      { name: 'reference', display_name: 'Référence', type: 'text', show_in_catalog: true, catalog_order: 1 },
      { name: 'name', display_name: 'Nom', type: 'text', show_in_catalog: true, catalog_order: 2 },
      { name: 'price', display_name: 'Prix', type: 'number', show_in_catalog: true, catalog_order: 3 },
      { name: 'stock_quantity', display_name: 'Stock', type: 'number', show_in_catalog: true, catalog_order: 4 },
      { name: 'description', display_name: 'Description', type: 'textarea', show_in_catalog: false, catalog_order: 5 }
    ]

    await supabaseServiceRole
      .from('product_field_display')
      .insert(
        defaultFields.map(field => ({
          tenant_id: tenantId,
          field_name: field.name,
          field_type: 'system',
          display_name: field.display_name,
          show_in_catalog: field.show_in_catalog,
          show_in_product: true,
          catalog_order: field.catalog_order,
          product_order: field.catalog_order,
          is_active: true
        }))
      )
  }
}