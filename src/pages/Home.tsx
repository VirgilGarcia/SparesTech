import Header from '../components/Header'

function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      {/* Hero section */}
      <section className="py-24 bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light text-stone-800 mb-6 leading-tight">
            Pièces détachées
            <span className="block font-medium text-emerald-600 mt-2">
              pour l'industrie moderne
            </span>
          </h1>
          <p className="text-lg text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Simplifiez vos approvisionnements avec une plateforme intuitive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-500 text-white px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-all font-medium">
              Explorer le catalogue
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home