import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  BarChart3,
  Star,
  Sparkles,
  Clock
} from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import Header from '../components/Header'

const Homepage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleDemoClick = () => {
    navigate('/demo')
  }

  const handleMainCTA = () => {
    if (user) {
      navigate('/profile')
    } else {
      navigate('/pricing')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Créez votre
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}marketplace{' '}
                </span>
                en minutes
              </h1>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                La solution tout-en-un pour créer, gérer et faire grandir votre marketplace de pièces détachées. 
                Aucune compétence technique requise.
              </p>
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              {/* Badge d'urgence */}
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Clock className="w-4 h-4 mr-2" />
                🎉 Offre de lancement : 7 jours gratuits
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleMainCTA}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  {user ? 'Accéder à mon profil' : 'Créer ma marketplace'}
                </button>
                <button
                  onClick={handleDemoClick}
                  className="bg-white text-gray-700 px-8 py-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  Voir la démo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour créer et gérer votre marketplace de pièces détachées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-8 h-8 text-blue-500" />,
                title: "Marketplace clé en main",
                description: "Créez votre marketplace en quelques clics avec un design professionnel"
              },
              {
                icon: <Users className="w-8 h-8 text-green-500" />,
                title: "Gestion des utilisateurs",
                description: "Gérez vos clients et leurs commandes avec des outils intuitifs"
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
                title: "Analyses détaillées",
                description: "Suivez vos ventes et performances avec des rapports complets"
              },
              {
                icon: <Shield className="w-8 h-8 text-red-500" />,
                title: "Sécurité avancée",
                description: "Vos données et celles de vos clients sont protégées"
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                title: "Performance optimale",
                description: "Marketplace rapide et optimisé pour le référencement"
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-teal-500" />,
                title: "Support 24/7",
                description: "Notre équipe vous accompagne dans votre réussite"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section - Simplifié */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lancez-vous dès aujourd'hui
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre marketplace peut être opérationnelle en moins de 10 minutes
          </p>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">5 min</div>
              <div className="text-sm text-gray-600">Configuration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">0€</div>
              <div className="text-sm text-gray-600">Frais de setup</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support inclus</div>
            </div>
          </div>

          {!user && (
            <button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg inline-flex items-center"
            >
              Choisir mon plan
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises qui font confiance à SparesTech
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah L.",
                company: "Garage du Centre (Lyon)",
                content: "Notre CA a doublé en 6 mois grâce à notre marketplace. Les commandes arrivent automatiquement, même la nuit !",
                rating: 5,
                stats: "+120% CA"
              },
              {
                name: "Marc T.",
                company: "AutoPièces34 (Montpellier)",
                content: "Fini les catalogues papier ! Mes clients commandent en ligne et je gagne 3h par jour sur la gestion.",
                rating: 5,
                stats: "3h/jour économisées"
              },
              {
                name: "David R.",
                company: "Tracteurs Services (Beauvais)",
                content: "Le support est réactif, la plateforme très stable. Mes clients adorent pouvoir commander 24h/24.",
                rating: 5,
                stats: "5 étoiles sur Trustpilot"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {testimonial.stats}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Personnalisé selon l'état */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {user ? 'Créez votre premier marketplace' : 'Rejoignez +500 entreprises qui nous font confiance'}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {user 
              ? 'Votre profil est prêt, il ne vous reste plus qu\'à configurer votre plateforme'
              : 'Transformez votre activité avec une solution clé en main, sans compétences techniques'
            }
          </p>
          
          {/* Urgence pour les non-connectés */}
          {!user && (
            <div className="inline-flex items-center bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-medium mb-6">
              ⚡ Plus que 48h pour profiter de l'offre de lancement
            </div>
          )}
          
          <button
            onClick={handleMainCTA}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl text-lg inline-flex items-center"
          >
            {user ? 'Accéder à mon profil' : 'Démarrer gratuitement'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">SparesTech</h3>
              </div>
              <p className="text-gray-400">
                La solution complète pour créer et gérer votre marketplace de pièces détachées.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors text-left">Tarifs</button></li>
                <li><button onClick={() => navigate('/demo')} className="hover:text-white transition-colors text-left">Démo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="mailto:contact@sparestech.fr" className="hover:text-white transition-colors">Contact</a></li>
                <li><button onClick={() => navigate('/faq')} className="hover:text-white transition-colors text-left">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SparesTech. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage