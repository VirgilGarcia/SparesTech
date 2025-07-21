import React from 'react'
import { Package, DollarSign, Hash, Link as LinkIcon, Eye, EyeOff, ShoppingCart } from 'lucide-react'
import MultiCategorySelector from '../category/MultiCategorySelector'
import DynamicProductFields from './DynamicProductFields'

interface ProductAddFormProps {
  formData: {
    name: string
    reference: string
    prix: string
    stock: string
    photo_url: string
    visible: boolean
    vendable: boolean
    category_ids: number[]
  }
  customFields: Record<string, string>
  onFormChange: (field: string, value: any) => void
  onCustomFieldChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitting: boolean
  validationErrors: { [key: string]: string }
  theme: any
}

const ProductAddForm: React.FC<ProductAddFormProps> = ({
  formData,
  customFields,
  onFormChange,
  onCustomFieldChange,
  onSubmit,
  onCancel,
  submitting,
  validationErrors,
  theme
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Ajouter un produit</h2>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline w-4 h-4 mr-1" />
              Nom du produit *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nom du produit"
              required
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-1" />
              Référence *
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => onFormChange('reference', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.reference ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="REF-001"
              required
            />
            {validationErrors.reference && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.reference}</p>
            )}
          </div>
        </div>

        {/* Prix et stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Prix (€) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.prix}
              onChange={(e) => onFormChange('prix', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.prix ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
            {validationErrors.prix && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.prix}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline w-4 h-4 mr-1" />
              Stock *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => onFormChange('stock', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.stock ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
              required
            />
            {validationErrors.stock && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.stock}</p>
            )}
          </div>
        </div>

        {/* Photo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="inline w-4 h-4 mr-1" />
            URL de l'image
          </label>
          <input
            type="url"
            value={formData.photo_url}
            onChange={(e) => onFormChange('photo_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://exemple.com/image.jpg"
          />
        </div>

        {/* Catégories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégories
          </label>
          <MultiCategorySelector
            value={formData.category_ids}
            onChange={(ids) => onFormChange('category_ids', ids)}
          />
        </div>

        {/* Champs personnalisés */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Champs personnalisés</h3>
          <DynamicProductFields
            values={customFields}
            onChange={(values) => {
              const [field, value] = Object.entries(values).pop() || [];
              if (field && value !== undefined) onCustomFieldChange(field, value as string);
            }}
          />
        </div>

        {/* Options de visibilité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {formData.visible ? (
                <Eye className="w-5 h-5 text-green-600 mr-3" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Visible</h4>
                <p className="text-sm text-gray-600">
                  {formData.visible ? 'Affiché sur le site' : 'Masqué du site'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFormChange('visible', !formData.visible)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.visible ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.visible ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ShoppingCart className={`w-5 h-5 mr-3 ${
                formData.vendable ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Vendable</h4>
                <p className="text-sm text-gray-600">
                  {formData.vendable ? 'Peut être acheté' : 'Consultation uniquement'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFormChange('vendable', !formData.vendable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.vendable ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.vendable ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {submitting ? 'Création...' : 'Créer le produit'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductAddForm