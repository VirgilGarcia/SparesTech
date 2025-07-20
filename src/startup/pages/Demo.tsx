import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Play, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Palette, 
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react'
import Header from '../components/Header'

const Demo: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <ShoppingCart className="w-12 h-12 text-blue-600" />,
      title: "E-commerce nouvelle génération",
      description: "Catalogue intelligent, panier optimisé, checkout fluide et paiements sécurisés intégrés",
      highlight: "IA incluse"
    },
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: "CRM client avancé",
      description: "Gestion complète des utilisateurs, segmentation automatique et fidélisation intelligente",
      highlight: "Automatisé"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-purple-600" />,
      title: "Analytics temps réel",
      description: "Tableaux de bord intelligents, prédictions de ventes et rapports automatisés",
      highlight: "Prédictif"
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-600" />,
      title: "Design sur mesure",
      description: "Personnalisation complète : logo, couleurs, domaine et thème unique à votre marque",
      highlight: "100% personnalisable"
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: "Sécurité bancaire",
      description: "Conformité PCI-DSS, chiffrement avancé, RGPD et protection des données clients",
      highlight: "Certifié"
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-600" />,
      title: "Performance maximale",
      description: "CDN mondial, optimisation automatique et 99.9% d'uptime garanti",
      highlight: "Ultra-rapide"
    }
  ]

  const demoSteps = [
    {
      step: "01",
      title: "Configuration rapide",
      description: "Paramétrez votre marketplace en 5 minutes avec notre assistant intelligent",
      time: "5 min"
    },
    {
      step: "02", 
      title: "Import de catalogue",
      description: "Importez vos produits via Excel/CSV ou notre API. Migration automatique disponible",
      time: "10 min"
    },
    {
      step: "03",
      title: "Personnalisation",
      description: "Adaptez le design à votre marque avec notre éditeur visuel intuitif",
      time: "15 min"
    },
    {
      step: "04",
      title: "Mise en ligne",
      description: "Votre marketplace est prête ! Partagez le lien et commencez à vendre",
      time: "0 min"
    }
  ]

  const benefits = [
    { icon: <CheckCircle className="w-6 h-6 text-green-600" />, text: "Marketplace opérationnelle en 30 minutes maximum" },
    { icon: <CheckCircle className="w-6 h-6 text-green-600" />, text: "Support expert dédié inclus (réponse < 2h)" },
    { icon: <CheckCircle className="w-6 h-6 text-green-600" />, text: "Mises à jour et nouvelles fonctionnalités automatiques" },
    { icon: <CheckCircle className="w-6 h-6 text-green-600" />, text: "Hébergement SSD haute performance inclus" },
    { icon: <CheckCircle className="w-6 h-6 text-green-600" />, text: "Sauvegardes automatiques multiples par jour" },
    { icon: <CheckCircle className="w-6 h-6 text-green-600" />, text: "Conformité RGPD et sécurité bancaire garantie" }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Play className="w-4 h-4 mr-2" />
              Démonstration en direct
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Découvrez 
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent block md:inline">
                {' '}Spartelio{' '}
              </span>
              en action
            </h1>
            
            <p className="text-xl text-gray-600 mb-3 max-w-4xl mx-auto leading-relaxed">
              Voyez comment notre plateforme transforme votre activité en marketplace moderne.
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-12">
              Une démonstration complète de toutes les fonctionnalités qui feront votre succès.
            </p>
          </div>

          {/* Video Section - Plus impactante */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-8 mb-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative">
              <div className="text-center text-white mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Démonstration complète</h2>
                <p className="text-xl text-blue-100">Toutes les fonctionnalités expliquées en 5 minutes</p>
              </div>
              
              <div className="relative max-w-4xl mx-auto">
                <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group cursor-pointer hover:scale-105 transition-all duration-500 shadow-2xl">
                  <div className="text-center text-white">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-16 h-16 text-white ml-2" />
                    </div>
                    <p className="text-lg font-semibold">Cliquez pour voir la démo</p>
                  </div>
                </div>
                
                {/* Device mockups */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-3 shadow-xl">
                  <Monitor className="w-8 h-8 text-blue-600" />
                  <span className="text-xs text-gray-600 block mt-1">Desktop</span>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-3 shadow-xl">
                  <Smartphone className="w-8 h-8 text-purple-600" />
                  <span className="text-xs text-gray-600 block mt-1">Mobile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Processus simplifié
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                De l'idée à la vente
                <br />
                <span className="text-green-600">en 30 minutes</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Un processus optimisé qui vous mène du concept à une marketplace fonctionnelle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demoSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-white font-bold text-lg">{step.step}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                      
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                        ⏱️ {step.time}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow connector */}
                  {index < demoSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid - Plus moderne */}
          <div className="mb-32">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Fonctionnalités premium
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
                Tout ce dont vous rêvez,
                <br />
                <span className="text-purple-600">déjà intégré</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Une plateforme complète avec les dernières innovations du e-commerce
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="group bg-white rounded-3xl p-10 shadow-xl border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {feature.highlight}
                  </div>
                  
                  <div className="mb-8 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section - Plus impactante */}
          <div className="mb-32">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-16 border border-gray-100">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                  Pourquoi choisir Spartelio ?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Des avantages concrets qui transforment votre business dès le premier jour
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="flex-shrink-0 mt-1">
                      {benefit.icon}
                    </div>
                    <span className="text-gray-700 font-medium text-lg leading-relaxed">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Screenshots Section - Enrichie */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Interface moderne et intuitive
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Conçue pour une expérience utilisateur exceptionnelle sur tous les appareils
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                  <BarChart3 className="w-20 h-20 text-blue-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Dashboard Analytics</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Vue d'ensemble complète avec statistiques en temps réel, graphiques interactifs et insights intelligents</p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                  <ShoppingCart className="w-20 h-20 text-green-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Gestion Produits</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Interface intuitive pour gérer votre catalogue, stocks, prix et promotions avec facilité</p>
              </div>
            </div>
          </div>

          {/* CTA Section - Plus impactante */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-3xl p-16 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                  Prêt à créer
                  <br />
                  votre success story ?
                </h2>
                
                <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Rejoignez des centaines d'entrepreneurs qui transforment leur vision en marketplace prospère
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-white text-blue-600 px-12 py-6 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center"
                  >
                    🚀 Choisir mon plan
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-transparent border-2 border-white text-white px-12 py-6 rounded-xl font-bold text-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
                  >
                    Essai gratuit maintenant
                  </button>
                </div>
                
                <div className="flex justify-center items-center space-x-8 text-blue-200 text-sm">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    En ligne en 24h
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Support dédié
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Garantie satisfait
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Demo