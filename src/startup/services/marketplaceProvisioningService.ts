import { supabase } from '../lib/supabase'
import { settingsService } from './saas/settingsService'
import { productStructureService } from './saas/productStructureService'
import { categoryService } from './saas/categoryService'
import type { MarketplaceCreationRequest, TenantCreationResult } from '../types/marketplace'

export const marketplaceProvisioningService = {
  
  /**
   * Vérifie la disponibilité d'un sous-domaine
   */
  checkSubdomainAvailability: async (subdomain: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_availability', {
        check_type: 'subdomain',
        check_value: subdomain.toLowerCase()
      })

      if (error) throw error
      return data === true
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
      const { data, error } = await supabase.rpc('check_availability', {
        check_type: 'custom_domain',
        check_value: domain.toLowerCase()
      })

      if (error) throw error
      return data === true
    } catch (error) {
      console.error('Erreur lors de la vérification du domaine personnalisé:', error)
      return false
    }
  },

  /**
   * Vérifie la disponibilité d'un nom d'entreprise
   */
  checkCompanyNameAvailability: async (companyName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_availability', {
        check_type: 'company_name',
        check_value: companyName.trim()
      })

      if (error) throw error
      return data === true
    } catch (error) {
      console.error('Erreur lors de la vérification du nom d\'entreprise:', error)
      return false
    }
  },

  /**
   * Vérifie la disponibilité d'un email
   */
  checkEmailAvailability: async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_availability', {
        check_type: 'email',
        check_value: email.toLowerCase().trim()
      })

      if (error) throw error
      return data === true
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error)
      return false
    }
  },

  /**
   * Valide une demande de création de marketplace
   */
  validateMarketplaceRequest: async (request: MarketplaceCreationRequest): Promise<string[]> => {
    const errors: string[] = []

    // Validation des champs obligatoires
    if (!request.company_name?.trim()) errors.push('Le nom de l\'entreprise est requis')
    if (!request.admin_first_name?.trim()) errors.push('Le prénom de l\'administrateur est requis')
    if (!request.admin_last_name?.trim()) errors.push('Le nom de l\'administrateur est requis')
    if (!request.admin_email?.trim()) errors.push('L\'email de l\'administrateur est requis')
    if (!request.admin_password?.trim()) errors.push('Le mot de passe est requis')
    if (!request.subdomain?.trim()) errors.push('Le sous-domaine est requis')

    // Validation du format du sous-domaine
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
    if (request.subdomain && !subdomainRegex.test(request.subdomain)) {
      errors.push('Le sous-domaine ne peut contenir que des lettres minuscules, chiffres et tirets')
    }

    // Validation de l'email administrateur
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (request.admin_email && !emailRegex.test(request.admin_email)) {
      errors.push('L\'email administrateur n\'est pas valide')
    }

    // Validation de la longueur du mot de passe
    if (request.admin_password && request.admin_password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères')
    }

    // Validation de la longueur du nom d'entreprise
    if (request.company_name && request.company_name.trim().length < 2) {
      errors.push('Le nom de l\'entreprise doit contenir au moins 2 caractères')
    }

    // Vérification de la disponibilité de l'email
    if (request.admin_email?.trim()) {
      const isEmailAvailable = await marketplaceProvisioningService.checkEmailAvailability(request.admin_email.trim())
      if (!isEmailAvailable) {
        errors.push('Cet email est déjà utilisé')
      }
    }

    // Vérification de la disponibilité du nom d'entreprise
    if (request.company_name?.trim()) {
      const isCompanyNameAvailable = await marketplaceProvisioningService.checkCompanyNameAvailability(request.company_name.trim())
      if (!isCompanyNameAvailable) {
        errors.push('Ce nom d\'entreprise est déjà utilisé')
      }
    }

    // Vérification de la disponibilité du sous-domaine
    if (request.subdomain) {
      const isSubdomainAvailable = await marketplaceProvisioningService.checkSubdomainAvailability(request.subdomain)
      if (!isSubdomainAvailable) {
        errors.push('Ce sous-domaine n\'est pas disponible')
      }
    }

    // Vérification de la disponibilité du domaine personnalisé
    if (request.custom_domain) {
      const isDomainAvailable = await marketplaceProvisioningService.checkCustomDomainAvailability(request.custom_domain)
      if (!isDomainAvailable) {
        errors.push('Ce domaine personnalisé n\'est pas disponible')
      }
    }

    return errors
  },

  /**
   * Crée un nouveau tenant avec marketplace complet
   */
  createMarketplace: async (request: MarketplaceCreationRequest): Promise<TenantCreationResult> => {
    // Validation côté client
    const validationErrors = await marketplaceProvisioningService.validateMarketplaceRequest(request)
    if (validationErrors.length > 0) {
      return {
        tenant_id: '',
        admin_user_id: '',
        marketplace_url: '',
        admin_login_url: '',
        success: false,
        errors: validationErrors
      }
    }

    try {
      // Générer un sous-domaine unique si nécessaire
      let finalSubdomain = request.subdomain.toLowerCase().trim()
      
      // Ajouter un timestamp pour garantir l'unicité lors des tests
      if (finalSubdomain === 'test' || finalSubdomain === 'demo' || finalSubdomain === 'acme') {
        finalSubdomain = `${finalSubdomain}-${Date.now()}`
      }

      // Appel de la fonction SQL qui s'exécute avec des privilèges élevés
      const { data, error } = await supabase.rpc('create_marketplace_complete', {
        p_company_name: request.company_name.trim(),
        p_admin_first_name: request.admin_first_name.trim(),
        p_admin_last_name: request.admin_last_name.trim(),
        p_admin_email: request.admin_email.toLowerCase().trim(),
        p_admin_password: request.admin_password,
        p_subdomain: finalSubdomain,
        p_custom_domain: request.custom_domain?.toLowerCase().trim() || null,
        p_public_access: request.public_access,
        p_primary_color: request.primary_color || '#10b981'
      })

      if (error) {
        console.error('❌ Erreur RPC:', error)
        throw new Error(`Erreur lors de la création: ${error.message}`)
      }

      if (!data || !data.success) {
        console.error('❌ Erreur retournée par la fonction:', data)
        return {
          tenant_id: '',
          admin_user_id: '',
          marketplace_url: '',
          admin_login_url: '',
          success: false,
          errors: [data?.error || 'Erreur inconnue lors de la création']
        }
      }

      // Succès - retourner les données
      return {
        tenant_id: data.tenant_id,
        admin_user_id: data.admin_user_id,
        marketplace_url: data.marketplace_url,
        admin_login_url: data.admin_login_url,
        success: true
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de la création du marketplace:', error)

      return {
        tenant_id: '',
        admin_user_id: '',
        marketplace_url: '',
        admin_login_url: '',
        success: false,
        errors: [error.message || 'Erreur technique lors de la création']
      }
    }
  },

  /**
   * Nettoie les données en cas d'échec de création
   */
  cleanupFailedMarketplace: async (tenant_id: string, admin_user_id?: string): Promise<void> => {
    try {
      console.log('🧹 Nettoyage des données après échec...')

      // Supprimer les paramètres
      await supabase
        .from('marketplace_settings')
        .delete()
        .eq('tenant_id', tenant_id)

      // Supprimer les champs produit
      await supabase
        .from('product_field_display')
        .delete()
        .eq('tenant_id', tenant_id)

      // Supprimer les catégories
      await supabase
        .from('categories')
        .delete()
        .eq('tenant_id', tenant_id)

      // Supprimer le profil utilisateur
      if (admin_user_id) {
        await supabase
          .from('user_profiles')
          .delete()
          .eq('id', admin_user_id)
      }

      // Supprimer le tenant
      await supabase
        .from('tenants')
        .delete()
        .eq('id', tenant_id)

      console.log('✅ Nettoyage terminé')
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error)
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
    if (await marketplaceProvisioningService.checkSubdomainAvailability(base)) {
      suggestions.push(base)
    }

    // Essayer avec des suffixes
    const suffixes = ['marketplace', 'store', 'shop', '2024', 'online']
    for (const suffix of suffixes) {
      const candidate = `${base}-${suffix}`
      if (await marketplaceProvisioningService.checkSubdomainAvailability(candidate)) {
        suggestions.push(candidate)
        if (suggestions.length >= 5) break
      }
    }

    return suggestions
  }
}