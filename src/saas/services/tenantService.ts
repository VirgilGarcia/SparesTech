// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du wrapper qui utilise l'API backend
export { tenantService } from './tenantServiceWrapper'

// Réexporter les types pour compatibilité
export type { Tenant, TenantUser, TenantSettings } from '../../shared/types/tenant'
export type { UserProfile } from '../../shared/types/user'

// Service original désactivé - utiliser tenantService via le wrapper