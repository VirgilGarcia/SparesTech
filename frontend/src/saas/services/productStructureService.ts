// ✅ SERVICE STRUCTURE PRODUITS - MIGRÉ VERS API BACKEND
// Ce service utilise maintenant productFieldService via l'API backend

// Réexport du service de champs de produits qui gère la structure
export { productFieldService as productStructureService } from './productServiceWrapper'

// Les fonctionnalités de structure sont intégrées dans productFieldService :
// - Gestion des champs personnalisés
// - Ordre des champs (catalog_order, product_order)  
// - Activation/désactivation des champs
// - Types de champs (text, number, select, etc.)

// Export des types pour compatibilité
export type { ProductField, ProductFieldDisplay } from './productServiceWrapper'