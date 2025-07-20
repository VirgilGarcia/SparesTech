import React from 'react'
import type { ProductField } from '../../services/productService'

interface FieldFormField {
  name: string
  label: string
  type: ProductField['type']
  required: boolean
  options: string[]
  default_value: string
}

interface FieldFormProps {
  field: FieldFormField
  onFieldChange: (field: FieldFormField) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  submitLabel: string
  isEditing?: boolean
}

const FieldForm: React.FC<FieldFormProps> = ({
  field,
  onFieldChange,
  onSubmit,
  onCancel,
  submitLabel,
  isEditing = false
}) => {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...field.options]
    newOptions[index] = value
    onFieldChange({ ...field, options: newOptions })
  }

  const addOption = () => {
    onFieldChange({ ...field, options: [...field.options, ''] })
  }

  const removeOption = (index: number) => {
    const newOptions = field.options.filter((_, i) => i !== index)
    onFieldChange({ ...field, options: newOptions })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Modifier le champ' : 'Ajouter un nouveau champ'}
      </h3>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du champ *
            </label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => onFieldChange({ ...field, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: couleur, taille, poids..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minuscules, sans espaces, commence par une lettre
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label d'affichage *
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onFieldChange({ ...field, label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ex: Couleur, Taille, Poids..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de champ *
          </label>
          <select
            value={field.type}
            onChange={(e) => onFieldChange({ ...field, type: e.target.value as ProductField['type'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Texte</option>
            <option value="number">Nombre</option>
            <option value="textarea">Texte long</option>
            <option value="select">Liste déroulante</option>
            <option value="checkbox">Case à cocher</option>
            <option value="url">URL</option>
          </select>
        </div>

        {field.type === 'select' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options *
            </label>
            <div className="space-y-2">
              {field.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Ajouter une option
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valeur par défaut
          </label>
          <input
            type="text"
            value={field.default_value}
            onChange={(e) => onFieldChange({ ...field, default_value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Valeur par défaut (optionnel)"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={field.required}
            onChange={(e) => onFieldChange({ ...field, required: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="required" className="text-sm text-gray-700">
            Champ obligatoire
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default FieldForm