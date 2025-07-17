import { supabase } from '../lib/supabase'
import type { DomainInfo } from '../types/marketplace'

/**
 * Analyse le domaine actuel pour déterminer quel tenant afficher
 */
export function parseDomain(): DomainInfo {
  const hostname = window.location.hostname
  
  // Développement local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Permettre de tester avec ?tenant=subdomain
    const urlParams = new URLSearchParams(window.location.search)
    const testTenant = urlParams.get('tenant')
    
    if (testTenant) {
      return {
        isMainSite: false,
        subdomain: testTenant,
        customDomain: null,
        tenantId: null, // À résoudre via API
        hostname
      }
    }
    
    return {
      isMainSite: true,
      subdomain: null,
      customDomain: null,
      tenantId: null,
      hostname
    }
  }
  
  // Développement local avec domaines .local
  if (hostname.endsWith('.sparestech.local')) {
    const subdomain = hostname.replace('.sparestech.local', '')
    
    if (subdomain === 'www' || subdomain === '') {
      return {
        isMainSite: true,
        subdomain: null,
        customDomain: null,
        tenantId: null,
        hostname
      }
    }
    
    return {
      isMainSite: false,
      subdomain,
      customDomain: null,
      tenantId: null, // À résoudre via API
      hostname
    }
  }
  
  if (hostname === 'sparestech.local') {
    return {
      isMainSite: true,
      subdomain: null,
      customDomain: null,
      tenantId: null,
      hostname
    }
  }
  
  // Production - domaine principal SparesTech
  if (hostname === 'sparestech.com' || hostname === 'www.sparestech.com') {
    return {
      isMainSite: true,
      subdomain: null,
      customDomain: null,
      tenantId: null,
      hostname
    }
  }
  
  // Sous-domaine SparesTech (client.sparestech.com)
  if (hostname.endsWith('.sparestech.com')) {
    const subdomain = hostname.replace('.sparestech.com', '')
    
    // Exclure les sous-domaines système
    const systemSubdomains = ['www', 'api', 'admin', 'app', 'dashboard']
    if (systemSubdomains.includes(subdomain)) {
      return {
        isMainSite: true,
        subdomain: null,
        customDomain: null,
        tenantId: null,
        hostname
      }
    }
    
    return {
      isMainSite: false,
      subdomain,
      customDomain: null,
      tenantId: null, // À résoudre via API
      hostname
    }
  }
  
  // Domaine personnalisé
  return {
    isMainSite: false,
    subdomain: null,
    customDomain: hostname,
    tenantId: null, // À résoudre via API
    hostname
  }
}

/**
 * Résout le tenant_id basé sur le domaine
 */
export async function resolveTenantFromDomain(domainInfo: DomainInfo): Promise<string | null> {
  if (domainInfo.isMainSite) {
    return null
  }
  
  try {
    let query = supabase
      .from('marketplace_settings')
      .select('tenant_id')
      .limit(1)
    
    // Recherche par sous-domaine
    if (domainInfo.subdomain) {
      query = query.eq('subdomain', domainInfo.subdomain)
    }
    // Recherche par domaine personnalisé
    else if (domainInfo.customDomain) {
      query = query.eq('custom_domain', domainInfo.customDomain)
    }
    else {
      return null
    }
    
    const { data, error } = await query.single()
    
    if (error || !data) {
      console.warn('Aucun tenant trouvé pour le domaine:', domainInfo)
      return null
    }
    
    return data.tenant_id
    
  } catch (error) {
    console.error('Erreur lors de la résolution du tenant:', error)
    return null
  }
}

/**
 * Hook pour obtenir les informations du domaine actuel
 */
export async function getCurrentDomainInfo(): Promise<DomainInfo> {
  const domainInfo = parseDomain()
  
  if (!domainInfo.isMainSite) {
    const tenantId = await resolveTenantFromDomain(domainInfo)
    domainInfo.tenantId = tenantId
  }
  
  return domainInfo
}

/**
 * Vérifie si nous sommes sur le site principal SparesTech
 */
export function isMainSite(): boolean {
  const domainInfo = parseDomain()
  return domainInfo.isMainSite
}

/**
 * Redirige vers le site principal si nécessaire
 */
export function redirectToMainSite(): void {
  if (window.location.hostname === 'localhost') {
    window.location.href = 'http://localhost:5173/'
  } else {
    window.location.href = 'https://sparestech.com/'
  }
}

/**
 * Génère l'URL complète pour un sous-domaine
 */
export function generateMarketplaceUrl(subdomain: string): string {
  if (window.location.hostname === 'localhost') {
    return `http://localhost:5173/?tenant=${subdomain}` // Pour le dev
  }
  return `https://${subdomain}.sparestech.com/`
}