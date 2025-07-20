import React, { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import Header from '../components/Header'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'technique' | 'pricing' | 'support'
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqItems: FAQItem[] = [
    {
      question: "Combien de temps faut-il pour créer ma marketplace ?",
      answer: "Votre marketplace peut être opérationnelle en moins de 10 minutes. Le processus comprend : sélection du plan (2 min), configuration de base (5 min), et activation automatique (3 min).",
      category: "general"
    },
    {
      question: "Puis-je utiliser mon propre nom de domaine ?",
      answer: "Oui ! Tous nos plans incluent la possibilité d'utiliser votre propre domaine (ex: boutique.monentreprise.com). Nous vous aidons gratuitement pour la configuration DNS.",
      category: "technique"
    },
    {
      question: "Y a-t-il des frais cachés ou des commissions ?",
      answer: "Aucun frais caché. Le prix affiché est le prix final. Nous ne prenons aucune commission sur vos ventes, contrairement à d'autres plateformes qui prennent 3-8%.",
      category: "pricing"
    },
    {
      question: "Que se passe-t-il si j'ai besoin d'aide ?",
      answer: "Notre équipe support répond en moins de 2h en jour ouvré. Nous proposons aussi des formations vidéo gratuites et une documentation complète.",
      category: "support"
    },
    {
      question: "Puis-je migrer mes données existantes ?",
      answer: "Oui, nous proposons un service de migration gratuit pour vos produits, clients et commandes depuis Excel, CSV, ou d'autres plateformes e-commerce.",
      category: "technique"
    },
    {
      question: "Combien de produits puis-je avoir ?",
      answer: "Le plan Starter permet 1000 produits, Professional permet 10 000 produits, et Enterprise permet un nombre illimité de produits.",
      category: "general"
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons un chiffrement SSL 256-bit, des sauvegardes automatiques 3x/jour, et nos serveurs sont hébergés en France (conformité RGPD).",
      category: "technique"
    },
    {
      question: "Puis-je annuler mon abonnement ?",
      answer: "Oui, vous pouvez annuler à tout moment sans frais. Vos données restent accessibles pendant 30 jours après l'annulation pour export.",
      category: "pricing"
    }
  ]

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const categories = [
    { id: 'general', label: '📋 Général', color: 'blue' },
    { id: 'technique', label: '⚙️ Technique', color: 'green' },
    { id: 'pricing', label: '💰 Tarifs', color: 'purple' },
    { id: 'support', label: '🎯 Support', color: 'orange' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Toutes les réponses aux questions que vous vous posez sur SparesTech
            </p>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((category) => (
              <div key={category.id} className="text-center">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-${category.color}-100 text-${category.color}-700`}>
                  {category.label}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Vous ne trouvez pas votre réponse ?
              </h3>
              <p className="text-gray-600 mb-6">
                Notre équipe est là pour vous aider ! Contactez-nous et recevez une réponse personnalisée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:contact@sparestech.fr"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                >
                  📧 contact@sparestech.fr
                </a>
                <a
                  href="tel:+33123456789"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📞 +33 1 23 45 67 89
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ