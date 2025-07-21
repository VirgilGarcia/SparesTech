import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CheckCircle, 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  BarChart3,
  Sparkles,
  Rocket
} from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import Header from '../components/Header'

const Homepage: React.FC = () => {
  const { } = useAuth()
  const navigate = useNavigate()

  const handleDemoClick = () => {
    navigate('/demo')
  }

  const handleMainCTA = () => {
    // Toujours rediriger vers pricing pour sélectionner un plan
    navigate('/pricing')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Version compacte */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
                <Rocket className="w-4 h-4 mr-2" />
                Bienvenue chez Spartelio - Votre succès commence ici
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Votre{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  marketplace
                </span>
                {' '}en 24h chrono
              </h1>
            </div>
            
            <div className="animate-fade-in-up animation-delay-200 mb-12">
              <p className="text-xl text-gray-600 mb-3 max-w-4xl mx-auto leading-relaxed">
                Créez, lancez et développez votre business en ligne sans limite. 
              </p>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto">
                Solution 100% française, conforme RGPD, avec support expert inclus.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-400 mb-12">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={handleMainCTA}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 text-lg transform hover:-translate-y-1"
                >
                  Créer ma marketplace
                </button>
                <button
                  onClick={handleDemoClick}
                  className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
                >
                  Voir la démo
                </button>
              </div>
            </div>

            {/* Social proof simplifié */}
            <div className="animate-fade-in-up animation-delay-600">
              <p className="text-sm text-gray-400">Rejoint par +500 professionnels en 6 mois</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <p className="text-gray-600 font-medium">Marketplaces créées</p>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                24h
              </div>
              <p className="text-gray-600 font-medium">Mise en ligne moyenne</p>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                +150%
              </div>
              <p className="text-gray-600 font-medium">CA moyen des clients</p>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <p className="text-gray-600 font-medium">Uptime garanti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Fonctionnalités premium
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Tout ce dont vous rêvez,
              <br />
              <span className="text-blue-600">prêt à l'emploi</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une plateforme pensée par des professionnels du e-commerce, 
              pour des professionnels qui veulent réussir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-10 h-10 text-blue-500" />,
                title: "Site web professionnel",
                description: "Design moderne, responsive et optimisé SEO. Votre image de marque sublimée.",
                highlight: "Personnalisable"
              },
              {
                icon: <Users className="w-10 h-10 text-green-500" />,
                title: "Gestion clients avancée",
                description: "CRM intégré, historique d'achats, segmentation automatique. Fidélisez naturellement.",
                highlight: "CRM inclus"
              },
              {
                icon: <BarChart3 className="w-10 h-10 text-purple-500" />,
                title: "Analytics & insights",
                description: "Tableaux de bord en temps réel, analytics avancés, rapports automatisés. Décidez en données.",
                highlight: "Temps réel"
              },
              {
                icon: <Shield className="w-10 h-10 text-red-500" />,
                title: "Sécurité bancaire",
                description: "Paiements sécurisés, conformité PCI-DSS, sauvegarde automatique. Dormez tranquille.",
                highlight: "Certifié"
              },
              {
                icon: <Zap className="w-10 h-10 text-yellow-500" />,
                title: "Performance ultra-rapide",
                description: "CDN mondial, optimisation automatique, 99.9% d'uptime. Vos clients adorent la vitesse.",
                highlight: "Garanti 99.9%"
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-teal-500" />,
                title: "Support expert dédié",
                description: "Chat en direct, formations personnalisées, consultant attitré. Nous sommes vos partenaires.",
                highlight: "24/7"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-4 hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                  {feature.highlight}
                </div>
                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section - Épurée */}
      <section className="py-16 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              Prêt à révolutionner votre business ?
            </h2>
            
            <p className="text-base text-blue-100 mb-6 leading-relaxed">
              Rejoignez une communauté de winners qui ont choisi l'excellence. Votre succès commence ici.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button
                onClick={handleMainCTA}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 text-base transform hover:-translate-y-1"
              >
                🚀 Créer ma marketplace
              </button>
              
              <button
                onClick={handleDemoClick}
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 text-base"
              >
                Voir la démo d'abord
              </button>
            </div>
            
            <div className="flex justify-center items-center space-x-8 text-blue-200 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Setup en 24h
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Support dédié
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Garantie 30 jours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Spartelio</h3>
              </div>
              <p className="text-gray-400 text-base leading-relaxed max-w-md">
                La solution française n°1 pour créer et développer votre marketplace de pièces détachées. 
                Rejoignez la révolution du commerce en ligne.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4 text-blue-400">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors text-base">Fonctionnalités</a></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors text-left text-base">Tarifs</button></li>
                <li><button onClick={() => navigate('/demo')} className="hover:text-white transition-colors text-left text-base">Démo</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4 text-blue-400">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/faq')} className="hover:text-white transition-colors text-left text-base">Questions fréquentes</button></li>
                <li><a href="mailto:hello@spartelio.com" className="hover:text-white transition-colors text-base">hello@spartelio.com</a></li>
                <li><a href="tel:+33123456789" className="hover:text-white transition-colors text-base">01 23 45 67 89</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Spartelio. Conçu avec ❤️ en France. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage