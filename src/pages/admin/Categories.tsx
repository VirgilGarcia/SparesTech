import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoryService } from '../../services/categoryService'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import { useTheme } from '../../context/ThemeContext'
import type { Category, CategoryTree } from '../../services/categoryService'

function AdminCategories() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    parent_id: null as number | null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const [flatCategories, tree] = await Promise.all([
        categoryService.getAllCategories(),
        categoryService.getCategoryTree()
      ])
      setCategories(flatCategories)
      setCategoryTree(tree)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      setError('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Le nom de la catégorie est requis')
      return
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData)
        setSuccess('Catégorie mise à jour avec succès !')
      } else {
        await categoryService.addCategory(formData)
        setSuccess('Catégorie créée avec succès !')
      }
      
      setFormData({ name: '', description: '', parent_id: null })
      setShowCreateForm(false)
      setEditingCategory(null)
      loadCategories()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'opération')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ 
      name: category.name, 
      description: category.description || '', 
      parent_id: category.parent_id || null,
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return

    try {
      await categoryService.deleteCategory(id)
      setSuccess('Catégorie supprimée avec succès !')
      loadCategories()
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      setError(error.message || 'Erreur lors de la suppression de la catégorie')
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', parent_id: null })
    setShowCreateForm(false)
    setEditingCategory(null)
    setError('')
  }

  const renderCategoryTree = (categories: CategoryTree[], level: number = 0): JSX.Element[] => {
    return categories.map(category => (
      <div key={category.id} className="category-item">
        <div 
          className={`
            flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-2
            ${level > 0 ? 'ml-6' : ''}
          `}
        >
          <div className="flex items-center space-x-3">
            {/* Icône */}
            {category.icon && (
              <span className="text-xl" style={{ color: category.color || theme.primaryColor }}>
                {category.icon}
              </span>
            )}
            
            {/* Informations de la catégorie */}
            <div>
              <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
              {category.description && (
                <p className="text-gray-600 text-sm">{category.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>Niveau: {category.level}</span>
                <span>Ordre: {category.order_index}</span>
                {category.children.length > 0 && (
                  <span>{category.children.length} sous-catégorie(s)</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(category)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Sous-catégories */}
        {category.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Fonction récursive pour générer les options du select parent
  const renderCategoryOptions = (tree: CategoryTree[], excludeIds: number[] = [], level = 0): JSX.Element[] => {
    return tree.flatMap(category => {
      if (excludeIds.includes(category.id)) return [];
      return [
        <option key={category.id} value={category.id}>
          {'—'.repeat(level)} {category.name}
        </option>,
        ...renderCategoryOptions(category.children, excludeIds, level + 1)
      ];
    });
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des catégories</h1>
              <p className="mt-2 text-gray-600">Gérez la hiérarchie des catégories de votre marketplace</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Ajouter une catégorie
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une nouvelle catégorie'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Ex: Pièces moteur"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie parente
                  </label>
                  <select
                    id="parent"
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      parent_id: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Aucune (catégorie principale)</option>
                    {renderCategoryOptions(
                      categoryTree, 
                      editingCategory ? [editingCategory.id, ...(editingCategory.children?.map(c => c.id) ?? [])] : []
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Arbre des catégories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Structure hiérarchique des catégories</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des catégories...</p>
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">Aucune catégorie trouvée</p>
            </div>
          ) : (
            <div className="p-6">
              {renderCategoryTree(categoryTree)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCategories 