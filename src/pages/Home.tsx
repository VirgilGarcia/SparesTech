import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'

function Home() {
  const { theme, settings } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero section avec thème dynamique */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-6 leading-tight">
            Pièces détachées
            <span className="block font-medium mt-2" style={{ color: theme.primaryColor }}>
              pour l'industrie moderne
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bienvenue chez {settings?.company_name || 'SparesTech'}. Simplifiez vos approvisionnements avec une plateforme intuitive et moderne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalog">
              <button 
                className="text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all font-medium shadow-sm"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Explorer le catalogue
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section fonctionnalités */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Catalogue complet</h3>
              <p className="text-gray-600 text-sm">Accédez à un large éventail de pièces détachées pour tous vos besoins industriels.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Livraison rapide</h3>
              <p className="text-gray-600 text-sm">Commandez en toute simplicité et recevez vos pièces dans les plus brefs délais.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Qualité garantie</h3>
              <p className="text-gray-600 text-sm">Toutes nos pièces sont sélectionnées pour leur qualité et leur fiabilité.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home