import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  BarChart3,
  Star,
  Quote
} from 'lucide-react'

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">SparesTech</h1>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Fonctionnalités
                </a>
                <a href="#pricing" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Tarifs
                </a>
                <a href="#testimonials" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Témoignages
                </a>
                <Link 
                  to="/login" 
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link 
                  to="/plans" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Commencer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Créez votre marketplace
              <br />
              <span className="text-blue-200">en quelques minutes</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              La plateforme SaaS qui permet aux entreprises de créer facilement leur propre marketplace de pièces détachées et produits techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/plans" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                Créer mon marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Voir la démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir SparesTech ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour lancer rapidement votre marketplace professionnelle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Déploiement rapide
              </h3>
              <p className="text-gray-600">
                Votre marketplace est prête en moins de 5 minutes. Pas de développement, pas de complications.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Domaine personnalisé
              </h3>
              <p className="text-gray-600">
                Utilisez votre propre nom de domaine pour une expérience de marque cohérente.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Sécurité garantie
              </h3>
              <p className="text-gray-600">
                Hébergement sécurisé, sauvegardes automatiques et conformité RGPD incluse.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Gestion d'utilisateurs
              </h3>
              <p className="text-gray-600">
                Créez des comptes pour vos clients, gérez leurs permissions et suivez leur activité.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Analytics avancés
              </h3>
              <p className="text-gray-600">
                Tableaux de bord complets pour suivre vos ventes, clients et performances.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Support premium
              </h3>
              <p className="text-gray-600">
                Équipe support dédiée pour vous accompagner dans le développement de votre business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trois étapes simples pour lancer votre marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Choisissez votre plan
              </h3>
              <p className="text-gray-600">
                Sélectionnez l'offre qui correspond à vos besoins et votre budget.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Configurez votre marketplace
              </h3>
              <p className="text-gray-600">
                Personnalisez l'apparence, ajoutez vos produits et configurez vos paramètres.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Lancez et vendez
              </h3>
              <p className="text-gray-600">
                Votre marketplace est prête ! Partagez le lien avec vos clients et commencez à vendre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">29€</div>
                <div className="text-gray-600">/mois</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Jusqu'à 100 produits</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>50 commandes/mois</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Support email</span>
                </li>
              </ul>
              <Link 
                to="/plans" 
                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
              >
                Commencer
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Populaire
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">79€</div>
                <div className="text-gray-600">/mois</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Produits illimités</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Commandes illimitées</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Domaine personnalisé</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Support prioritaire</span>
                </li>
              </ul>
              <Link 
                to="/plans" 
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
              >
                Commencer
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">199€</div>
                <div className="text-gray-600">/mois</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Tout Pro +</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>API personnalisée</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Support dédié</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Intégrations sur mesure</span>
                </li>
              </ul>
              <Link 
                to="/plans" 
                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez comment nos clients transforment leur business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-6">
                "SparesTech nous a permis de digitaliser notre catalogue en un temps record. Nos clients apprécient la facilité de commande."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Jean Dupont</p>
                  <p className="text-gray-600 text-sm">CEO, AutoParts Pro</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-6">
                "Une solution qui nous fait gagner un temps précieux. L'interface est intuitive et nos vendeurs s'y sont adaptés rapidement."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Sophie Martin</p>
                  <p className="text-gray-600 text-sm">Directrice, TechSpares</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-6">
                "Le support client est exceptionnel. Chaque demande est traitée rapidement et efficacement."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  PL
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Pierre Leroy</p>
                  <p className="text-gray-600 text-sm">Gérant, Méca-Parts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à lancer votre marketplace ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez les centaines d'entreprises qui font confiance à SparesTech pour développer leur business en ligne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/plans" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Commencer gratuitement
            </Link>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Parler à un expert
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SparesTech</h3>
              <p className="text-gray-400">
                La plateforme SaaS pour créer votre marketplace de pièces détachées.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
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