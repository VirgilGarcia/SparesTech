import React from 'react'
import { Folder, FileText, X } from 'lucide-react'
import type { Category } from '../../services/categoryService'

interface Theme {
  primaryColor: string
  companyName: string
  logoUrl: string | null
}

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  formData: {
    name: string
    description: string
    parent_id: number | null
  }
  onInputChange: (field: string, value: string | number | null) => void
  onSubmit: (e: React.FormEvent) => void
  editingCategory: Category | null
  categories: Category[]
  loading: boolean
  error: string
  validationErrors: { [key: string]: string }
  theme: Theme
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  editingCategory,
  categories,
  loading,
  error,
  validationErrors,
  theme
}) => {
  if (!isOpen) return null

  const availableParents = categories.filter(cat => 
    !editingCategory || cat.id !== editingCategory.id
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <p className="text-sm text-gray-600">
                  {editingCategory ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-400 mr-2">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Folder className="inline w-4 h-4 mr-1" />
                Nom de la catégorie *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ex: Électronique, Vêtements..."
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline w-4 h-4 mr-1" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description de la catégorie (optionnel)"
              />
            </div>

            {/* Catégorie parente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie parente
              </label>
              <select
                value={formData.parent_id || ''}
                onChange={(e) => onInputChange('parent_id', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Catégorie racine</option>
                {availableParents.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.path}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Laissez vide pour créer une catégorie racine
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {loading ? 'Enregistrement...' : editingCategory ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CategoryForm