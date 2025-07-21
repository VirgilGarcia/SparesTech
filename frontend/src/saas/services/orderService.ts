// Service de gestion des commandes
// Utilise l'API backend pour toutes les opérations
export { orderService, orderItemService } from './orderServiceWrapper'
export type {
  Order,
  OrderItem,
  CreateOrderData,
  UpdateOrderData,
  OrderFilter,
  OrderStats
} from './orderServiceWrapper'