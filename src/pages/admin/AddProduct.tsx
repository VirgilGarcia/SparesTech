import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

function AddProduct() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    price: '',
    description: '',
    stock: '',
    category: '',
    image_url: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Mécanique',
    'Électrique',
    'Hydraulique',
    'Pneumatique',
    'Outillage',
    'Consommables',
    'Autre'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await productService.addProduct({
        name: formData.name,
        reference: formData.reference,
        price: parseFloat(formData.price),
        description: formData.description,
        stock: parseInt(formData.stock),
        category: formData.category,
        image_url: formData.image_url
      })
      
      navigate('/admin/products')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du produit')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Link to="/admin/products" className="text-stone-600 hover:text-stone-800">
              ← Retour aux produits
            </Link>
            <h1 className="text-xl font-semibold text-stone-800">Ajouter un produit</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                placeholder="Ex: Roulement SKF"
                required
              />
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-stone-700 mb-2">
                Référence *
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                placeholder="Ex: 6205-2RS"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-2">
                  Prix (€) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="24.99"
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-stone-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-2">
                Catégorie *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                placeholder="Description détaillée du produit..."
              />
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-stone-700 mb-2">
                URL de l'image (optionnel)
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  loading
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
              </button>

              <Link 
                to="/admin/products"
                className="flex-1 py-3 rounded-xl font-medium text-center border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct