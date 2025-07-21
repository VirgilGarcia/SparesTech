// Modules produits - Utiliser les services principaux
export { productService, productFieldService } from '../productServiceWrapper'
export { categoryService } from '../categoryServiceWrapper'

// Exports de compatibilité (obsolètes)
export const ProductCrudService = 'OBSOLETE - Utiliser productService'
export const ProductQueryService = 'OBSOLETE - Utiliser productService'
export const ProductValidationService = 'OBSOLETE - Utiliser productService'  
export const ProductCategoriesService = 'OBSOLETE - Utiliser categoryService'