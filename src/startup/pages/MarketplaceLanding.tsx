import { useState } from 'react'
import { marketplaceProvisioningService } from '../services/marketplaceProvisioningService'
import type { MarketplaceCreationRequest, TenantCreationResult } from '../types/marketplace'

function MarketplaceLanding() {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [formData, setFormData] = useState<MarketplaceCreationRequest>({
    company_name: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_password: '',
    subdomain: '',
    custom_domain: '',
    public_access: true,
    primary_color: '#10b981'
  })
  const [errors, setErrors] = useState<string[]>([])
  const [result, setResult] = useState<TenantCreationResult | null>(null)
  const [subdomainSuggestions, setSubdomainSuggestions] = useState<string[]>([])
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)
  const [checkingCompanyName, setCheckingCompanyName] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const handleInputChange = (field: keyof MarketplaceCreationRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([])

    // Vérifier la disponibilité du sous-domaine en temps réel
    if (field === 'subdomain' && typeof value === 'string' && value.length > 2) {
      checkSubdomainAvailability(value)
    }

    // Vérifier la disponibilité du nom d'entreprise en temps réel
    if (field === 'company_name' && typeof value === 'string' && value.length > 2) {
      checkCompanyNameAvailability(value)
      generateSubdomainSuggestions(value)
    }

    // Vérifier la disponibilité de l'email en temps réel
    if (field === 'admin_email' && typeof value === 'string' && value.includes('@') && value.includes('.')) {
      checkEmailAvailability(value)
    }
  }

  const checkSubdomainAvailability = async (subdomain: string) => {
    setCheckingSubdomain(true)
    try {
      const isAvailable = await marketplaceProvisioningService.checkSubdomainAvailability(subdomain)
      if (!isAvailable) {
        setErrors(prev => [...prev.filter(e => !e.includes('sous-domaine')), 'Ce sous-domaine n\'est pas disponible'])
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du sous-domaine:', error)
    } finally {
      setCheckingSubdomain(false)
    }
  }

  const checkCompanyNameAvailability = async (companyName: string) => {
    setCheckingCompanyName(true)
    try {
      const isAvailable = await marketplaceProvisioningService.checkCompanyNameAvailability(companyName)
      if (!isAvailable) {
        setErrors(prev => [...prev.filter(e => !e.includes('nom d\'entreprise')), 'Ce nom d\'entreprise est déjà utilisé'])
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du nom d\'entreprise:', error)
    } finally {
      setCheckingCompanyName(false)
    }
  }

  const checkEmailAvailability = async (email: string) => {
    setCheckingEmail(true)
    try {
      const isAvailable = await marketplaceProvisioningService.checkEmailAvailability(email)
      if (!isAvailable) {
        setErrors(prev => [...prev.filter(e => !e.includes('email')), 'Cet email est déjà utilisé'])
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error)
    } finally {
      setCheckingEmail(false)
    }
  }

  const generateSubdomainSuggestions = async (companyName: string) => {
    try {
      const suggestions = await marketplaceProvisioningService.generateSubdomainSuggestions(companyName)
      setSubdomainSuggestions(suggestions)
    } catch (error) {
      console.error('Erreur lors de la génération des suggestions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('processing')
    setErrors([])

    try {
      const creationResult = await marketplaceProvisioningService.createMarketplace(formData)
      setResult(creationResult)
      
      if (creationResult.success) {
        setStep('success')
      } else {
        setErrors(creationResult.errors || ['Erreur inconnue'])
        setStep('error')
      }
    } catch (error) {
      console.error('Erreur lors de la création du marketplace:', error)
      setErrors(['Erreur technique lors de la création'])
      setStep('error')
    }
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto text-center">
          <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-4">Création en cours</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Configuration de votre marketplace personnalisé. 
            <br />Cela ne prend que quelques instants.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'success' && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="w-full px-6 lg:px-16 xl:px-32 py-6">
            <h1 className="text-2xl font-light text-gray-900">SparesTech</h1>
          </div>
        </header>
        
        <div className="w-full px-6 lg:px-16 xl:px-32 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-gray-900 mb-4">
                  Marketplace créé avec succès
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Votre marketplace <span className="font-medium">{formData.company_name}</span> est maintenant 
                  configuré et prêt à l'emploi.
                </p>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">URL de votre marketplace</h3>
                    <div className="bg-white border rounded-lg p-3">
                      <a 
                        href={result.marketplace_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-mono text-sm break-all transition-colors"
                      >
                        {result.marketplace_url}
                      </a>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Interface d'administration</h3>
                    <div className="bg-white border rounded-lg p-3">
                      <a 
                        href={result.admin_login_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-mono text-sm break-all transition-colors"
                      >
                        {result.admin_login_url}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-emerald-900 mb-4">Prochaines étapes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-xs font-medium rounded-full flex items-center justify-center">1</span>
                        <span className="text-emerald-800 text-sm">Connectez-vous à votre administration</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-xs font-medium rounded-full flex items-center justify-center">2</span>
                        <span className="text-emerald-800 text-sm">Personnalisez vos paramètres</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-xs font-medium rounded-full flex items-center justify-center">3</span>
                        <span className="text-emerald-800 text-sm">Ajoutez vos produits et catégories</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-xs font-medium rounded-full flex items-center justify-center">4</span>
                        <span className="text-emerald-800 text-sm">Configurez votre domaine (optionnel)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <a
                    href={result.admin_login_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Accéder à l'administration
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Erreur de création</h2>
            <div className="space-y-2 mb-8">
              {errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm leading-relaxed">{error}</p>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep('form')}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header épuré comme dans votre app */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-6 lg:px-16 xl:px-32 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-light text-gray-900">SparesTech</h1>
              <span className="text-sm text-gray-500 font-light">Création de marketplace</span>
            </div>
            <div className="text-sm text-gray-600 font-light">
              Quelques minutes suffisent
            </div>
          </div>
        </div>
      </header>

      {/* Hero section comme votre style */}
      <section className="w-full py-16 bg-white">
        <div className="w-full px-6 lg:px-16 xl:px-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Créez votre
              <span className="block font-medium mt-2 text-emerald-600">
                marketplace industriel
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Lancez votre boutique en ligne de pièces détachées. Interface professionnelle, 
              gestion simplifiée, clients satisfaits.
            </p>
          </div>
        </div>
      </section>

      {/* Formulaire dans le style de votre app */}
      <section className="w-full py-12 bg-gray-50">
        <div className="w-full px-6 lg:px-16 xl:px-32">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Section Entreprise */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 pb-4 border-b border-gray-100">
                      Informations entreprise
                    </h3>
              
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'entreprise *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="ACME Pièces Auto"
                      />
                      {checkingCompanyName && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <span className="animate-spin h-3 w-3 border border-emerald-600 border-t-transparent rounded-full"></span>
                          Vérification...
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom admin *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.admin_first_name}
                          onChange={(e) => handleInputChange('admin_first_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Jean"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom admin *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.admin_last_name}
                          onChange={(e) => handleInputChange('admin_last_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email administrateur *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.admin_email}
                        onChange={(e) => handleInputChange('admin_email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="admin@acme-pieces.fr"
                      />
                      {checkingEmail && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <span className="animate-spin h-3 w-3 border border-emerald-600 border-t-transparent rounded-full"></span>
                          Vérification...
                        </p>
                      )}
                      {!checkingEmail && (
                        <p className="text-xs text-gray-500 mt-1">
                          Contact principal de votre marketplace
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe administrateur *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={formData.admin_password}
                        onChange={(e) => handleInputChange('admin_password', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                    </div>
                  </div>

                  {/* Section Configuration */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 pb-4 border-b border-gray-100">
                      Configuration marketplace
                    </h3>
              
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-domaine *
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          required
                          value={formData.subdomain}
                          onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="acme-pieces"
                          pattern="[a-z0-9\-]*"
                        />
                        <div className="px-4 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600 font-mono">
                          .sparestech.com
                        </div>
                      </div>
                      {checkingSubdomain && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <span className="animate-spin h-3 w-3 border border-emerald-600 border-t-transparent rounded-full"></span>
                          Vérification...
                        </p>
                      )}
                      {subdomainSuggestions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Suggestions disponibles :</p>
                          <div className="flex flex-wrap gap-2">
                            {subdomainSuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleInputChange('subdomain', suggestion)}
                                className="px-3 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domaine personnalisé (optionnel)
                      </label>
                      <input
                        type="text"
                        value={formData.custom_domain}
                        onChange={(e) => handleInputChange('custom_domain', e.target.value.toLowerCase())}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="marketplace.acme-pieces.fr"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Vous pourrez configurer votre propre domaine plus tard
                      </p>
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Mode d'accès
                </label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.public_access 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      checked={formData.public_access}
                      onChange={() => handleInputChange('public_access', true)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Public</div>
                      <p className="text-sm text-gray-600">
                        Accessible à tous • Les visiteurs peuvent s'inscrire
                      </p>
                    </div>
                  </label>
                  
                  <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    !formData.public_access 
                      ? 'border-orange-300 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      checked={!formData.public_access}
                      onChange={() => handleInputChange('public_access', false)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Privé</div>
                      <p className="text-sm text-gray-600">
                        Connexion obligatoire • Vous créez les comptes
                      </p>
                    </div>
                  </label>
                </div>
              </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur principale
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors font-mono text-sm"
                          placeholder="#10b981"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Cette couleur sera utilisée pour les boutons et accènts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Erreurs */}
                {errors.length > 0 && (
                  <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">Veuillez corriger les erreurs suivantes :</h4>
                        <ul className="space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-red-700 text-sm">• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bouton de création */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={errors.length > 0}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      Créer mon marketplace
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    En créant votre marketplace, vous acceptez nos conditions d'utilisation.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default MarketplaceLanding