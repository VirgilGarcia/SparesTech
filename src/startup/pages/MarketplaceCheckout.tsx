import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { useToast } from '../../shared/context/ToastContext'
import { useMarketplaceApi, type SubscriptionPlan, type MarketplaceCreationRequest } from '../../hooks/api/useMarketplaceApi'
import { useAuthApi } from '../../hooks/api/useAuthApi'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'
import MarketplaceConfigForm from '../components/checkout/MarketplaceConfigForm'
import MarketplaceCreatingPage from '../components/checkout/MarketplaceCreatingPage'
import MarketplaceSuccessPage from '../components/checkout/MarketplaceSuccessPage'
import PlanSummary from '../components/checkout/PlanSummary'

const MarketplaceCheckout: React.FC = () => {
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [step, setStep] = useState<'loading' | 'config' | 'creating' | 'success'>('loading')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketplaceUrl, setMarketplaceUrl] = useState<string | null>(null)

  // Hooks API
  const { getPlan, checkSubdomainAvailability, generateSubdomainSuggestions, createMarketplace } = useMarketplaceApi()
  const { createOrGetProfile } = useAuthApi()

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
      const plan = await getPlan(planId)
      if (plan) {
        setSelectedPlan(plan)
        setStep('config')
      } else {
        showError('Plan non trouvé')
        navigate('/pricing')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du plan:', error)
      showError('Erreur lors du chargement du plan')
      navigate('/pricing')
    }
  }


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSubdomainError(null)

    // Vérifier la disponibilité du sous-domaine en temps réel
    if (field === 'subdomain' && typeof value === 'string' && value.length > 2) {
      handleCheckSubdomainAvailability(value)
    }

    // Générer des suggestions de sous-domaine basées sur le nom
    if (field === 'marketplace_name' && typeof value === 'string' && value.length > 2) {
      handleGenerateSubdomainSuggestions(value)
      // Ne plus auto-remplir le champ, laisser vide pour que l'utilisateur choisisse
    }
  }

  const handleCheckSubdomainAvailability = async (subdomain: string) => {
    setCheckingSubdomain(true)
    setSubdomainError(null)
    
    try {
      // Validation de format en temps réel
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
      const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'shop', 'store']
      
      if (!subdomainRegex.test(subdomain.toLowerCase())) {
        setSubdomainError('Format invalide : lettres, chiffres et tirets seulement')
      } else if (reserved.includes(subdomain.toLowerCase())) {
        setSubdomainError('Ce sous-domaine est réservé')
        // Générer automatiquement des suggestions
        if (formData.marketplace_name) {
          handleGenerateSubdomainSuggestions(formData.marketplace_name)
        }
      } else if (subdomain.length < 2) {
        setSubdomainError('Le sous-domaine doit contenir au moins 2 caractères')
      } else {
        // Vérifier la disponibilité via l'API
        const isAvailable = await checkSubdomainAvailability(subdomain)
        if (!isAvailable) {
          setSubdomainError('Ce sous-domaine n\'est pas disponible')
          // Générer automatiquement des suggestions
          if (formData.marketplace_name) {
            handleGenerateSubdomainSuggestions(formData.marketplace_name)
          }
        } else {
          setSubdomainError(null)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du sous-domaine:', error)
      setSubdomainError('Erreur lors de la vérification')
    } finally {
      setCheckingSubdomain(false)
    }
  }

  const handleGenerateSubdomainSuggestions = async (baseName: string) => {
    try {
      const suggestions = await generateSubdomainSuggestions(baseName)
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
      showError('Le nom du marketplace est requis')
      setLoading(false)
      setStep('config')
      return
    }

    if (!formData.subdomain.trim() && !hasCustomDomain) {
      showError('Le sous-domaine est requis')
      setLoading(false)
      setStep('config')
      return
    }

    if (hasCustomDomain && !formData.custom_domain.trim()) {
      showError('Le domaine personnalisé est requis')
      setLoading(false)
      setStep('config')
      return
    }

    if (subdomainError) {
      showError('Veuillez choisir un sous-domaine disponible')
      setLoading(false)
      setStep('config')
      return
    }

    try {
      // S'assurer que le profil startup existe
      await createOrGetProfile({
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        company_name: formData.marketplace_name,
        phone: user.user_metadata?.phone || ''
      })

      // Préparer les données de création du marketplace
      const marketplaceData: MarketplaceCreationRequest = {
        company_name: formData.marketplace_name,
        admin_first_name: user.user_metadata?.first_name || '',
        admin_last_name: user.user_metadata?.last_name || '',
        admin_email: user.email || '',
        subdomain: hasCustomDomain ? '' : formData.subdomain,
        custom_domain: hasCustomDomain ? formData.custom_domain : undefined,
        public_access: formData.public_access,
        primary_color: formData.primary_color,
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle
      }

      // Créer le marketplace via l'API
      const result = await createMarketplace(marketplaceData)

      if (result) {
        setMarketplaceUrl(result.marketplace_url)
        showSuccess('Marketplace créé avec succès ! Redirection en cours...')
        setStep('success')
      } else {
        showError('Erreur lors de la création du marketplace')
        setStep('config')
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      showError('Erreur lors de la création du marketplace')
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