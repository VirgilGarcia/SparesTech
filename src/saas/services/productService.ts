// Service de gestion des produits
// Utilise l'API backend pour toutes les opérations
export { productService, productFieldService } from './productServiceWrapper'
export type {
  Product,
  ProductField,
  CreateProductData,
  UpdateProductData,
  ProductFilter,
  ProductDisplay,
  ProductFieldDisplay
} from './productServiceWrapper'