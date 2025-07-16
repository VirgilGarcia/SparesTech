import { useState, useEffect } from 'react'
import { categoryService } from '../../services/categoryService'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import { useMarketplaceTheme } from '../../context/ThemeContext'
import { Modal } from '../../components/Modal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { Category, CategoryTree } from '../../services/categoryService'
import React from 'react'

function AdminCategories() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    parent_id: null as number | null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [categoryToDelete, setCategoryToDelete] = useState<{id: number, name: string} | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom de la catégorie est obligatoire'
    } else if (formData.name.length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'La description ne peut pas dépasser 500 caractères'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData)
        setSuccess('Catégorie mise à jour avec succès !')
      } else {
        await categoryService.addCategory(formData)
        setSuccess('Catégorie créée avec succès !')
      }
      
      setFormData({ name: '', description: '', parent_id: null })
      setShowCreateModal(false)
      setEditingCategory(null)
      setValidationErrors({})
      loadCategories()
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'opération')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ 
      name: category.name, 
      description: category.description || '', 
      parent_id: category.parent_id || null,
    })
    setValidationErrors({})
    setError('')
    setShowCreateModal(true)
  }

  const handleDelete = (id: number, name: string) => {
    // Vérifier si la catégorie a des sous-catégories

    const hasChildren = categoryTree.some(c => c.id === id && c.children.length > 0) || 
                       categoryTree.some(c => c.children.some(child => child.id === id && child.children.length > 0))
    
    if (hasChildren) {
      setError(`Impossible de supprimer la catégorie "${name}" car elle contient des sous-catégories. Veuillez d'abord supprimer ou déplacer les sous-catégories.`)
      return
    }
    
    setCategoryToDelete({ id, name })
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      setSubmitting(true)
      await categoryService.deleteCategory(categoryToDelete.id)
      setSuccess('Catégorie supprimée avec succès !')
      loadCategories()
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      
      // Gestion spécifique des erreurs
      if (error.message && error.message.includes('sous-catégories')) {
        setError(`Impossible de supprimer la catégorie "${categoryToDelete.name}" car elle contient des sous-catégories. Veuillez d'abord supprimer ou déplacer les sous-catégories.`)
      } else {
        setError(error.message || 'Erreur lors de la suppression de la catégorie')
      }
    } finally {
      setSubmitting(false)
      setCategoryToDelete(null)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', parent_id: null })
    setShowCreateModal(false)
    setEditingCategory(null)
    setError('')
    setValidationErrors({})
  }

  // Fonction pour filtrer les catégories par recherche
  const filterCategories = (categories: CategoryTree[], query: string): CategoryTree[] => {
    if (!query.trim()) return categories
    
    return categories.filter(category => {
      const matchesQuery = category.name.toLowerCase().includes(query.toLowerCase()) ||
                          (category.description && category.description.toLowerCase().includes(query.toLowerCase()))
      
      // Vérifier aussi dans les enfants
      const hasMatchingChildren = category.children.some(child => 
        filterCategories([child], query).length > 0
      )
      
      return matchesQuery || hasMatchingChildren
    }).map(category => ({
      ...category,
      children: filterCategories(category.children, query)
    }))
  }

  const renderCategoryTree = (categories: CategoryTree[], level: number = 0): React.ReactNode => {
    return categories.map(category => (
      <div key={category.id} className="category-item">
        <div 
          className={`
            flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl mb-4 shadow-sm hover:shadow-md transition-all duration-200
            ${level > 0 ? 'ml-8' : ''}
          `}
        >
          <div className="flex items-center space-x-4">
            {/* Icône de catégorie */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${theme.primaryColor}15` }}>
              <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            
            {/* Informations de la catégorie */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-xl font-semibold text-gray-900">{category.name}</h4>
                {level > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    Niveau {category.level}
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Ordre: {category.order_index}
                </span>
                {category.children.length > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {category.children.length} sous-catégorie(s)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(category as any)}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>
            {category.children.length > 0 ? (
              <div className="px-4 py-2 text-gray-400 text-sm font-medium rounded-lg flex items-center gap-2"
                   title="Cette catégorie contient des sous-catégories et ne peut pas être supprimée directement">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9.5m9.5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Protégée
              </div>
            ) : (
              <button
                onClick={() => handleDelete(category.id, category.name)}
                className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            )}
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
  const renderCategoryOptions = (tree: CategoryTree[], excludeIds: number[] = [], level = 0): React.ReactNode => {
    return React.Children.toArray(tree.map(category => {
      if (excludeIds.includes(category.id)) return null;
      return [
        <option key={category.id} value={category.id}>
          {'—'.repeat(level)} {category.name}
        </option>,
        ...(renderCategoryOptions(category.children, excludeIds, level + 1) as any[])
      ];
    }));
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
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre et actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">Catégories</h1>
            <p className="text-gray-600">Gérez la hiérarchie des catégories de votre marketplace</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Barre de recherche */}
            <div className="relative flex-1 lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Ajouter une catégorie</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Aide contextuelle */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Gestion des catégories</h3>
              <div className="text-blue-700 text-sm space-y-1">
                <p>• <strong>Catégories protégées :</strong> Les catégories contenant des sous-catégories ne peuvent pas être supprimées directement.</p>
                <p>• <strong>Pour supprimer :</strong> Supprimez d'abord toutes les sous-catégories ou déplacez-les vers une autre catégorie parente.</p>
                <p>• <strong>Hiérarchie :</strong> Utilisez les catégories parentes pour créer une organisation logique de vos produits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de création/modification */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCancel}
          title={editingCategory ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie'}
          size="lg"
        >
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
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    if (validationErrors.name) {
                      setValidationErrors(prev => ({ ...prev, name: '' }))
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Pièces moteur"
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                )}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
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
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                  if (validationErrors.description) {
                    setValidationErrors(prev => ({ ...prev, description: '' }))
                  }
                }}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                  validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Description de la catégorie..."
                maxLength={500}
              />
              {validationErrors.description && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">{formData.description.length}/500 caractères</p>
            </div>

            {/* Message d'erreur général */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {submitting ? 'Traitement...' : (editingCategory ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Arbre des catégories */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.primaryColor}20` }}>
                <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Catégories ({filterCategories(categoryTree, searchQuery).length})
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                   style={{ 
                     borderColor: `${theme.primaryColor}20`,
                     borderTopColor: theme.primaryColor 
                   }}>
              </div>
              <p className="text-gray-600 font-medium">Chargement des catégories...</p>
            </div>
          ) : filterCategories(categoryTree, searchQuery).length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">
                {searchQuery ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
              </p>
              {searchQuery && (
                <p className="text-gray-500 text-sm mb-4">
                  Essayez de modifier votre recherche ou créez une nouvelle catégorie.
                </p>
              )}
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Créer votre première catégorie
                </button>
              )}
            </div>
          ) : (
            <div className="p-6">
              {renderCategoryTree(filterCategories(categoryTree, searchQuery))}
            </div>
          )}
        </div>

        {/* Modal de confirmation de suppression */}
        <ConfirmDialog
          isOpen={categoryToDelete !== null}
          onCancel={() => setCategoryToDelete(null)}
          onConfirm={confirmDelete}
          title="Supprimer la catégorie ?"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer cette catégorie ?"
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      </div>
    </div>
  )
}

export default AdminCategories 