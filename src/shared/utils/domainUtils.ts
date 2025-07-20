import type { DomainInfo } from '../types/marketplace'
import { useDomainApi } from '../../hooks/api/useDomainApi'

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
  if (hostname.endsWith('.spartelio.local')) {
    const subdomain = hostname.replace('.spartelio.local', '')
    
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
  
  if (hostname === 'spartelio.local') {
    return {
      isMainSite: true,
      subdomain: null,
      customDomain: null,
      tenantId: null,
      hostname
    }
  }
  
  // Production - domaine principal Spartelio
  if (hostname === 'spartelio.com' || hostname === 'www.spartelio.com') {
    return {
      isMainSite: true,
      subdomain: null,
      customDomain: null,
      tenantId: null,
      hostname
    }
  }
  
  // Sous-domaine Spartelio (client.spartelio.com)
  if (hostname.endsWith('.spartelio.com')) {
    const subdomain = hostname.replace('.spartelio.com', '')
    
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
  const domainApi = useDomainApi()
  return domainApi.resolveTenantFromDomain(domainInfo)
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
 * Vérifie si nous sommes sur le site principal Spartelio
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
    window.location.href = 'https://spartelio.com/'
  }
}

/**
 * Génère l'URL complète pour un sous-domaine
 */
export function generateMarketplaceUrl(subdomain: string): string {
  if (window.location.hostname === 'localhost') {
    return `http://localhost:5173/?tenant=${subdomain}` // Pour le dev
  }
  return `https://${subdomain}.spartelio.com/`
}