import Header from '../components/Header'
import { useMarketplaceTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'

function Home() {
  const { theme } = useMarketplaceTheme()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero section */}
      <section className="w-full py-24 bg-white">
        <div className="w-full px-6 lg:px-16 xl:px-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Pièces détachées
              <span className="block font-medium mt-2" style={{ color: theme.primaryColor }}>
                disponibles immédiatement
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Commandez vos pièces de rechange industrielles en ligne. Livraison rapide, stock vérifié, prix transparents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog">
                <button 
                  className="px-8 py-4 text-white font-medium rounded-lg transition-all hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Voir le stock disponible
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section avantages */}
      <section className="w-full py-20 bg-gray-50">
        <div className="w-full px-6 lg:px-16 xl:px-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              Pourquoi commander chez nous ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des solutions fiables pour maintenir vos équipements en état de marche
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-6"
                   style={{ backgroundColor: `${theme.primaryColor}10` }}>
                <svg className="w-8 h-8" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Stock vérifié</h3>
              <p className="text-gray-600 leading-relaxed">
                Tous nos articles sont en stock réel. Pas de commande sans garantie de disponibilité.
              </p>
            </div>

            <div className="bg-white p-10 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-6"
                   style={{ backgroundColor: `${theme.primaryColor}10` }}>
                <svg className="w-8 h-8" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Livraison express</h3>
              <p className="text-gray-600 leading-relaxed">
                Réception sous 24-48h pour éviter l'arrêt de production. Suivi en temps réel.
              </p>
            </div>

            <div className="bg-white p-10 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-6"
                   style={{ backgroundColor: `${theme.primaryColor}10` }}>
                <svg className="w-8 h-8" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Prix transparents</h3>
              <p className="text-gray-600 leading-relaxed">
                Tarifs HT clairs, sans surprise. Devis et facturation professionnels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section catégories populaires */}
      <section className="w-full py-20 bg-white">
        <div className="w-full px-6 lg:px-16 xl:px-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              Catégories populaires
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Les pièces les plus demandées par nos clients
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/catalog" className="group">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-100 hover:border-gray-200 transition-all group-hover:shadow-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ backgroundColor: `${theme.primaryColor}10` }}>
                  <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Roulements</h3>
                <p className="text-sm text-gray-600">Roulements à billes, à rouleaux, spéciaux</p>
              </div>
            </Link>
            
            <Link to="/catalog" className="group">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-100 hover:border-gray-200 transition-all group-hover:shadow-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ backgroundColor: `${theme.primaryColor}10` }}>
                  <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Moteurs</h3>
                <p className="text-sm text-gray-600">Moteurs électriques, réducteurs, variateurs</p>
              </div>
            </Link>
            
            <Link to="/catalog" className="group">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-100 hover:border-gray-200 transition-all group-hover:shadow-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ backgroundColor: `${theme.primaryColor}10` }}>
                  <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Filtres</h3>
                <p className="text-sm text-gray-600">Filtres à air, à huile, à carburant</p>
              </div>
            </Link>
            
            <Link to="/catalog" className="group">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-100 hover:border-gray-200 transition-all group-hover:shadow-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ backgroundColor: `${theme.primaryColor}10` }}>
                  <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Outillage</h3>
                <p className="text-sm text-gray-600">Outils de maintenance, équipements</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="w-full py-20 bg-gray-50">
        <div className="w-full px-6 lg:px-16 xl:px-32">
          <div className="text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Besoin d'une pièce urgente ?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Consultez notre stock en ligne ou contactez-nous pour un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog">
                <button 
                  className="px-8 py-4 text-white font-medium rounded-lg transition-all hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Consulter le catalogue
                </button>
              </Link>
              <button 
                className="px-8 py-4 text-gray-700 bg-white border border-gray-200 font-medium rounded-lg transition-all hover:bg-gray-50"
              >
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home