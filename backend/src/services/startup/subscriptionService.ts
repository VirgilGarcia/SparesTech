import { query } from '../../lib/database'
import { StartupSubscription, StartupSubscriptionPlan, BillingCycle, ApiResponse } from '../../types'
import logger from '../../lib/logger'

export class StartupSubscriptionService {
  /**
   * Récupérer tous les plans d'abonnement actifs
   */
  static async getActivePlans(): Promise<ApiResponse<StartupSubscriptionPlan[]>> {
    try {
      const result = await query(
        'SELECT * FROM startup_subscription_plans WHERE is_active = true ORDER BY price_monthly ASC'
      )

      return {
        success: true,
        data: result.rows
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des plans actifs', { error: error.message })
      return {
        success: false,
        error: 'Erreur lors de la récupération des plans'
      }
    }
  }

  /**
   * Récupérer un plan par ID
   */
  static async getPlanById(planId: string): Promise<ApiResponse<StartupSubscriptionPlan>> {
    try {
      const result = await query(
        'SELECT * FROM startup_subscription_plans WHERE id = $1',
        [planId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Plan non trouvé'
        }
      }

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération du plan', { error: error.message, planId })
      return {
        success: false,
        error: 'Erreur lors de la récupération du plan'
      }
    }
  }

  /**
   * Créer un nouvel abonnement
   */
  static async createSubscription(subscriptionData: {
    customer_id: string
    plan_id: string
    tenant_id?: string
    billing_cycle: BillingCycle
    trial_end?: string
  }): Promise<ApiResponse<StartupSubscription>> {
    try {
      // Vérifier que le plan existe
      const planResult = await this.getPlanById(subscriptionData.plan_id)
      if (!planResult.success) {
        return planResult as any
      }

      // Calculer les dates de période
      const now = new Date()
      const currentPeriodStart = now
      const currentPeriodEnd = new Date(now)
      
      if (subscriptionData.billing_cycle === 'monthly') {
        currentPeriodEnd.setMonth(now.getMonth() + 1)
      } else {
        currentPeriodEnd.setFullYear(now.getFullYear() + 1)
      }

      const result = await query(
        `INSERT INTO startup_subscriptions (customer_id, plan_id, tenant_id, billing_cycle, current_period_start, current_period_end, trial_end, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
          subscriptionData.customer_id,
          subscriptionData.plan_id,
          subscriptionData.tenant_id || null,
          subscriptionData.billing_cycle,
          currentPeriodStart.toISOString(),
          currentPeriodEnd.toISOString(),
          subscriptionData.trial_end || null,
          'trial'
        ]
      )

      logger.info('Nouvel abonnement créé', { 
        subscriptionId: result.rows[0].id,
        customerId: subscriptionData.customer_id,
        planId: subscriptionData.plan_id 
      })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la création de l\'abonnement', { 
        error: error.message,
        subscriptionData 
      })
      return {
        success: false,
        error: 'Erreur lors de la création de l\'abonnement'
      }
    }
  }

  /**
   * Récupérer les abonnements d'un client
   */
  static async getCustomerSubscriptions(customerId: string): Promise<ApiResponse<StartupSubscription[]>> {
    try {
      const result = await query(
        `SELECT s.*, p.name as plan_name, p.display_name as plan_display_name 
         FROM startup_subscriptions s 
         JOIN startup_subscription_plans p ON s.plan_id = p.id 
         WHERE s.customer_id = $1 
         ORDER BY s.created_at DESC`,
        [customerId]
      )

      return {
        success: true,
        data: result.rows
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération des abonnements client', { 
        error: error.message,
        customerId 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des abonnements'
      }
    }
  }

  /**
   * Mettre à jour le statut d'un abonnement
   */
  static async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<ApiResponse<StartupSubscription>> {
    try {
      const result = await query(
        'UPDATE startup_subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, subscriptionId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Abonnement non trouvé'
        }
      }

      logger.info('Statut abonnement mis à jour', { 
        subscriptionId,
        newStatus: status 
      })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du statut d\'abonnement', { 
        error: error.message,
        subscriptionId,
        status 
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du statut'
      }
    }
  }

  /**
   * Annuler un abonnement
   */
  static async cancelSubscription(subscriptionId: string): Promise<ApiResponse<StartupSubscription>> {
    try {
      const result = await query(
        'UPDATE startup_subscriptions SET status = $1, cancelled_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
        ['cancelled', subscriptionId]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Abonnement non trouvé'
        }
      }

      logger.info('Abonnement annulé', { subscriptionId })

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error: any) {
      logger.error('Erreur lors de l\'annulation de l\'abonnement', { 
        error: error.message,
        subscriptionId 
      })
      return {
        success: false,
        error: 'Erreur lors de l\'annulation de l\'abonnement'
      }
    }
  }

  /**
   * Vérifier si un utilisateur peut créer une marketplace
   */
  static async canCreateMarketplace(customerId: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await query(
        `SELECT s.*, p.custom_domain_allowed 
         FROM startup_subscriptions s 
         JOIN startup_subscription_plans p ON s.plan_id = p.id 
         WHERE s.customer_id = $1 AND s.status IN ('trial', 'active') 
         ORDER BY s.created_at DESC 
         LIMIT 1`,
        [customerId]
      )

      // Si pas d'abonnement, on peut créer en mode trial
      if (result.rows.length === 0) {
        return {
          success: true,
          data: true
        }
      }

      const subscription = result.rows[0]
      const canCreate = subscription.status === 'active' || subscription.status === 'trial'

      return {
        success: true,
        data: canCreate
      }
    } catch (error: any) {
      logger.error('Erreur lors de la vérification des droits marketplace', { 
        error: error.message,
        customerId 
      })
      return {
        success: false,
        error: 'Erreur lors de la vérification des droits'
      }
    }
  }

  /**
   * Alias pour getActivePlans
   */
  static async getPlans(): Promise<ApiResponse<StartupSubscriptionPlan[]>> {
    return this.getActivePlans()
  }

  /**
   * Récupérer l'abonnement actif d'un customer
   */
  static async getActiveSubscription(customerId: string): Promise<ApiResponse<StartupSubscription | null>> {
    try {
      const result = await query(
        `SELECT s.*, p.name as plan_name, p.display_name as plan_display_name 
         FROM startup_subscriptions s 
         JOIN startup_subscription_plans p ON s.plan_id = p.id 
         WHERE s.customer_id = $1 AND s.status IN ('trial', 'active') 
         ORDER BY s.created_at DESC 
         LIMIT 1`,
        [customerId]
      )

      return {
        success: true,
        data: result.rows.length > 0 ? result.rows[0] : null
      }
    } catch (error: any) {
      logger.error('Erreur lors de la récupération de l\'abonnement actif', { 
        error: error.message,
        customerId 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'abonnement actif'
      }
    }
  }
}