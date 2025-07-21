// ✅ MIGRÉ VERS API BACKEND
// Ce service utilise maintenant l'API backend pour éviter les problèmes RLS

// Réexport du wrapper qui utilise l'API backend
export { settingsService } from './settingsServiceWrapper'
export type { MarketplaceSettings } from './settingsServiceWrapper'