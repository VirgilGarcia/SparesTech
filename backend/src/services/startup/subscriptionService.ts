import { supabaseServiceRole } from '../../lib/supabase'
import { StartupSubscription, StartupSubscriptionPlan, BillingCycle, ApiResponse } from '../../types'
import logger from '../../lib/logger'

export class StartupSubscriptionService {
  /**
   * Récupérer tous les plans disponibles
   */
  static async getPlans(): Promise<ApiResponse<StartupSubscriptionPlan[]>> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('startup_subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) {
        throw error
      }

      return {
        success: true,
        data: data || []
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération des plans', { error: error.message })
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
      const { data, error } = await supabaseServiceRole
        .from('startup_subscription_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Plan non trouvé'
          }
        }
        throw error
      }

      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération du plan', { planId, error: error.message })
      return {
        success: false,
        error: 'Erreur lors de la récupération du plan'
      }
    }
  }

  /**
   * Créer une subscription
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
        return planResult as unknown as ApiResponse<StartupSubscription>
      }

      // Vérifier qu'il n'y a pas déjà une subscription active
      const { data: existingSubscription } = await supabaseServiceRole
        .from('startup_subscriptions')
        .select('id, status')
        .eq('customer_id', subscriptionData.customer_id)
        .in('status', ['active', 'trial'])
        .single()

      if (existingSubscription) {
        return {
          success: false,
          error: 'Une subscription active existe déjà pour ce client'
        }
      }

      // Calculer la période d'essai si pas fournie
      let trialEnd = subscriptionData.trial_end
      if (!trialEnd) {
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + 14) // 14 jours d'essai
        trialEnd = trialEndDate.toISOString()
      }

      // Créer la subscription
      const { data, error } = await supabaseServiceRole
        .from('startup_subscriptions')
        .insert([{
          customer_id: subscriptionData.customer_id,
          plan_id: subscriptionData.plan_id,
          tenant_id: subscriptionData.tenant_id || null,
          billing_cycle: subscriptionData.billing_cycle,
          status: 'trial',
          trial_end: trialEnd,
          current_period_start: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Subscription créée', { 
        subscriptionId: data.id, 
        customerId: subscriptionData.customer_id,
        planId: subscriptionData.plan_id
      })

      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la création de la subscription', { 
        subscriptionData, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la création de la subscription'
      }
    }
  }

  /**
   * Récupérer les subscriptions d'un client
   */
  static async getCustomerSubscriptions(customerId: string): Promise<ApiResponse<StartupSubscription[]>> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('startup_subscriptions')
        .select(`
          *,
          startup_subscription_plans (
            name,
            display_name,
            price_monthly,
            price_yearly,
            features,
            limits,
            custom_domain_allowed
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return {
        success: true,
        data: data || []
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération des subscriptions', { 
        customerId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération des subscriptions'
      }
    }
  }

  /**
   * Récupérer la subscription active d'un client
   */
  static async getActiveSubscription(customerId: string): Promise<ApiResponse<StartupSubscription>> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('startup_subscriptions')
        .select(`
          *,
          startup_subscription_plans (
            name,
            display_name,
            price_monthly,
            price_yearly,
            features,
            limits,
            custom_domain_allowed
          )
        `)
        .eq('customer_id', customerId)
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Aucune subscription active trouvée'
          }
        }
        throw error
      }

      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la récupération de la subscription active', { 
        customerId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la récupération de la subscription'
      }
    }
  }

  /**
   * Mettre à jour le tenant_id d'une subscription
   */
  static async updateSubscriptionTenant(subscriptionId: string, tenantId: string): Promise<ApiResponse<StartupSubscription>> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('startup_subscriptions')
        .update({
          tenant_id: tenantId,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Tenant associé à la subscription', { subscriptionId, tenantId })
      return {
        success: true,
        data
      }

    } catch (error: any) {
      logger.error('Erreur lors de la mise à jour du tenant', { 
        subscriptionId, 
        tenantId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de la subscription'
      }
    }
  }

  /**
   * Annuler une subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseServiceRole
        .from('startup_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)

      if (error) {
        throw error
      }

      logger.info('Subscription annulée', { subscriptionId })
      return {
        success: true,
        data: true
      }

    } catch (error: any) {
      logger.error('Erreur lors de l\'annulation de la subscription', { 
        subscriptionId, 
        error: error.message 
      })
      return {
        success: false,
        error: 'Erreur lors de l\'annulation de la subscription'
      }
    }
  }
}