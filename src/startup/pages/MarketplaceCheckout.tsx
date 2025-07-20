import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { startupMarketplaceService } from '../services/marketplaceService'
import { startupSubscriptionService, type StartupSubscriptionPlan } from '../services/subscriptionService'
import { marketplaceProvisioningService } from '../services/marketplaceProvisioningService'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'
import MarketplaceConfigForm from '../components/checkout/MarketplaceConfigForm'
import MarketplaceCreatingPage from '../components/checkout/MarketplaceCreatingPage'
import MarketplaceSuccessPage from '../components/checkout/MarketplaceSuccessPage'
import PlanSummary from '../components/checkout/PlanSummary'

const MarketplaceCheckout: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<StartupSubscriptionPlan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [step, setStep] = useState<'loading' | 'config' | 'creating' | 'success'>('loading')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketplaceUrl, setMarketplaceUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    marketplace_name: '',
    subdomain: '',
    custom_domain: '',
    public_access: true,
    primary_color: '#10B981'
  })

  const [subdomainSuggestions, setSubdomainSuggestions] = useState<string[]>([])
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)
  const [subdomainError, setSubdomainError] = useState<string | null>(null)
  const [hasCustomDomain, setHasCustomDomain] = useState(false)

  useEffect(() => {
    loadPlanFromUrl()
  }, [])

  const loadPlanFromUrl = async () => {
    try {
      const planId = searchParams.get('plan')
      const billing = searchParams.get('billing') as 'monthly' | 'yearly'
      
      if (!planId) {
        // Rediriger vers la page pricing si pas de plan
        navigate('/pricing')
        return
      }

      if (billing) {
        setBillingCycle(billing)
      }

      // Charger le plan depuis l'API
      const plan = await startupSubscriptionService.getPlanById(planId)
      if (plan) {
        setSelectedPlan(plan)
        setStep('config')
      } else {
        setError('Plan non trouvé')
        navigate('/pricing')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du plan:', error)
      setError('Erreur lors du chargement du plan')
      navigate('/pricing')
    }
  }


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSubdomainError(null)

    // Vérifier la disponibilité du sous-domaine en temps réel
    if (field === 'subdomain' && typeof value === 'string' && value.length > 2) {
      checkSubdomainAvailability(value)
    }

    // Générer des suggestions de sous-domaine basées sur le nom
    if (field === 'marketplace_name' && typeof value === 'string' && value.length > 2) {
      generateSubdomainSuggestions(value)
      // Auto-remplir le sous-domaine si vide
      if (!formData.subdomain) {
        const cleanName = value.toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        setFormData(prev => ({ ...prev, subdomain: cleanName }))
        if (cleanName.length > 2) {
          checkSubdomainAvailability(cleanName)
        }
      }
    }
  }

  const checkSubdomainAvailability = async (subdomain: string) => {
    setCheckingSubdomain(true)
    setSubdomainError(null)
    try {
      const isAvailable = await marketplaceProvisioningService.checkSubdomainAvailability(subdomain)
      if (!isAvailable) {
        setSubdomainError('Ce sous-domaine n\'est pas disponible')
        // Générer automatiquement des suggestions
        if (formData.marketplace_name) {
          generateSubdomainSuggestions(formData.marketplace_name)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du sous-domaine:', error)
      setSubdomainError('Erreur lors de la vérification')
    } finally {
      setCheckingSubdomain(false)
    }
  }

  const generateSubdomainSuggestions = async (baseName: string) => {
    try {
      const suggestions = await marketplaceProvisioningService.generateSubdomainSuggestions(baseName)
      setSubdomainSuggestions(suggestions.slice(0, 3)) // Limiter à 3 suggestions
    } catch (error) {
      console.error('Erreur lors de la génération de suggestions:', error)
      setSubdomainSuggestions([])
    }
  }

  const handleCreateMarketplace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPlan) return

    setLoading(true)
    setError(null)
    setStep('creating')

    // Validation complète
    if (!formData.marketplace_name.trim()) {
      setError('Le nom du marketplace est requis')
      setLoading(false)
      setStep('config')
      return
    }

    if (!formData.subdomain.trim() && !hasCustomDomain) {
      setError('Le sous-domaine est requis')
      setLoading(false)
      setStep('config')
      return
    }

    if (hasCustomDomain && !formData.custom_domain.trim()) {
      setError('Le domaine personnalisé est requis')
      setLoading(false)
      setStep('config')
      return
    }

    if (subdomainError) {
      setError('Veuillez choisir un sous-domaine disponible')
      setLoading(false)
      setStep('config')
      return
    }

    try {
      // Créer le prospect
      const prospect = await startupMarketplaceService.createProspect({
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        company_name: formData.marketplace_name,
        phone: user.user_metadata?.phone || '',
        selected_plan_id: selectedPlan.id,
        desired_subdomain: hasCustomDomain ? undefined : formData.subdomain
      })

      if (prospect?.error) {
        setError(prospect.error)
        setStep('config')
        return
      }

      // Créer le marketplace
      const marketplace = await startupMarketplaceService.createMarketplaceDev({
        prospectId: prospect?.id!,
        company_name: formData.marketplace_name,
        admin_first_name: user.user_metadata?.first_name || '',
        admin_last_name: user.user_metadata?.last_name || '',
        admin_email: user.email || '',
        admin_password: crypto.randomUUID().replace(/-/g, '').substring(0, 16),
        subdomain: hasCustomDomain ? undefined : formData.subdomain,
        custom_domain: hasCustomDomain ? formData.custom_domain : undefined,
        public_access: formData.public_access,
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        user_id: user.id,
        primary_color: formData.primary_color
      })

      if (marketplace?.url) {
        setMarketplaceUrl(marketplace.url)
        setStep('success')
      } else {
        setError('Erreur lors de la création du marketplace')
        setStep('config')
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      setError('Erreur lors de la création du marketplace')
      setStep('config')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (step === 'creating') {
    return <MarketplaceCreatingPage />
  }

  if (step === 'success' && marketplaceUrl) {
    return (
      <MarketplaceSuccessPage
        marketplaceName={formData.marketplace_name}
        marketplaceUrl={marketplaceUrl}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb 
            steps={[
              { label: 'Plan', status: 'completed' },
              { label: 'Configuration', status: 'current' },
              { label: 'Création', status: 'upcoming' }
            ]}
          />
          
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne configuration */}
            <div className="lg:col-span-2">
              <MarketplaceConfigForm
                formData={formData}
                hasCustomDomain={hasCustomDomain}
                customDomainAllowed={selectedPlan?.custom_domain_allowed || false}
                subdomainSuggestions={subdomainSuggestions}
                checkingSubdomain={checkingSubdomain}
                subdomainError={subdomainError}
                onInputChange={handleInputChange}
                onToggleCustomDomain={() => setHasCustomDomain(!hasCustomDomain)}
                onSubmit={handleCreateMarketplace}
                loading={loading}
                error={error}
              />
            </div>

            {/* Colonne résumé */}
            <div className="lg:col-span-1">
              {selectedPlan && (
                <PlanSummary
                  selectedPlan={selectedPlan}
                  billingCycle={billingCycle}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceCheckout