import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Play, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3, 
  Palette, 
  Shield,
  ArrowRight,
  Check
} from 'lucide-react'
import Header from '../components/Header'

const Demo: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8 text-blue-600" />,
      title: "E-commerce complet",
      description: "Catalogue produits, panier, commandes, paiements intégrés"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Gestion utilisateurs",
      description: "Rôles admin/client, profils, permissions granulaires"
    },
    {
      icon: <Settings className="w-8 h-8 text-purple-600" />,
      title: "Administration intuitive",
      description: "Dashboard complet, statistiques, gestion simplifiée"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Analytics avancées",
      description: "Suivi des ventes, performances, rapports détaillés"
    },
    {
      icon: <Palette className="w-8 h-8 text-pink-600" />,
      title: "Personnalisation totale",
      description: "Logo, couleurs, domaine personnalisé, thème sur mesure"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Sécurité entreprise",
      description: "Authentification, chiffrement, conformité RGPD"
    }
  ]

  const benefits = [
    "✅ Marketplace opérationnelle en 5 minutes",
    "💰 0€ de frais de setup, commission négociable",
    "🎯 Support technique réactif (< 2h)",
    "🔄 Mises à jour automatiques incluses",
    "⚡ Hébergement SSD haute performance",
    "🔒 Sauvegarde automatique 3x/jour"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Découvrez 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}SparesTech{' '}
              </span>
              en action
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Voyez comment notre plateforme transforme votre activité en marketplace moderne et performante
            </p>
          </div>

          {/* Video Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 border border-gray-100">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-24 h-24 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-semibold mb-2">Démonstration complète</h3>
                  <p className="text-blue-100">Découvrez toutes les fonctionnalités en 3 minutes</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="bg-white bg-opacity-90 rounded-full p-4">
                  <Play className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-xl text-gray-600">
                Une solution complète pour créer et gérer votre marketplace
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshots Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Interface moderne et intuitive
              </h2>
              <p className="text-xl text-gray-600">
                Conçue pour une expérience utilisateur optimale
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Dashboard Admin</h3>
                <p className="text-gray-600">Vue d'ensemble complète avec statistiques en temps réel</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Catalogue Produits</h3>
                <p className="text-gray-600">Gestion simplifiée de votre inventaire et catalogue</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Pourquoi choisir SparesTech ?
                </h2>
                <p className="text-xl text-gray-600">
                  Des avantages concrets pour votre business
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à transformer votre activité ?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Créez votre marketplace personnalisé en quelques minutes et commencez à vendre dès aujourd'hui
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center text-lg"
                >
                  Choisir mon plan
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg"
                >
                  Commencer gratuitement
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Demo