import React, { useState } from 'react'
import { ChevronDown, HelpCircle, Search, Mail, Phone, MessageCircle, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'technique' | 'pricing' | 'support' | 'security' | 'features'
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const faqItems: FAQItem[] = [
    // Général
    {
      question: "Combien de temps faut-il pour créer ma marketplace ?",
      answer: "Votre marketplace peut être opérationnelle en 30 minutes maximum. Le processus comprend : sélection du plan (5 min), configuration personnalisée (15 min), import des produits (5 min) et activation automatique (5 min). Notre assistant intelligent vous guide à chaque étape.",
      category: "general"
    },
    {
      question: "Ai-je besoin de compétences techniques pour utiliser Spartelio ?",
      answer: "Absolument pas ! Spartelio est conçu pour être utilisé par tous, sans compétences techniques. Notre interface intuitive, nos assistants intelligents et notre support dédié vous accompagnent à chaque étape.",
      category: "general"
    },
    {
      question: "Combien de produits puis-je avoir sur ma marketplace ?",
      answer: "Cela dépend de votre plan : Starter permet 1 000 produits, Professional permet 25 000 produits, et Enterprise permet un nombre illimité de produits. Vous pouvez upgrader à tout moment selon vos besoins.",
      category: "general"
    },
    {
      question: "Puis-je vendre des services en plus des produits physiques ?",
      answer: "Oui ! Spartelio supporte la vente de produits physiques, numériques, services, abonnements et même des réservations. Notre système flexible s'adapte à votre type d'activité.",
      category: "general"
    },

    // Fonctionnalités
    {
      question: "Quelles fonctionnalités d'IA sont incluses ?",
      answer: "Spartelio intègre plusieurs outils IA : optimisation automatique des descriptions produits, recommandations personnalisées pour vos clients, analyse prédictive des ventes, détection automatique de fraude, et chatbot intelligent pour le support client.",
      category: "features"
    },
    {
      question: "Puis-je gérer plusieurs devises et langues ?",
      answer: "Oui, votre marketplace peut supporter plusieurs devises (EUR, USD, GBP, etc.) avec conversion automatique et plusieurs langues. Idéal pour vendre à l'international dès le début.",
      category: "features"
    },
    {
      question: "Les outils analytics sont-ils inclus ?",
      answer: "Tous nos plans incluent des analytics avancées : suivi des ventes en temps réel, analyse du comportement client, rapports de performance, prédictions de tendances, et bien plus. Les données sont actualisées en temps réel.",
      category: "features"
    },

    // Technique
    {
      question: "Puis-je utiliser mon propre nom de domaine ?",
      answer: "Oui ! Tous nos plans incluent la possibilité d'utiliser votre propre domaine (ex: boutique.monentreprise.com). Notre équipe configure gratuitement votre DNS et active automatiquement le certificat SSL.",
      category: "technique"
    },
    {
      question: "Comment migrer mes données existantes ?",
      answer: "Nous proposons plusieurs options : import automatique via Excel/CSV, migration depuis d'autres plateformes (Shopify, WooCommerce, PrestaShop), ou migration complète par notre équipe (gratuite pour les plans Professional et Enterprise).",
      category: "technique"
    },
    {
      question: "Votre plateforme est-elle optimisée pour le mobile ?",
      answer: "Absolument ! Toutes nos marketplaces sont 100% responsive et optimisées mobile-first. Plus de 60% des achats se faisant sur mobile, nous avons mis l'accent sur une expérience mobile parfaite.",
      category: "technique"
    },
    {
      question: "Puis-je intégrer des outils externes ?",
      answer: "Oui, Spartelio propose plus de 200 intégrations natives : comptabilité (Sage, Cegid), CRM (HubSpot, Salesforce), emailing (Mailchimp, Sendinblue), logistique (Chronopost, Colissimo), et bien d'autres via notre API.",
      category: "technique"
    },

    // Sécurité
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Sécurité maximum garantie : chiffrement SSL 256-bit, hébergement en France (conformité RGPD), sauvegardes automatiques 3x/jour, monitoring 24/7, et certification PCI-DSS pour les paiements. Vos données ne quittent jamais l'Union Européenne.",
      category: "security"
    },
    {
      question: "Comment sont gérés les paiements ?",
      answer: "Paiements 100% sécurisés via Stripe (leader mondial). Nous ne stockons jamais les données bancaires. Acceptez CB, VISA, Mastercard, PayPal, Apple Pay, Google Pay et virements SEPA. Déblocage automatique des fonds sous 7 jours.",
      category: "security"
    },

    // Tarifs
    {
      question: "Y a-t-il des frais cachés ou des commissions ?",
      answer: "Aucun frais caché, aucune commission ! Le prix affiché est le prix final. Contrairement à d'autres plateformes qui prennent 3-8% de commission sur chaque vente, Spartelio ne prend rien. Votre chiffre d'affaires vous appartient à 100%.",
      category: "pricing"
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader à tout moment. Les changements sont effectifs immédiatement pour les upgrades, et au prochain cycle de facturation pour les downgrades. Aucun engagement, aucune pénalité.",
      category: "pricing"
    },
    {
      question: "Proposez-vous un essai gratuit ?",
      answer: "Oui ! Tous nos plans bénéficient d'un essai gratuit de 14 jours, sans carte bancaire requise. Vous avez accès à toutes les fonctionnalités pour tester en conditions réelles. Vous ne payez qu'après validation de votre choix.",
      category: "pricing"
    },

    // Support
    {
      question: "Quel support proposez-vous ?",
      answer: "Support multicanal inclus : chat en direct (9h-18h), email (réponse < 2h), téléphone, formations vidéo personnalisées, documentation complète et webinaires mensuels. Les plans Professional et Enterprise bénéficient d'un consultant dédié.",
      category: "support"
    },
    {
      question: "Proposez-vous des formations ?",
      answer: "Oui ! Formation complète incluse : onboarding personnalisé, webinaires hebdomadaires, bibliothèque de tutoriels vidéo, guides PDF étape par étape, et certification Spartelio Expert pour optimiser vos performances.",
      category: "support"
    }
  ]

  const filteredFAQ = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const categories = [
    { id: 'all', label: '🌟 Toutes', color: 'gray', count: faqItems.length },
    { id: 'general', label: '📋 Général', color: 'blue', count: faqItems.filter(item => item.category === 'general').length },
    { id: 'features', label: '⚡ Fonctionnalités', color: 'purple', count: faqItems.filter(item => item.category === 'features').length },
    { id: 'technique', label: '⚙️ Technique', color: 'green', count: faqItems.filter(item => item.category === 'technique').length },
    { id: 'security', label: '🔒 Sécurité', color: 'red', count: faqItems.filter(item => item.category === 'security').length },
    { id: 'pricing', label: '💰 Tarifs', color: 'orange', count: faqItems.filter(item => item.category === 'pricing').length },
    { id: 'support', label: '🎯 Support', color: 'teal', count: faqItems.filter(item => item.category === 'support').length }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <HelpCircle className="w-4 h-4 mr-2" />
              Centre d'aide
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Questions
              <br />
              <span className="text-blue-600">fréquentes</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-3 max-w-4xl mx-auto leading-relaxed">
              Toutes les réponses aux questions que vous vous posez.
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-12">
              Des réponses claires et détaillées pour vous accompagner dans votre projet.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher dans les questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 shadow-lg"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative text-center p-6 rounded-2xl transition-all duration-300 border-2 ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`text-2xl mb-3 ${selectedCategory === category.id ? 'scale-110' : ''} transition-transform duration-300`}>
                  {category.label.split(' ')[0]}
                </div>
                <div className={`font-semibold text-sm ${selectedCategory === category.id ? 'text-blue-600' : 'text-gray-700'}`}>
                  {category.label.split(' ').slice(1).join(' ')}
                </div>
                <div className={`text-xs mt-1 ${selectedCategory === category.id ? 'text-blue-500' : 'text-gray-500'}`}>
                  {category.count} question{category.count > 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-5xl mx-auto mb-16">
            {searchTerm && (
              <div className="mb-8 text-center">
                <p className="text-gray-600">
                  <span className="font-semibold">{filteredFAQ.length}</span> résultat{filteredFAQ.length > 1 ? 's' : ''} 
                  {searchTerm && ` pour "${searchTerm}"`}
                </p>
              </div>
            )}
            
            <div className="space-y-6">
              {filteredFAQ.map((item, index) => (
                <div key={index} className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <span className="font-semibold text-gray-900 pr-6 text-lg group-hover:text-blue-600 transition-colors">
                      {item.question}
                    </span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all duration-300 ${
                      openItems.includes(index) ? 'border-blue-500 bg-blue-500 rotate-180' : 'group-hover:border-blue-400'
                    }`}>
                      <ChevronDown className={`w-4 h-4 transition-colors ${openItems.includes(index) ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                  </button>
                  
                  {openItems.includes(index) && (
                    <div className="px-8 pb-8 animate-fadeIn">
                      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mb-6 rounded-full"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun résultat trouvé</h3>
                <p className="text-gray-600 mb-6">Essayez avec d'autres mots-clés ou contactez notre équipe</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            )}
          </div>

                    {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">&lt; 2h</div>
              <p className="text-blue-700 font-medium text-sm">Temps de réponse moyen</p>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
              <p className="text-green-700 font-medium text-sm">Satisfaction client</p>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">24/7</div>
              <p className="text-purple-700 font-medium text-sm">Documentation disponible</p>
            </div>
          </div>

          {/* Contact Section - Compact */}
          <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-3xl p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Besoin d'aide personnalisée ?
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Notre équipe est là pour vous
              </h3>
              
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Une question spécifique ? Un projet particulier ? Nos experts vous accompagnent personnellement.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                <a
                  href="mailto:hello@spartelio.com"
                  className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 group"
                >
                  <Mail className="w-6 h-6 text-blue-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-1 text-sm">Email</h4>
                  <p className="text-blue-200 text-xs">hello@spartelio.com</p>
                </a>
                
                <a
                  href="tel:+33123456789"
                  className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 group"
                >
                  <Phone className="w-6 h-6 text-green-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-1 text-sm">Téléphone</h4>
                  <p className="text-blue-200 text-xs">01 23 45 67 89</p>
                </a>
                
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 group">
                  <MessageCircle className="w-6 h-6 text-purple-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-1 text-sm">Chat en direct</h4>
                  <p className="text-blue-200 text-xs">9h-18h du lundi au vendredi</p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/demo')}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1"
              >
                Demander une démo personnalisée
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ